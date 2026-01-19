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

{@includeCode ./patterns.ts#authenticatedCalls}

## [TODO] Giving errors back to model

- Before app runs: validate inputs in tool call
- After it runs: use `updateModelContext`

{@includeCode ./patterns.ts#errorsToModel}

## [TODO] Support native host styling / use CSS variables

{@includeCode ./patterns.ts#hostStyling}

## [TODO] Reacting to light/dark theme changes

{@includeCode ./patterns.ts#lightDarkTheme}

## [TODO] Support fullscreen / exit fullscreen

{@includeCode ./patterns.ts#fullscreen}

## [TODO] Persist data (incl. widget state)

- Note: OAI's `window.openai.setWidgetState({modelContent, privateContent, imageIds})` has only a partial equivalent in the MCP Apps spec (for now!): `App.updateModelContext({content, structuredContent})`
- For data persistence / to reload when conversation is reloaded, you must use localStorage / IndexedDb with `hostInfo.toolInfo.id` as key returned `CallToolResult._meta.widgetUUID = randomUUID()`

{@includeCode ./patterns.ts#persistData}

## [TODO] Lower perceived latency / manage loading time

Leverage partial inputs to show widgets as possible.

Beware of partial JSON being partial (but healed), so some of your objects may not be complete (e.g. in a list you may need to skip the last item if your code validates input schemas strictly).

{@includeCode ./patterns.ts#lowerPerceivedLatency}

## [TODO] Supporting both iframe & MCP Apps in same binary

See recipe: https://github.com/modelcontextprotocol/ext-apps/issues/34

{@includeCode ./patterns.ts#iframeAndMcpApps}

## [TODO] Migrating from OpenAI to MCP Apps

See [OpenAI -> MCP Apps](https://docs.google.com/document/d/13ROImOR9B8xc32yhqsFyC9Hh3_H63JFORDIyjyIPcU4/edit) migration guide.

Also: [Managing State](https://platform.openai.com/docs/actions/managing-state) (OpenAI)

{@includeCode ./patterns.ts#migrateFromOpenai}
