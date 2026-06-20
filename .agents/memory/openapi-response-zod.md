---
name: OpenAPI Zod response parsing
description: Why you must not use generated Zod schemas to .parse() DB row responses in Express routes.
---

## Rule
Never call `XxxResponse.parse(rows)` on DB query results in Express route handlers.

## Why
Drizzle ORM returns:
- JavaScript `Date` objects for `timestamp` columns — Zod schemas from OpenAPI spec expect `string`.
- `null` for nullable columns — Zod schemas expect `string` or `array` (not `null`).
This causes ZodError 500s on every GET endpoint.

## How to apply
- Use `res.json(rows)` directly — `JSON.stringify` auto-converts `Date → ISO string`, nulls pass through.
- Keep Zod validation on **request bodies** (`.safeParse(req.body)`) — that's where it adds real value.
- Response types are already guaranteed by Drizzle TypeScript types; server-side response Zod parsing is redundant.
- If you need strict response validation later, update the OpenAPI spec with `nullable: true` and re-run codegen before re-adding `.parse()` calls.
