## Apply Instructions for Codex

This patch introduces a modular rendering pipeline for GestaltView.  Follow
these steps precisely to integrate it into the existing monorepo without
overwriting unrelated code.  The goal is to **extend** the current system, not
to rewrite it.

1. **Copy Files into the Repository.**  Create a new folder called
   `shared/rendering` at the same level as `shared/codex`.  Copy all files
   under `gestaltview-rendering-v0/shared/rendering/` into that folder.  Also
   copy `api/render/decide.ts`, `client/src/lib/renderingClient.ts`,
   `tests/rendering/decide.test.ts`, `SPEC_Rendering_Integration.md`, and
   `README.md` into appropriate locations in the repo.  Do not overwrite
   existing files.

2. **Add Path Aliases.**  In `tsconfig.json`, add a path alias for the
   rendering namespace:

   ```json
   {
     "compilerOptions": {
       "paths": {
         "@shared/rendering/*": ["shared/rendering/*"],
         // existing aliases ...
       }
     }
   }
   ```

3. **Register the API Route.**  If using Vercel style API routes, create a
   file at `api/render/decide.ts` by copying the provided one.  Ensure this
   route exports a default handler that calls the dispatcher defined in
   `shared/rendering/index.ts`.

4. **Expose Renderer Exports.**  In the root `shared/index.ts` (or wherever
   you aggregate shared modules), re‑export the renderers from
   `@shared/rendering` so that other packages can import them as needed.

5. **Update Codex Contracts.**  Extend the Codex contract schema to allow
   additional export formats (`pdf`, `html`, `png`, `wav`, etc.) for each
   artifact kind.  This ensures that the front end will surface the new
   formats to users.

6. **Install Dependencies.**  Add the following packages to
   `package.json`:

   ```bash
   npm install --save marked remark remark-html puppeteer pdf-lib slidev
   # For Playwright replace puppeteer if desired:
   # npm install --save playwright
   ```

   For audio rendering, choose and install a TTS library or provide a service
   endpoint; the stub includes placeholders for implementation.

7. **Integrate with Creation Corner.**  Modify the `CreationCornerPage` so
   that after synthesis it calls the `renderArtifact` helper (imported from
   `client/src/lib/renderingClient.ts`) to obtain a preview.  Display a
   loading spinner while the render is in progress and only reveal the
   finished output when ready.

8. **Run Tests.**  Execute `npm test` or `pnpm vitest run` to run the new
   tests.  Ensure that the dispatch logic works and that unsupported formats
   raise appropriate errors.

9. **Do Not Alter Unrelated Files.**  Avoid rewriting or deleting existing
   code in the `gestaltview-v2.0` repository.  If conflicts arise, prefer
   merging the new functionality alongside the current code rather than
   replacing it.

Following these instructions will introduce a flexible rendering layer to
GestaltView without disrupting the current synthesis pipeline.