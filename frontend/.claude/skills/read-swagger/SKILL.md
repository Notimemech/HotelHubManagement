---
name: read-swagger
description: "Fetch and summarize Swagger/OpenAPI docs from a URL, local Swagger UI page, swagger-json endpoint, or OpenAPI JSON file."
argument-hint: "[swagger-url-or-file]"
allowed-tools:
  - PowerShell(node .claude/skills/read-swagger/fetch-swagger.js *)
  - Read
---

# Read Swagger / OpenAPI

Use this skill when the user asks to read API documentation from Swagger/OpenAPI, inspect available backend endpoints, summarize request/response DTOs, or connect the frontend to an API described by Swagger.

## Arguments

- `$ARGUMENTS` — a Swagger/OpenAPI URL or local file path.
  - Example URL: `http://localhost:3618/swagger/`
  - Example JSON endpoint: `http://localhost:3618/swagger-json`
  - Example file: `swagger.json`

## What to do

1. Identify the Swagger/OpenAPI source from `$ARGUMENTS`.
   - If no argument is provided, ask the user for the Swagger URL or OpenAPI JSON file path.
2. If the source is a URL, fetch the spec with the helper script:

   ```powershell
   node .claude/skills/read-swagger/fetch-swagger.js <swagger-url> > swagger.generated.json
   ```

   The helper supports:
   - Direct OpenAPI JSON endpoints.
   - NestJS default `/swagger-json` endpoints.
   - Swagger UI pages like `/swagger/` that embed `swagger-ui-init.js`.
   - Swagger UI pages where the OpenAPI spec is embedded as `swaggerDoc`.

3. If the source is a local JSON file, read it directly with the Read tool.
4. Summarize the API clearly:
   - API title, version, and base URL if available.
   - All paths grouped by tag or resource.
   - HTTP method and route.
   - Operation summary / operationId.
   - Required auth/security.
   - Query/path parameters.
   - Request body schema.
   - Response status codes and schemas.
   - Component schemas / DTOs.
5. If the user asks to connect the frontend to the API, inspect the existing API client files and implement services/types using the project's current patterns.
6. If the user asks to generate types, create TypeScript interfaces/types from `components.schemas`.

## Output format

Prefer concise but complete Markdown:

```markdown
## API Summary
- Title:
- Version:
- Server/Base URL:

## Endpoints
### POST /auth/login
- Summary:
- Auth:
- Request:
- Response:

## Schemas
### LoginRequestDto
- username: string, required
- password: string, required
```

## Notes

- For `localhost` Swagger URLs, do not use WebFetch; use the PowerShell/Node helper because WebFetch cannot access the user's local machine.
- If the fetch fails, try common fallback endpoints manually: `/swagger-json`, `/swagger/v1/swagger.json`, `/swagger.json`, `/api-docs`, `/api/docs`.
- Do not assume the frontend base URL; verify the existing HTTP client or environment files first.
