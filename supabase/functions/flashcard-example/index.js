// Generates (and caches) a worked example with substituted numbers for a flashcard's
// formula — Premium-only content (docs/plans/freemium-paywall-v2.md, decision 5).
// Global cache keyed by card content: the same formula card produces the same
// worked example for every Premium user, so this only ever calls OpenAI once per
// distinct card, not once per request.
//
// Plain JS, not TypeScript — see solve/index.js for why.

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decodeJwt(authHeader) {
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function sbFetch(path, init) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      ...(init?.headers || {}),
    },
  });
  return response;
}

async function isPremium(userId) {
  const response = await sbFetch("/rest/v1/rpc/is_user_premium", {
    method: "POST",
    body: JSON.stringify({ p_user_id: userId }),
  });
  if (!response.ok) return false;
  return await response.json();
}

async function getCached(cardKey) {
  const response = await sbFetch(
    `/rest/v1/flashcard_worked_examples?card_key=eq.${encodeURIComponent(cardKey)}&select=worked_example`,
    { method: "GET" }
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0]?.worked_example ?? null;
}

async function setCached(cardKey, workedExample) {
  await sbFetch("/rest/v1/flashcard_worked_examples", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ card_key: cardKey, worked_example: workedExample }),
  });
}

async function generateWorkedExample(front, back, tag) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You write one short worked example for a math flashcard, showing the formula used with real substituted numbers, solved to a final answer. Plain text only, no LaTeX/markdown. 3-5 lines. Respond with ONLY the worked example text, no preamble.`,
          },
          {
            role: "user",
            content: `Card: "${front}" (${tag})\nFormula: ${back}\n\nWrite one concrete worked example using this formula with specific numbers.`,
          },
        ],
      }),
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error("OpenAI error " + response.status);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty response from AI.");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!OPENAI_API_KEY) throw new Error("Server misconfigured: OPENAI_API_KEY not set.");

    const claims = decodeJwt(req.headers.get("Authorization"));
    if (!claims || claims.role !== "authenticated") {
      return new Response(JSON.stringify({ error: "Sign in required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!(await isPremium(claims.sub))) {
      return new Response(JSON.stringify({ error: "Premium required." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { front, back, tag } = await req.json();
    if (!front || !back) {
      return new Response(JSON.stringify({ error: "Missing card fields." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Keyed by the card's own content, not a category — front text is unique across
    // the current static card set (src/data/practiceData.js) and this only needs to
    // dedupe, not be a true foreign key.
    const cardKey = `${slugify(front)}__${slugify(back).slice(0, 40)}`;

    const cached = await getCached(cardKey);
    if (cached) {
      return new Response(JSON.stringify({ workedExample: cached, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const workedExample = await generateWorkedExample(front, back, tag);
    await setCached(cardKey, workedExample);

    return new Response(JSON.stringify({ workedExample, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
