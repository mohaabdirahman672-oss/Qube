# TypeScript Migration Strategy

**Owner:** technical-researcher
**Status:** Pending

---

## Current State
- All files are `.js`
- No TypeScript config exists
- Stack: React Native + Expo SDK 54

## Research Areas
- Incremental migration strategy (`.js` → `.tsx` file by file vs. all at once)
- `tsconfig.json` recommended config for Expo SDK 54
- Type definitions needed: `@types/react`, `@types/react-native`, Supabase generated types
- Common React Native TypeScript patterns (navigation types, component props, theme types)
- Estimated effort and risk
- Whether to migrate before or after core features are built

## Recommendation Format
- Approach (incremental vs. big bang)
- Order of files to migrate
- Required packages
- Estimated time
