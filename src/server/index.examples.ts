/**
 * Type-checked examples for {@link registerAppTool} and {@link registerAppResource}.
 *
 * These examples are included in the API documentation via `@includeCode` tags.
 * Each function's region markers define the code snippet that appears in the docs.
 *
 * @module
 */

import * as fs from "node:fs/promises";
import type {
  McpServer,
  ToolCallback,
  ReadResourceCallback,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "./index.js";

// Stubs for external functions used in examples
declare function fetchWeather(
  location: string,
): Promise<{ temp: number; conditions: string }>;
declare function getCart(): Promise<{ items: unknown[]; total: number }>;
declare function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<{ items: unknown[]; total: number }>;

/**
 * Example: Module overview showing basic registration of tools and resources.
 */
function index_overview(
  server: McpServer,
  toolCallback: ToolCallback,
  readCallback: ReadResourceCallback,
) {
  //#region index_overview
  // Register a tool that displays a widget
  registerAppTool(
    server,
    "weather",
    {
      description: "Get weather forecast",
      _meta: { ui: { resourceUri: "ui://weather/widget.html" } },
    },
    toolCallback,
  );

  // Register the HTML resource the tool references
  registerAppResource(
    server,
    "Weather Widget",
    "ui://weather/widget.html",
    {},
    readCallback,
  );
  //#endregion index_overview
}

/**
 * Example: Basic usage of registerAppTool with input schema and handler.
 */
function registerAppTool_basicUsage(server: McpServer) {
  //#region registerAppTool_basicUsage
  registerAppTool(
    server,
    "get-weather",
    {
      title: "Get Weather",
      description: "Get current weather for a location",
      inputSchema: { location: z.string() },
      _meta: {
        ui: { resourceUri: "ui://weather/widget.html" },
      },
    },
    async (args) => {
      const weather = await fetchWeather(args.location);
      return { content: [{ type: "text", text: JSON.stringify(weather) }] };
    },
  );
  //#endregion registerAppTool_basicUsage
}

/**
 * Example: Tool visibility - create app-only tools for UI actions.
 */
function registerAppTool_toolVisibility(server: McpServer) {
  //#region registerAppTool_toolVisibility
  // Main tool - visible to both model and app (default)
  registerAppTool(
    server,
    "show-cart",
    {
      description: "Display the user's shopping cart",
      _meta: {
        ui: {
          resourceUri: "ui://shop/cart.html",
          visibility: ["model", "app"],
        },
      },
    },
    async () => {
      const cart = await getCart();
      return { content: [{ type: "text", text: JSON.stringify(cart) }] };
    },
  );

  // App-only tool - hidden from the model, only callable by the UI
  registerAppTool(
    server,
    "update-quantity",
    {
      description: "Update item quantity in cart",
      inputSchema: { itemId: z.string(), quantity: z.number() },
      _meta: {
        ui: {
          resourceUri: "ui://shop/cart.html",
          visibility: ["app"],
        },
      },
    },
    async ({ itemId, quantity }) => {
      const cart = await updateCartItem(itemId, quantity);
      return { content: [{ type: "text", text: JSON.stringify(cart) }] };
    },
  );
  //#endregion registerAppTool_toolVisibility
}

/**
 * Example: Basic usage of registerAppResource.
 */
function registerAppResource_basicUsage(server: McpServer) {
  //#region registerAppResource_basicUsage
  registerAppResource(
    server,
    "Weather Widget",
    "ui://weather/widget.html",
    {
      description: "Interactive weather display",
    },
    async () => ({
      contents: [
        {
          uri: "ui://weather/widget.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: await fs.readFile("dist/widget.html", "utf-8"),
        },
      ],
    }),
  );
  //#endregion registerAppResource_basicUsage
}

/**
 * Example: registerAppResource with CSP configuration for external domains.
 */
function registerAppResource_withCsp(
  server: McpServer,
  musicPlayerHtml: string,
) {
  //#region registerAppResource_withCsp
  registerAppResource(
    server,
    "Music Player",
    "ui://music/player.html",
    {
      description: "Audio player with external soundfonts",
    },
    async () => ({
      contents: [
        {
          uri: "ui://music/player.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: musicPlayerHtml,
          _meta: {
            ui: {
              csp: {
                resourceDomains: ["https://cdn.example.com"], // For scripts/styles/images
                connectDomains: ["https://api.example.com"], // For fetch/WebSocket
              },
            },
          },
        },
      ],
    }),
  );
  //#endregion registerAppResource_withCsp
}
