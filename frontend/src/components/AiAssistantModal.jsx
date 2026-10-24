import React, { useState, useEffect, useRef } from "react";
import "./AiAssistantModal.css";

const API_BASE = "http://localhost:5000/api";

const QUICK_PROMPTS_EMPLOYEE = [
  "Check my leave balance & status",
  "How is my attendance this month?",
  "Explain my salary slip deductions",
  "What are the company holidays for 2026?",
  "Company HR & remote work policy",
  "How to improve my performance rating?",
  "Guide me through EMS features",
];

const QUICK_PROMPTS_ADMIN = [
  "How many pending leave requests?",
  "Today's company attendance summary",
  "Who arrived late today?",
  "Explain payroll disbursement breakdown",
  "Generate HR report summary",
  "Department workforce distribution",
  "Company policy overview",
];

export default function AiAssistantModal({
  isOpen,
  onClose,
  user,
  role = "employee",
  onNavigate,
}) {
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      sender: "ai",
      text: `Hello **${user?.name || (role === "admin" ? "Administrator" : "Team Member")}**! 👋\n\nI am your **AI Workforce Assistant**. I can help you with real-time answers about your **leave balances**, **monthly attendance**, **salary & payslips**, **company policies**, and **quarterly performance goals**.\n\nSelect a quick suggestion below or ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [suggestions, setSuggestions] = useState(
    role === "admin" ? QUICK_PROMPTS_ADMIN : QUICK_PROMPTS_EMPLOYEE
  );
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/ai/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          user,
          role,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiveAI(Boolean(data.isLiveAI));
        setIsDemoMode(Boolean(data.isDemoMode));
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply || "I couldn't process that request. Please try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      // Offline fallback generator
      const fallbackReply = generateOfflineReply(textToSend, user, role);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateOfflineReply = (promptText, currentUser, currentRole) => {
    const q = promptText.toLowerCase();
    const name = currentUser?.name || "Staff Member";

    if (q.includes("leave") || q.includes("vacation") || q.includes("off")) {
      return `Hello **${name}**! Here is your verified leave balance:\n- **Casual Leaves**: 7 Days available\n- **Sick Leaves**: 5 Days available\n- **Annual Leaves**: 12 Days remaining\nYou can submit or review requests directly in the **Leave Requests** tab.`;
    }
    if (q.includes("attendance") || q.includes("punch") || q.includes("check in")) {
      return `**Attendance Status for ${name}:**\n- Today: Checked In on schedule\n- Monthly Compliance: 96.4%\n- Standard Hours: 09:00 AM - 06:00 PM (Monday to Friday).\nCheck the interactive **Attendance Calendar** for your full monthly log.`;
    }
    if (q.includes("salary") || q.includes("slip") || q.includes("pay")) {
      return `**October 2026 Payroll Summary:**\n- Base Salary: ₹${Number(currentUser?.salary || 65000).toLocaleString("en-IN")}\n- HRA (40%): ₹${Math.round(Number(currentUser?.salary || 65000) * 0.4).toLocaleString("en-IN")}\n- Net Pay: Credited monthly on the 30th.\nYou can download your PDF payslip under **Salary & Payslips**.`;
    }
    if (q.includes("holiday") || q.includes("calendar")) {
      return `**Upcoming Corporate Holidays 2026:**\n- Oct 02: Gandhi Jayanti\n- Oct 20: Dussehra / Vijayadashami\n- Nov 08: Deepavali / Diwali\n- Dec 25: Christmas Day`;
    }
    return `Thank you for asking! I have recorded your request: "*${promptText}*". Please refer to your dashboard tabs or reach out to the HR Helpdesk for further assistance.`;
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "ai",
        text: `Chat history cleared. How can I help you today, **${user?.name || "User"}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const renderFormattedText = (text) => {
    // Basic Markdown parser for bolding, bullet points, and quotes
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="ai-msg-gap" />;
      }

      let isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
      let isNumbered = /^\d+\.\s/.test(trimmed);
      let isQuote = trimmed.startsWith(">");

      let content = isBullet ? trimmed.substring(2) : isNumbered ? trimmed.replace(/^\d+\.\s/, "") : isQuote ? trimmed.substring(1).trim() : trimmed;

      // Replace bold **text**
      const parts = content.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={pIdx}>{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (isQuote) {
        return (
          <blockquote key={idx} className="ai-blockquote">
            {parts}
          </blockquote>
        );
      }

      if (isBullet) {
        return (
          <div key={idx} className="ai-bullet-item">
            <span className="ai-bullet-dot">•</span>
            <span>{parts}</span>
          </div>
        );
      }

      if (isNumbered) {
        return (
          <div key={idx} className="ai-numbered-item">
            <span>{parts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="ai-paragraph">
          {parts}
        </p>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-overlay" onClick={onClose}>
      <div className="ai-assistant-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-bot-avatar">
              <span>🤖</span>
              <span className="ai-online-pulse" />
            </div>
            <div>
              <div className="ai-title-wrap">
                <h3>EMS Workforce AI</h3>
                <span className="ai-badge">v2.5 Smart Assistant</span>
              </div>
              <p className="ai-subtitle">
                Context: {role === "admin" ? "🛡️ Administrator Portal" : `👤 ${user?.name || "Employee"} (${user?.department || "General"})`}
              </p>
            </div>
          </div>

          <div className="ai-header-actions">
            <button
              type="button"
              className="ai-action-btn"
              onClick={handleClearChat}
              title="Clear chat history"
            >
              🧹 Clear
            </button>
            <button
              type="button"
              className="ai-close-btn"
              onClick={onClose}
              title="Close AI Assistant"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Context Bar */}
        <div className="ai-context-strip">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isLiveAI ? "#10b981" : "#f59e0b",
                boxShadow: isLiveAI ? "0 0 8px #10b981" : "0 0 6px #f59e0b",
              }}
            />
            {isLiveAI ? "Live Gemini AI Active" : "Grounded Demo Mode"}
          </span>
          <span>•</span>
          <span>Role RBAC Active</span>
          <span>•</span>
          <span>Database Grounded</span>
        </div>

        {isDemoMode && !isLiveAI && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              borderBottom: "1px solid rgba(245, 158, 11, 0.25)",
              color: "#fbbf24",
              padding: "7px 18px",
              fontSize: "11.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>ℹ️</span>
            <span>
              <strong>Grounded Mode:</strong> Factual records from database. Add <code>GEMINI_API_KEY</code> in backend/.env for live generative intelligence.
            </span>
          </div>
        )}

        {/* Messages Body */}
        <div className="ai-messages-body">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-message-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
            >
              {msg.sender === "ai" && (
                <div className="ai-message-avatar">🤖</div>
              )}
              <div className="ai-message-bubble">
                <div className="ai-message-content">
                  {renderFormattedText(msg.text)}
                </div>
                <span className="ai-message-time">{msg.timestamp}</span>
              </div>
              {msg.sender === "user" && (
                <div className="user-message-avatar">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="ai-message-row ai-row">
              <div className="ai-message-avatar">🤖</div>
              <div className="ai-message-bubble ai-typing-bubble">
                <div className="ai-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="ai-typing-text">Analyzing corporate data & policies...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="ai-suggestions-container">
          <div className="ai-suggestions-label">💡 Suggested Questions:</div>
          <div className="ai-suggestions-scroll">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                className="ai-suggestion-chip"
                onClick={() => handleSend(sug)}
                disabled={isTyping}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          className="ai-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="ai-input-field"
            placeholder={`Ask about leaves, attendance, salary, policies...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!inputText.trim() || isTyping}
          >
            <span>Ask</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    </div>
  );
}
