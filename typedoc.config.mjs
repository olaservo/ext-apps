import { OptionDefaults } from "typedoc";

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  blockTags: [...OptionDefaults.blockTags, "@description"],
  intentionallyNotExported: ["AppOptions"],
  projectDocuments: ["docs/quickstart.md", "docs/patterns.md"],
  entryPoints: [
    "src/server/index.ts",
    "src/app.ts",
    "src/react/index.tsx",
    "src/app-bridge.ts",
    "src/message-transport.ts",
    "src/types.ts",
  ],
  out: "docs/api",
  gitRevision: "main",
  excludePrivate: true,
  excludeInternal: false,
  jsDocCompatibility: {
    exampleTag: false,
  },
  categorizeByGroup: true,
  navigationLinks: {
    GitHub: "https://github.com/modelcontextprotocol/ext-apps",
    Specification:
      "https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx",
  },
  readme: "README.md",
  includeVersion: true,
};

export default config;
