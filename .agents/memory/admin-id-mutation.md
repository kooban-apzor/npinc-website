---
name: Admin mutations use id not slug
description: All admin CRUD update/delete operations use numeric id, not slug.
---

## Rule
Admin PUT and DELETE routes use `/:id` (numeric) as the URL parameter. Admin page modal state must store `id: number`, not `slug`.

## Why
The generated Orval hooks (after OpenAPI spec update) expect `{ id: number, data: ... }` for updates and `{ id: number }` for deletes. The original admin pages tracked `slug` in modal state and called `mutate({ slug, data })` — this broke after the spec was corrected to use numeric ids.

## How to apply
- In admin page modal state: `{ mode: "create" | "edit"; id?: number; form: Form }`
- In `openEdit`: set `id: item.id` (not `slug`)
- In `handleSave` (edit branch): `mutation.mutate({ id: modal.id!, data })`
- In `handleDelete`: `mutation.mutate({ id })` — pass the numeric id from the list item
- Delete button onClick: `() => handleDelete(item.id)` not `item.slug`
- Affected admin pages: AdminServices, AdminPeople, AdminArticles, AdminEvents, AdminVacancies
