// Proxies the math-solve request to OpenAI so the API key never ships in the client bundle.
// verify_jwt = true (see ../../config.toml) means Supabase rejects unauthenticated callers
// before this code runs — only a signed-in app user's session can reach here.
import "@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const SYSTEM_PROMPT = `You are Qube, an expert math tutor. Solve math problems step by step.

You handle: arithmetic, algebra, equations, inequalities, systems of equations, factoring, expanding, simplifying, functions, geometry, trigonometry, logarithms, exponents, calculus (derivatives, integrals, limits), probability, statistics, and word problems.

Respond ONLY with a valid JSON object using this exact structure:
{
  "hasMath": true,
  "problemType": "Quadratic Equation",
  "difficulty": "Medium",
  "steps": [
    { "title": "Verb-led title (3-6 words)", "body": "Full explanation of this step showing all work" }
  ],
  "answer": "Final answer (concise)",
  "explanation": "One sentence summary of the method or technique used",
  "commonMistake": "The single most common error students make on this problem type",
  "formula": "Key formula used — omit this field entirely if none applies",
  "practiceQuestion": "A similar follow-up problem at the same difficulty for the student to try"
}

If no math problem is found:
{ "hasMath": false, "message": "Brief description of what you see instead" }

Rules:
- Plain text only — no LaTeX, no markdown, no special symbols except standard math operators
- difficulty must be exactly: Easy, Medium, Hard, or Advanced
- Step titles: short (3-6 words), verb-led — e.g. "Identify the coefficients", "Apply the formula"
- Step bodies: show every calculation clearly, educational tone
- Always include practiceQuestion`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callOpenAI(messages: unknown, isRetry = false): Promise<any> {
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
      body: JSON.stringify({ model: "gpt-4o", max_tokens: 2000, messages }),
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
      throw new Error(err.error?.message || "Error " + response.status);
    }
    return await response.json();
  } catch (e) {
    clearTimeout(timeout);
    if ((e as Error).name === "AbortError") throw new Error("Request timed out. Please try again.");
    if (!isRetry) return callOpenAI(messages, true);
    throw e;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!OPENAI_API_KEY) throw new Error("Server misconfigured: OPENAI_API_KEY not set.");

    const { text, imageBase64, imageMimeType } = await req.json();
    let messages;

    if (text) {
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Solve this problem:\n\n" + text },
      ];
    } else if (imageBase64) {
      const dataUrl = `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}`;
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            { type: "text", text: "Solve the math problem shown in this image. If no math problem is visible, say so." },
          ],
        },
      ];
    } else {
      throw new Error("No input provided.");
    }

    const data = await callOpenAI(messages);
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response from AI.");

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response. Please try again.");

    const result = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. `supabase secrets set --env-file ./supabase/.env.local OPENAI_API_KEY=sk-...` (or export it before `supabase functions serve`)
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/solve' \
    --header 'Authorization: Bearer <a real user access token or the anon key>' \
    --header 'Content-Type: application/json' \
    --data '{"text":"2x + 3 = 7"}'

*/
