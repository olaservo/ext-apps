import { Component, type ErrorInfo, type ReactNode, StrictMode, Suspense, use, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { callTool, connectToServer, hasAppHtml, initializeApp, loadSandboxProxy, log, newAppBridge, type ServerInfo, type ToolCallInfo } from "./implementation";
import styles from "./index.module.css";


// Wrapper to track server name with each tool call
interface ToolCallEntry {
  serverName: string;
  info: ToolCallInfo;
}

// Host receives connected servers via promise, uses single use() call
interface HostProps {
  serversPromise: Promise<ServerInfo[]>;
}
function Host({ serversPromise }: HostProps) {
  const servers = use(serversPromise);
  const [toolCalls, setToolCalls] = useState<ToolCallEntry[]>([]);

  if (servers.length === 0) {
    return <p>No servers configured. Set SERVERS environment variable.</p>;
  }

  return (
    <>
      {toolCalls.map((entry, i) => (
        <ToolCallInfoPanel key={i} serverName={entry.serverName} toolCallInfo={entry.info} />
      ))}
      <CallToolPanel
        servers={servers}
        addToolCall={(serverName, info) => setToolCalls([...toolCalls, { serverName, info }])}
      />
    </>
  );
}


// CallToolPanel manages server selection from already-connected servers
interface CallToolPanelProps {
  servers: ServerInfo[];
  addToolCall: (serverName: string, info: ToolCallInfo) => void;
}
function CallToolPanel({ servers, addToolCall }: CallToolPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedServer = servers[selectedIndex];

  return (
    <div className={styles.callToolPanel}>
      <label>
        Server
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
        >
          {servers.map((server, i) => (
            <option key={i} value={i}>
              {server.name}
            </option>
          ))}
        </select>
      </label>
      <ToolCallForm
        key={selectedIndex}
        serverName={selectedServer.name}
        serverInfo={selectedServer}
        addToolCall={addToolCall}
      />
    </div>
  );
}


// ToolCallForm receives already-resolved serverInfo
interface ToolCallFormProps {
  serverName: string;
  serverInfo: ServerInfo;
  addToolCall: (serverName: string, info: ToolCallInfo) => void;
}
function ToolCallForm({ serverName, serverInfo, addToolCall }: ToolCallFormProps) {
  const toolNames = Array.from(serverInfo.tools.keys());
  const [selectedTool, setSelectedTool] = useState(toolNames[0] ?? "");
  const [inputJson, setInputJson] = useState("{}");

  const isValidJson = useMemo(() => {
    try {
      JSON.parse(inputJson);
      return true;
    } catch {
      return false;
    }
  }, [inputJson]);

  const handleSubmit = () => {
    const toolCallInfo = callTool(serverInfo, selectedTool, JSON.parse(inputJson));
    addToolCall(serverName, toolCallInfo);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <label>
        Tool
        <select
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
        >
          {toolNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>
      <label>
        Input
        <textarea
          aria-invalid={!isValidJson}
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
        />
      </label>
      <button type="submit" disabled={!selectedTool || !isValidJson}>
        Call Tool
      </button>
    </form>
  );
}


interface ToolCallInfoPanelProps {
  serverName: string;
  toolCallInfo: ToolCallInfo;
}
function ToolCallInfoPanel({ serverName, toolCallInfo }: ToolCallInfoPanelProps) {
  return (
    <div className={styles.toolCallInfoPanel}>
      <div className={styles.inputInfoPanel}>
        <h2 className={styles.toolName}>{serverName}:{toolCallInfo.tool.name}</h2>
        <JsonBlock value={toolCallInfo.input} />
      </div>
      <div className={styles.outputInfoPanel}>
        <ErrorBoundary>
          <Suspense fallback="Loading...">
            {
              hasAppHtml(toolCallInfo)
                ? <AppIFramePanel toolCallInfo={toolCallInfo} />
                : <ToolResultPanel toolCallInfo={toolCallInfo} />
            }
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}


function JsonBlock({ value }: { value: object }) {
  return (
    <pre className={styles.jsonBlock}>
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  );
}


interface AppIFramePanelProps {
  toolCallInfo: Required<ToolCallInfo>;
}
function AppIFramePanel({ toolCallInfo }: AppIFramePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current!;
    loadSandboxProxy(iframe).then((firstTime) => {
      // The `firstTime` check guards against React Strict Mode's double
      // invocation (mount → unmount → remount simulation in development).
      // Outside of Strict Mode, this `useEffect` runs only once per
      // `toolCallInfo`.
      if (firstTime) {
        const appBridge = newAppBridge(toolCallInfo.serverInfo, iframe);
        initializeApp(iframe, appBridge, toolCallInfo);
      }
    });
  }, [toolCallInfo]);

  return (
    <div className={styles.appIframePanel}>
      <iframe ref={iframeRef} />
    </div>
  );
}


interface ToolResultPanelProps {
  toolCallInfo: ToolCallInfo;
}
function ToolResultPanel({ toolCallInfo }: ToolResultPanelProps) {
  const result = use(toolCallInfo.resultPromise);
  return <JsonBlock value={result} />;
}


interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: undefined };

  // Called during render phase - must be pure (no side effects)
  // Note: error is `unknown` because JS allows throwing any value
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Called during commit phase - can have side effects (logging, etc.)
  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    log.error("Caught:", error, errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { error } = this.state;
      const message = error instanceof Error ? error.message : String(error);
      return <div className={styles.error}><strong>ERROR:</strong> {message}</div>;
    }
    return this.props.children;
  }
}


async function connectToAllServers(): Promise<ServerInfo[]> {
  const serverUrlsResponse = await fetch("/api/servers");
  const serverUrls = (await serverUrlsResponse.json()) as string[];
  return Promise.all(serverUrls.map((url) => connectToServer(new URL(url))));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<p className={styles.connecting}>Connecting to servers...</p>}>
        <Host serversPromise={connectToAllServers()} />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
