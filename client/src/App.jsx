import { useState, useRef, useCallback, useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import "./App.css";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;  
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [flowStatus, setFlowStatus] = useState("idle"); // idle | running | done | error

  const resultRef = useRef("");
  const inputRef = useRef("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    inputRef.current = e.target.value;
  };

  const saveData = useCallback(async () => {
    const currentPrompt = inputRef.current;
    const currentResult = resultRef.current;

    if (!currentPrompt.trim()) {
      showToast("Nothing to save — prompt is empty.", "error");
      return;
    }
    if (!currentResult.trim()) {
      showToast("Nothing to save — run the flow first.", "error");
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${API_URL}/api/save`, {
        prompt: currentPrompt,
        response: currentResult,
      });
      showToast("Saved to database ✓", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  }, [API_URL]);

  const runFlow = useCallback(async () => {
    if (!input.trim()) {
      showToast("Please enter a prompt first.", "error");
      return;
    }
    try {
      setLoading(true);
      setFlowStatus("running");
      setResult("");
      resultRef.current = "";

      const res = await axios.post(`${API_URL}/api/ask-ai`, {
        prompt: input,
      });

      const response = res.data.response;
      setResult(response);
      resultRef.current = response;
      setFlowStatus("done");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || "Error fetching response";
      setResult(errorMsg);
      resultRef.current = errorMsg;
      setFlowStatus("error");
    } finally {
      setLoading(false);
    }
  }, [input, API_URL]);

  const getNodeStatusClass = (nodeId) => {
    if (nodeId === "1") {
      return input ? "node-active" : "node-idle";
    }
    if (nodeId === "2") {
      if (loading) return "node-running";
      if (flowStatus === "done") return "node-done";
      if (flowStatus === "error") return "node-error";
      return "node-idle";
    }
    return "node-idle";
  };

  const nodes = useMemo(() => [
    {
      id: "1",
      position: { x: 60, y: 120 },
      data: {
        label: (
          <div className={`flow-node ${getNodeStatusClass("1")}`}>
            <div className="node-header">
              <span className="node-icon">✦</span>
              <span className="node-title">INPUT</span>
            </div>
            <p className="node-preview">
              {input
                ? input.length > 60
                  ? input.slice(0, 60) + "…"
                  : input
                : "No prompt yet"}
            </p>
          </div>
        ),
      },
      style: { background: "transparent", border: "none", padding: 0 },
    },
    {
      id: "2",
      position: { x: 380, y: 120 },
      data: {
        label: (
          <div className={`flow-node ${getNodeStatusClass("2")}`}>
            <div className="node-header">
              <span className="node-icon">◈</span>
              <span className="node-title">OUTPUT</span>
            </div>
            <p className="node-preview">
              {loading
                ? "Processing…"
                : result
                ? result.length > 60
                  ? result.slice(0, 60) + "…"
                  : result
                : "Awaiting result"}
            </p>
          </div>
        ),
      },
      style: { background: "transparent", border: "none", padding: 0 },
    },
  ], [input, result, loading, flowStatus]);

  const edges = useMemo(() => [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      animated: loading,
      style: {
        stroke: loading ? "#00e5ff" : flowStatus === "done" ? "#00ff88" : "#3a4a6b",
        strokeWidth: 2,
      },
    },
  ], [loading, flowStatus]);

  return (
    <div className="app-shell">
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">FlowMind</span>
        </div>
        <div className="header-status">
          <span className={`status-dot status-dot--${flowStatus}`}></span>
          <span className="status-label">
            {flowStatus === "idle" && "Ready"}
            {flowStatus === "running" && "Running…"}
            {flowStatus === "done" && "Complete"}
            {flowStatus === "error" && "Error"}
          </span>
        </div>
      </header>

      <main className="app-main">
        <aside className="left-panel">
          <section className="panel-section">
            <label className="field-label" htmlFor="prompt-input">
              Prompt
            </label>
            <textarea
              id="prompt-input"
              className="prompt-textarea"
              placeholder="Ask anything…"
              value={input}
              onChange={handleInputChange}
              rows={6}
            />
            <div className="char-count">{input.length} chars</div>
          </section>

          <div className="action-buttons">
            <button
              className="btn btn--primary"
              onClick={runFlow}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span> Running…
                </>
              ) : (
                <>▶ Run Flow</>
              )}
            </button>

            <button
              className="btn btn--secondary"
              onClick={saveData}
              disabled={saving || !result}
            >
              {saving ? "Saving…" : "⬇ Save"}
            </button>
          </div>

          {result && (
            <section className="result-section">
              <div className="result-header">
                <span className="field-label">Response</span>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    showToast("Copied to clipboard", "success");
                  }}
                >
                  Copy
                </button>
              </div>
              <div className={`result-box ${flowStatus === "error" ? "result-box--error" : ""}`}>
                {result}
              </div>
            </section>
          )}
        </aside>

        <div className="flow-canvas">
          <div className="canvas-label">Flow Graph</div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#1e2a45" gap={24} size={1.2} />
            <Controls
              style={{
                background: "#0f1729",
                border: "1px solid #1e2a45",
                borderRadius: 8,
              }}
            />
            <MiniMap
              nodeColor="#1e2a45"
              maskColor="rgba(5, 10, 25, 0.6)"
              style={{ background: "#0a1020" }}
            />
          </ReactFlow>
        </div>
      </main>
    </div>
  );
}

export default App;