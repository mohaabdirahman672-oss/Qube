# Qube — Supabase + Server-Side OpenAI Plan
**Created:** 2026-06-04  
**Scope:** Replace AsyncStorage + hardcoded API key with Supabase (data persistence + auth) and a server-side OpenAI proxy  
**Out of scope:** Paywall, subscriptions, notifications, social features

---

## Goals

| Goal | Why |
|---|---|
| Move OpenAI key off the client | Key is currently hardcoded in `preview.html` and read from `.env` in RN — both are client-exposed |
| Persist saved problems server-side | AsyncStorage is device-local; user loses saves when reinstalling or switching devices |
| Link saves to user accounts | Currently anonymous — no concept of "whose saves" |
| Replace Firebase with one backend | Firebase Auth + Supabase data = two SDKs; Supabase Auth handles Google + Apple natively |

---

## Architecture Decision: Firebase vs Supabase Auth

**Current:** Firebase Auth (Google + Apple Sign-In), `AuthContext.js` complete but not mounted  
**Proposed:** Replace Firebase Auth with Supabase Auth

| | Firebase Auth | Supabase Auth |
|---|---|---|
| Google Sign-In | ✓ (via `@react-native-google-signin`) | ✓ (same flow) |
| Apple Sign-In | ✓ (iOS only) | ✓ (iOS only) |
| RLS integration | Needs separate Supabase JWT sync | Built-in — auth.uid() works in RLS policies |
| SDK count | 2 (firebase + supabase) | 1 (supabase only) |
| Recommendation | Remove | **Use this** |

**Decision:** Switch to Supabase Auth. Remove firebase dependency. Rewrite `AuthContext.js` using `@supabase/supabase-js`.

---

## Supabase Schema

### Table: `saved_problems`

```sql
create table saved_problems (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  problem_type text,
  difficulty   text,
  answer       text,
  explanation  text,
  steps        jsonb,
  saved_at     timestamptz default now()
);

-- Users can only read/write their own rows
alter table saved_problems enable row level security;

create policy "Users manage own saves"
  on saved_problems for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Table: `practice_progress` (optional, Phase 2)

```sql
create table practice_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  category     text not null,
  cards_seen   int default 0,
  problems_done int default 0,
  updated_at   timestamptz default now(),
  unique(user_id, category)
);

alter table practice_progress enable row level security;

create policy "Users manage own progress"
  on practice_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## Supabase Edge Function: `solve`

The Edge Function runs on Supabase's Deno runtime. The OpenAI API key is stored as a Supabase secret (never shipped to the client).

### Request

```
POST https://<project>.supabase.co/functions/v1/solve
Authorization: Bearer <supabase_user_jwt>
Content-Type: application/json

{
  "text": "Solve: x² - 5x + 6 = 0"
}
```

or (image mode):

```json
{
  "imageBase64": "<base64_string>",
  "imageMimeType": "image/jpeg"
}
```

### Response (success)

```json
{
  "hasMath": true,
  "problemType": "Quadratic Equation",
  "difficulty": "Medium",
  "steps": [...],
  "answer": "x = 2 or x = 3",
  "explanation": "...",
  "commonMistake": "...",
  "formula": "...",
  "practiceQuestion": "..."
}
```

