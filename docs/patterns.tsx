/**
 * Type-checked code examples for the patterns documentation.
 *
 * These examples are included in {@link ./patterns.md} via `@includeCode` tags.
 * Each function's region markers define the code snippet that appears in the docs.
 *
 * @module
 */

import { App } from "../src/app.js";
import {
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
} from "../src/styles.js";
import type { McpUiHostContext } from "../src/types.js";
import { useApp, useHostStyles } from "../src/react/index.js";

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
 * Example: Unified host styling (theme, CSS variables, fonts)
 */
function hostStylingVanillaJs(app: App) {
  //#region hostStylingVanillaJs
  function applyHostContext(ctx: McpUiHostContext) {
    if (ctx.theme) {
      applyDocumentTheme(ctx.theme);
    }
    if (ctx.styles?.variables) {
      applyHostStyleVariables(ctx.styles.variables);
    }
    if (ctx.styles?.css?.fonts) {
      applyHostFonts(ctx.styles.css.fonts);
    }
  }

  // Apply when host context changes
  app.onhostcontextchanged = applyHostContext;

  // Apply initial styles after connecting
  app.connect().then(() => {
    const ctx = app.getHostContext();
    if (ctx) {
      applyHostContext(ctx);
    }
  });
  //#endregion hostStylingVanillaJs
}

/**
 * Example: Host styling with React (CSS variables, theme, fonts)
 */
function hostStylingReact() {
  //#region hostStylingReact
  function MyApp() {
    const { app } = useApp({
      appInfo: { name: "MyApp", version: "1.0.0" },
      capabilities: {},
    });

    // Apply all host styles (variables, theme, fonts)
    useHostStyles(app, app?.getHostContext());

    return (
      <div
        style={{
          background: "var(--color-background-primary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p>Styled with host CSS variables and fonts</p>
        <p className="theme-aware">Uses [data-theme] selectors</p>
      </div>
    );
  }
  //#endregion hostStylingReact
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
void hostStylingVanillaJs;
void hostStylingReact;
void persistData;
void iframeAndMcpApps;
void migrateFromOpenai;
