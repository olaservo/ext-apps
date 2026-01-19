---
title: Patterns
---

# MCP Apps Patterns

This document covers common patterns and recipes for building MCP Apps.

## Tools that are private to Apps

Set {@link types!McpUiToolMeta.visibility Tool.\_meta.ui.visibility} to `["app"]` to make tools only callable by Apps (hidden from the model). This is useful for UI-driven actions like updating quantities, toggling settings, or other interactions that shouldn't appear in the model's tool list.

{@includeCode ../src/server/index.examples.ts#registerAppTool_appOnlyVisibility}

## [TODO] Authenticated calls from App

- Use tool calls / read resources
  - See [PDF example](https://github.com/modelcontextprotocol/ext-apps/blob/main/examples/pdf-viewer) to read binaries by chunks to avoid call tool size limitations on platforms like claude.ai
- Pass auth token in `_meta` (will be loaded again in the future) + refresh token + store in local storage (see Persist data section below)

{@includeCode ./patterns.tsx#authenticatedCalls}

## Giving errors back to model

**Server-side**: Tool handler validates inputs and returns `{ isError: true, content: [...] }`. The model receives this error through the normal tool call response.

**Client-side**: If a runtime error occurs (e.g., API failure, permission denied, resource unavailable), use {@link app!App.updateModelContext updateModelContext} to inform the model:

{@includeCode ../src/app.examples.ts#App_updateModelContext_reportError}

## Matching host styling (CSS variables, theme, and fonts)

Use the SDK's style helpers to apply host styling, then reference them in your CSS:

- **CSS variables** — Use `var(--color-background-primary)`, etc. in your CSS
- **Theme** — Use `[data-theme="dark"]` selectors or `light-dark()` function for theme-aware styles
- **Fonts** — Use `var(--font-sans)` or `var(--font-mono)` with fallbacks (e.g., `font-family: var(--font-sans, system-ui, sans-serif)`)

**Vanilla JS:**

{@includeCode ./patterns.tsx#hostStylingVanillaJs}

**React:**

{@includeCode ./patterns.tsx#hostStylingReact}

## Entering / Exiting fullscreen

Toggle fullscreen mode by calling {@link app!App.requestDisplayMode requestDisplayMode}:

{@includeCode ../src/app.examples.ts#App_requestDisplayMode_toggle}

Listen for display mode changes via {@link app!App.onhostcontextchanged onhostcontextchanged} to update your UI:

{@includeCode ../src/app.examples.ts#App_onhostcontextchanged_respondToDisplayMode}

## [TODO] Persist data (incl. widget state)

- Note: OAI's `window.openai.setWidgetState({modelContent, privateContent, imageIds})` has only a partial equivalent in the MCP Apps spec (for now!): `App.updateModelContext({content, structuredContent})`
- For data persistence / to reload when conversation is reloaded, you must use localStorage / IndexedDb with `hostInfo.toolInfo.id` as key returned `CallToolResult._meta.widgetUUID = randomUUID()`

{@includeCode ./patterns.tsx#persistData}

## Lowering perceived latency

Use {@link app!App.ontoolinputpartial ontoolinputpartial} to receive streaming tool arguments as they arrive, allowing you to show a loading preview before the complete input is available.

{@includeCode ../src/app.examples.ts#App_ontoolinputpartial_progressiveRendering}

> [!IMPORTANT]
> Partial arguments are "healed" JSON — the host closes unclosed brackets/braces to produce valid JSON. This means objects may be incomplete (e.g., the last item in an array may be truncated). Don't rely on partial data for critical operations; use it only for preview UI.

## [TODO] Supporting both iframe & MCP Apps in same binary

See recipe: https://github.com/modelcontextprotocol/ext-apps/issues/34

{@includeCode ./patterns.tsx#iframeAndMcpApps}

## [TODO] Migrating from OpenAI to MCP Apps

See [OpenAI -> MCP Apps](https://docs.google.com/document/d/13ROImOR9B8xc32yhqsFyC9Hh3_H63JFORDIyjyIPcU4/edit) migration guide.

Also: [Managing State](https://platform.openai.com/docs/actions/managing-state) (OpenAI)

{@includeCode ./patterns.tsx#migrateFromOpenai}
