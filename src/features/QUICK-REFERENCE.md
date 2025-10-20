# Feature Flags - Quick Reference Card

Szybkie przypomnienie najważniejszych funkcji i patternów.

## Import Statements

```ts
// Core functions
import { isFeatureEnabled, isEnabled, getAllFeatures } from '@/features';

// API helpers
import { guardApiFeature, requireApiFeature, isApiFeatureEnabled } from '@/features/api-helpers';

// Astro helpers
import { guardAstroFeature, isAstroFeatureEnabled } from '@/features/astro-helpers';

// Hash utilities (advanced)
import { getUserBucket, isUserInRollout } from '@/features/hash';

// Types
import type { FeatureName, FeatureCheckResult } from '@/features/types';
```

---

## API Endpoint Pattern

```ts
// src/pages/api/your-endpoint.ts
import type { APIContext } from 'astro';
import { guardApiFeature } from '@/features/api-helpers';

export const prerender = false;

export async function POST(context: APIContext) {
  // Guard pattern
  const guardResponse = guardApiFeature(context, 'your-feature', {
    disabledStatus: 503,  // or 404
    disabledMessage: 'Feature unavailable'
  });
  if (guardResponse) return guardResponse;

  // Your logic here
}
```

---

## Astro Page Pattern

```astro
---
// src/pages/your-page.astro
import { guardAstroFeature } from '@/features/astro-helpers';

// Guard pattern
const guardResponse = guardAstroFeature(Astro, 'your-feature', {
  redirectTo: '/404'
});
if (guardResponse) return guardResponse;
---

<html>
  <!-- Your page content -->
</html>
```

---

## Conditional Rendering (Astro)

```astro
---
import { isAstroFeatureEnabled } from '@/features/astro-helpers';

const showFeature = isAstroFeatureEnabled(Astro, 'your-feature');
---

<nav>
  {showFeature && <a href="/feature">Feature Link</a>}
</nav>
```

---

## React Component Pattern

```tsx
import { useState, useEffect } from 'react';
import { isEnabled } from '@/features';

export function MyComponent({ userId }: { userId?: string }) {
  const [canShowFeature, setCanShowFeature] = useState(false);

  useEffect(() => {
    setCanShowFeature(isEnabled('your-feature', { userId }));
  }, [userId]);

  if (!canShowFeature) return null;

  return <div>Feature content</div>;
}
```

---

## Configuration Quick Edit

```ts
// src/features/config.ts
export const featuresConfig: FeaturesConfig = {
  'your-feature': {
    local: {
      enabled: true,
      rolloutPercentage: 100,
    },
    integration: {
      enabled: true,
      rolloutPercentage: 50,
      whitelist: ['user-qa-001'],
    },
    production: {
      enabled: false,
      rolloutPercentage: 0,
    },
  },
};
```

---

## Feature Check Reasons

```ts
const result = isFeatureEnabled('auth', { userId: 'user-123' });

// result.reason може być:
'feature_disabled'    // enabled: false w config
'user_blacklisted'    // User na blacklist
'user_whitelisted'    // User na whitelist
'rollout_included'    // User w zakresie % rollout
'rollout_excluded'    // User poza zakresem % rollout
'no_user_id'         // Brak userId (anonimowy)
```

---

## Rollout Progression Template

```ts
// Week 1: Internal only
production: { enabled: true, rolloutPercentage: 0, whitelist: ['team'] }

// Week 2: 1% beta
production: { enabled: true, rolloutPercentage: 1 }

// Week 3: Progressive
rolloutPercentage: 5   // Day 1-2
rolloutPercentage: 10  // Day 3-5
rolloutPercentage: 25  // Week 2
rolloutPercentage: 50  // Week 3
rolloutPercentage: 100 // Week 4

// Week 6: Cleanup (remove flag from code)
```

---

## Environment Setup

```env
# .env
ENV_NAME=local  # Options: local, integration, production
```

---

## Testing Commands

```bash
# Run all feature flags tests
npm test -- src/features/__tests__

# Run specific test file
npm test -- src/features/__tests__/hash.test.ts

# Run with debug
ENV_NAME=local npm test -- src/features
```

---

## Debug Mode

```ts
// API
guardApiFeature(context, 'auth', { debug: true });

// Astro
guardAstroFeature(Astro, 'auth', { debug: true });

// Output:
// [FeatureFlags API] auth: {
//   enabled: true,
//   reason: 'rollout_included',
//   userId: 'user-123'
// }
```

---

## Check User Bucket (Advanced)

```ts
import { getUserBucket } from '@/features/hash';

const bucket = getUserBucket('user-123', 'auth');
console.log(`User in bucket: ${bucket}%`);
// User in bucket: 42.385%

// If rolloutPercentage = 50 → user included (42 < 50)
// If rolloutPercentage = 40 → user excluded (42 > 40)
```

---

## Kill Switch (Emergency)

```ts
// config.ts
production: {
  enabled: false,  // ← Instant disable
  rolloutPercentage: 0,
}

// Then:
// 1. npm run build
// 2. Deploy
// 3. Feature instantly disabled for all users
```

---

## Common Mistakes

❌ **DON'T:**
```ts
// Sprawdzanie feature bez userId
isEnabled('auth')  // Zwróci false (no_user_id)

// Używanie 100% rollout bez testowania
production: { rolloutPercentage: 100 }  // Niebezpieczne!
```

✅ **DO:**
```ts
// Zawsze przekazuj userId jeśli dostępny
isEnabled('auth', { userId: user?.id })

// Zaczynaj od niskiego rollout
production: { rolloutPercentage: 1 }  // Bezpieczne
```

---

## File Structure

```
src/features/
├── index.ts              # Core logic
├── types.ts              # TypeScript definitions
├── config.ts             # ← EDIT HERE for flag changes
├── hash.ts               # MurmurHash3 implementation
├── api-helpers.ts        # API route helpers
├── astro-helpers.ts      # Astro page helpers
├── README.md             # Full documentation
├── EXAMPLES.md           # Real-world examples
├── MIGRATION-GUIDE.md    # Integration guide
├── QUICK-REFERENCE.md    # This file
└── __tests__/            # Unit tests
```

---

## Key Functions

| Function | Use Case | Returns |
|----------|----------|---------|
| `isFeatureEnabled(name, opts)` | Get full result with reason | `FeatureCheckResult` |
| `isEnabled(name, opts)` | Quick boolean check | `boolean` |
| `getAllFeatures(userId)` | Get all flags status | `Record<FeatureName, FeatureCheckResult>` |
| `guardApiFeature(ctx, name)` | Protect API endpoint | `Response \| null` |
| `guardAstroFeature(Astro, name)` | Protect Astro page | `Response \| null` |
| `getUserBucket(userId, name)` | Get user's rollout bucket | `number` (0-100) |

---

## Support

📖 Full docs: `src/features/README.md`
📝 Examples: `src/features/EXAMPLES.md`
🔧 Migration: `src/features/MIGRATION-GUIDE.md`

---

**Last Updated:** 2025-01-XX