### Edge Function code (`supabase/functions/solve/index.ts`)

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Verify user is authenticated
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return new Response('Unauthorized', { status: 401 })

  const { text, imageBase64, imageMimeType } = await req.json()

  // Build messages
  let messages
  if (text) {
    messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Solve this problem:\n\n' + text }
    ]
  } else if (imageBase64) {
    const dataUrl = `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`
    messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: [
        { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
        { type: 'text', text: 'Solve the math problem in this image.' }
      ]}
    ]
  } else {
    return new Response(JSON.stringify({ error: 'No input' }), { status: 400 })
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
    body: JSON.stringify({ model: 'gpt-4o', max_tokens: 2000, messages })
  })

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content ?? ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return new Response(JSON.stringify({ error: 'Parse failed' }), { status: 500 })

  return new Response(jsonMatch[0], {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
```

---

## Files to Create

| File | Purpose |
|---|---|
| `supabase/functions/solve/index.ts` | Edge Function — server-side OpenAI proxy |
| `supabase/functions/_shared/cors.ts` | Shared CORS headers for all Edge Functions |
| `src/lib/supabase.js` | Supabase client (replaces `firebase.js`) |
| `src/context/AuthContext.js` | Rewrite — Supabase Auth (Google + Apple) |

## Files to Edit

| File | What changes |
|---|---|
| `src/services/solveApi.js` | Change from direct OpenAI fetch → POST to `/functions/v1/solve` with Supabase auth token |
| `src/screens/SolveScreen.js` | `saveResult()` — write to `saved_problems` table instead of AsyncStorage |
| `src/screens/SavedScreen.js` | Read from `saved_problems` table instead of AsyncStorage |
| `src/screens/ProfileScreen.js` | Show Supabase auth user name/email; `savedCount` from Supabase |
| `App.js` | Wire `NavigationContainer` to show `LoginScreen` when no Supabase session |
| `package.json` | Add `@supabase/supabase-js`; remove `firebase` and related auth packages |
| `app.json` | Remove Firebase plugins; add Supabase URL/anon key as env vars |

## Files to Remove

| File | Reason |
|---|---|
| `src/lib/firebase.js` | Replaced by `src/lib/supabase.js` |
| `src/lib/googleSignIn.js` | Supabase Auth handles Google via `supabase.auth.signInWithOAuth` |
| `src/lib/googleSignIn.native.js` | Same |
| `src/lib/appleAuth.js` | Supabase Auth handles Apple via `supabase.auth.signInWithOAuth` |
| `src/lib/appleAuth.ios.js` | Same |
| `courses_data.js` (optional) | 137 KB file no longer used by active UI |

---

## Client Changes: `src/lib/supabase.js`

```js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,       // persist session across app restarts
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
})
```

## Client Changes: `src/services/solveApi.js`

Replace the direct `fetch('https://api.openai.com/...')` call with:

```js
import { supabase } from '../lib/supabase'

export async function solveMathProblem({ text, imageBase64, imageMimeType }) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in.')

  const { data, error } = await supabase.functions.invoke('solve', {
    body: { text, imageBase64, imageMimeType }
  })
  if (error) throw error
  return data
}
```

The OpenAI key never leaves the server. The client only sends the user JWT.

---

## Auth Flow Change

### Current (no auth gate — always shows HomeScreen)
```
App.js
└── AppNavigator (always)
    └── HomeScreen, SavedScreen, SolveScreen, PracticeScreen, ProfileScreen
```

### After Supabase Auth
```
App.js
└── AuthProvider (Supabase session listener)
    ├── loading=true  → SplashScreen
    ├── user=null     → LoginScreen (Google + Apple)
    └── user=present  → AppNavigator (all 5 tabs)
```

`App.js` will use the `user` from `AuthContext` to conditionally render `LoginScreen` vs `AppNavigator`. `LoginScreen.js` already has the UI built — only the handlers need updating to call `supabase.auth.signInWithOAuth`.

---

## Risks

| Risk | Mitigation |
|---|---|
| `@react-native-google-signin` required for native Google OAuth on device | Keep the package; Supabase can use it as a credential provider the same way Firebase did |
| Apple Sign-In requires `@invertase/react-native-apple-authentication` on iOS | Keep the package; same pattern as Firebase |
| EAS dev build required for native auth | Document clearly — all auth works in no-Supabase mode (mock user) for local development |
| RLS policy misconfiguration could expose data | Test policies in Supabase dashboard SQL editor before shipping |
| Edge Function cold start adds ~200ms latency on first call | Acceptable; Edge Functions stay warm after first call in a session |
| `courses_data.js` removal could break something unexpected | Grep for any remaining references before deleting |

---

## Environment Variables Required

```
# .env (client-side — safe to expose)
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase project secrets (server-side — never exposed)
OPENAI_API_KEY=sk-proj-...
```

The current `EXPO_PUBLIC_OPENAI_API_KEY` in `.env` becomes a Supabase secret and is removed from client environment.

---

## Implementation Order

1. Create Supabase project, run schema SQL, set `OPENAI_API_KEY` secret
2. Deploy `solve` Edge Function, test via curl
3. Install `@supabase/supabase-js`, create `src/lib/supabase.js`
4. Rewrite `AuthContext.js` for Supabase Auth (keep Google + Apple flow, same hook API)
5. Update `App.js` — auth gate (LoginScreen vs AppNavigator)
6. Update `solveApi.js` — proxy via Edge Function
7. Migrate `SavedScreen` + `SolveScreen` save logic → Supabase table
8. Update `ProfileScreen` — show user email from Supabase session
9. Remove Firebase SDK and related lib files
10. Test end-to-end on device via EAS dev build

---

## Testing Strategy

1. `supabase functions serve solve` — test Edge Function locally with curl
2. Sign in with Google on device (EAS dev build required)
3. Solve a problem → verify it appears in Supabase dashboard `saved_problems` table
4. Sign in on a second device → verify saves are synced
5. Sign out → verify `LoginScreen` appears
6. Sign in again → verify saves are still there (server-persisted)
