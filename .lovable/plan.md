

## Plan: Use team colors for gradients in /print route

### Change: `src/pages/Print.tsx`

The `gradientLeftColor` and `gradientRightColor` props are hardcoded to `#000000`. Since `homeTeam` and `awayTeam` are already resolved with their `color` field, simply pass those colors instead:

```typescript
gradientLeftColor={homeTeam?.color || "#000000"}
gradientRightColor={awayTeam?.color || "#000000"}
panelLeftColor={homeTeam?.color || "#000000"}
panelRightColor={awayTeam?.color || "#000000"}
```

Also support the `modelo` query param to conditionally show "Som Ambiente":
- Read `modelo` from search params
- Pass `showSomAmbiente={modelo === 'sem narracao'}` (currently always `true`, which is correct for this case but should be driven by the param)

Single file change, 4 lines updated.

