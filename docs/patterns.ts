/**
 * Type-checked code examples for the patterns documentation.
 *
 * These examples are included in {@link ./patterns.md} via `@includeCode` tags.
 * Each function's region markers define the code snippet that appears in the docs.
 *
 * @module
 */

import { App } from "../src/app.js";

/**
 * Example: Authenticated calls from App
 */
function authenticatedCalls(app: App) {
  //#region authenticatedCalls
  // TODO: Use tool calls / read resources
  // See PDF example to read binaries by chunks
  // Pass auth token in _meta + refresh token + store in local storage
  //#endregion authenticatedCalls
}

/**
 * Example: Giving errors back to model
 */
function errorsToModel(app: App) {
  //#region errorsToModel
  // Before app runs: validate inputs in tool call
  // After it runs: updateModelContext
  // TODO: Complete implementation
  //#endregion errorsToModel
}

/**
 * Example: Support native host styling / use CSS variables
 */
function hostStyling() {
  //#region hostStyling
  // TODO: Implement host styling support via CSS variables
  //#endregion hostStyling
}

/**
 * Example: Reacting to light/dark theme changes
 */
function lightDarkTheme(app: App) {
  //#region lightDarkTheme
  const applyTheme = (theme: string) => {
    document.documentElement.dataset.theme = theme;
  };

  applyTheme(app.getHostContext()?.theme ?? "light");
  app.onhostcontextchanged = (params) => {
    if (params.theme) applyTheme(params.theme);
  };
  //#endregion lightDarkTheme
}

/**
 * Example: Support fullscreen / exit fullscreen
 */
function fullscreen() {
  //#region fullscreen
  // TODO: Implement fullscreen support
  //#endregion fullscreen
}

/**
 * Example: Persist data (incl. widget state)
 */
function persistData(app: App) {
  //#region persistData
  // Note: OAI's window.openai.setWidgetState({modelContent, privateContent, imageIds})
  // has only a partial equivalent in MCP Apps: App.updateModelContext({content, structuredContent})
  // For data persistence / to reload when conversation is reloaded,
  // use localStorage / IndexedDb with hostInfo.toolInfo.id as key
  // returned CallToolResult._meta.widgetUUID = randomUUID()
  // TODO: Complete implementation
  //#endregion persistData
}

/**
 * Example: Lower perceived latency / manage loading time
 */
function lowerPerceivedLatency(app: App) {
  //#region lowerPerceivedLatency
  // TODO: Leverage partial inputs to show widgets as possible.
  // Beware of partial JSON being partial (but healed),
  // so some objects may not be complete.
  //#endregion lowerPerceivedLatency
}

/**
 * Example: Supporting both iframe & MCP Apps in same binary
 */
function iframeAndMcpApps() {
  //#region iframeAndMcpApps
  // TODO: See recipe: https://github.com/modelcontextprotocol/ext-apps/issues/34
  //#endregion iframeAndMcpApps
}

/**
 * Example: Migrating from OpenAI to MCP Apps
 */
function migrateFromOpenai() {
  //#region migrateFromOpenai
  // TODO: See OpenAI -> MCP Apps migration guide
  // https://docs.google.com/document/d/13ROImOR9B8xc32yhqsFyC9Hh3_H63JFORDIyjyIPcU4/edit
  //#endregion migrateFromOpenai
}

// Suppress unused variable warnings
void authenticatedCalls;
void errorsToModel;
void hostStyling;
void lightDarkTheme;
void fullscreen;
void persistData;
void lowerPerceivedLatency;
void iframeAndMcpApps;
void migrateFromOpenai;
