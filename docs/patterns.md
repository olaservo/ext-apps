---
title: Patterns
---

# MCP Apps Patterns

This document covers common patterns and recipes for building MCP Apps.

## Tools that are private to Apps

Set {@link types!McpUiToolMeta.visibility Tool.\_meta.ui.visibility} to `["app"]` to make tools only callable by Apps (hidden from the model). This is useful for UI-driven actions like updating quantities, toggling settings, or other interactions that shouldn't appear in the model's tool list.

{@includeCode ../src/server/index.examples.ts#registerAppTool_appOnlyVisibility}

## Reading large amounts of data via chunked tool calls

Some host platforms have size limits on tool call responses, so large files (PDFs, images, etc.) cannot be sent in a single response. Use an app-only tool with chunked responses to bypass these limits while keeping the data out of model context.

**Server-side**: Register an app-only tool that returns data in chunks with pagination metadata:

{@includeCode ./patterns.tsx#chunkedDataServer}

**Client-side**: Loop calling the tool until all chunks are received:

{@includeCode ./patterns.tsx#chunkedDataClient}

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

## Passing contextual information from the App to the Model

Use {@link app!App.updateModelContext updateModelContext} to keep the model informed about what the user is viewing or interacting with. Structure the content with YAML frontmatter for easy parsing:

{@includeCode ../src/app.examples.ts#App_updateModelContext_appState}

## Sending large follow-up messages

When you need to send more data than fits in a message, use {@link app!App.updateModelContext updateModelContext} to set the context first, then {@link app!App.sendMessage sendMessage} with a brief prompt to trigger a response:

{@includeCode ../src/app.examples.ts#App_sendMessage_withLargeContext}

## Persisting widget state

To persist widget state across conversation reloads (e.g., current page in a PDF viewer, camera position in a map), use [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) with a stable identifier provided by the server.

**Server-side**: Tool handler generates a unique `widgetUUID` and returns it in `CallToolResult._meta.widgetUUID`:

{@includeCode ./patterns.tsx#persistDataServer}

**Client-side**: Receive the UUID in {@link app!App.ontoolresult ontoolresult} and use it as the storage key:

{@includeCode ./patterns.tsx#persistData}

> **Note:** For model-visible state (informing the LLM about what the user is viewing), use {@link app!App.updateModelContext updateModelContext} instead. Widget state persistence is for UI state that should survive page reloads but doesn't need to be seen by the model.

## Pausing computation-heavy widgets when out of view

Widgets with animations, WebGL rendering, or polling can consume significant CPU/GPU even when scrolled out of view. Use [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to pause expensive operations when the widget isn't visible:

{@includeCode ./patterns.tsx#visibilityBasedPause}

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
