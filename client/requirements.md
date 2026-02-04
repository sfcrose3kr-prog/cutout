## Packages
(none needed)

## Notes
Uses existing shadcn/ui components already in repo (Calendar, Dialog, Form, Select, Table, Toast, etc.)
All API calls use @shared/routes (api + buildUrl) and include credentials: "include"
Import Excel UI calls POST /api/day-entries/import/excel with optional { replaceAll }
SEO: document.title + meta description set on main page mount
