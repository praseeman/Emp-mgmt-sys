import React, { useState, useEffect, useCallback } from "react";
import "./PerformanceSection.css";
import { AwardIcon, CheckCircleIcon, CalendarIcon, BarChartIcon } from "./Icons";

const API_BASE = "http://localhost:5000/api";

export default function PerformanceSection({
  user,
  role = "employee",
  allEmployees = [],
  onTriggerToast,
}) {
  const [performance, setPerformance] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState(
    user?.id || user?._id || "2"
  );
  const [allPerformances, setAllPerformances] = useState([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    priority: "High",
    targetDate: "2026-11-15",
  });

  const fetchPerformance = useCallback(async () => {
    try {
      if (role === "admin") {
        // Fetch all performances
        const resAll = await fetch(`${API_BASE}/performance`);
        if (resAll.ok) {
          const dataAll = await resAll.json();
          setAllPerformances(dataAll);
        }
      }

      const targetId = role === "admin" ? selectedEmpId : user?.id || user?._id || "2";
      const res = await fetch(`${API_BASE}/performance?employeeId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setPerformance(data);
      }
    } catch (err) {
      console.warn("Error fetching performance data:", err);
    }
  }, [role, selectedEmpId, user]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const handleUpdateProgress = async (goalId, newProgress) => {
    const targetId = role === "admin" ? selectedEmpId : user?.id || user?._id || "2";
    const status = newProgress >= 100 ? "Completed" : "In Progress";

    setPerformance((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === goalId ? { ...g, progress: newProgress, status } : g
        ),
      };
    });

    try {
      await fetch(`${API_BASE}/performance/${targetId}/goal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, progress: newProgress, status }),
      });
      if (onTriggerToast && newProgress >= 100) {
        onTriggerToast("Goal marked as 100% Completed!", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    const createdGoal = {
      id: `g-${Date.now()}`,
      title: newGoal.title,
      progress: 0,
      targetDate: newGoal.targetDate,
      status: "In Progress",
      priority: newGoal.priority,
    };

    setPerformance((prev) => ({
      ...prev,
      goals: [...(prev?.goals || []), createdGoal],
    }));

    setNewGoal({ title: "", priority: "High", targetDate: "2026-11-15" });
    setShowAddGoalModal(false);
    if (onTriggerToast) {
      onTriggerToast("New OKR Goal created successfully!", "success");
    }
  };

  const goals = performance?.goals || [];
  const completedGoals = goals.filter((g) => g.status === "Completed").length;
  const avgCompletion =
    goals.length > 0
      ? Math.round(
          goals.reduce((acc, curr) => acc + Number(curr.progress || 0), 0) /
            goals.length
        )
      : 85;

  return (
    <div className="performance-section-root">
      {/* Top Header */}
      <div className="perf-header-row">
        <div>
          <h2>Performance Reviews & OKR Goals</h2>
          <p>
            Quarterly objectives, goal progression metrics, manager feedback, and skill ratings
          </p>
        </div>

        <div className="perf-header-actions">
          {role === "admin" && allEmployees.length > 0 && (
            <div className="perf-employee-select">
              <label>Review Employee:</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {allEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            className="perf-add-goal-btn"
            onClick={() => setShowAddGoalModal(true)}
          >
            + Add New Goal
          </button>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="perf-kpi-grid">
        <div className="perf-kpi-card rating">
          <div className="perf-kpi-icon">
            <AwardIcon width={20} height={20} />
          </div>
          <div className="perf-kpi-info">
            <span>Quarterly Rating</span>
            <h3>{performance?.overallRating || 4.8} / 5.0</h3>
            <small>Top 5% Tier Contributor</small>
          </div>
        </div>

        <div className="perf-kpi-card goals-done">
          <div className="perf-kpi-icon">
            <CheckCircleIcon width={20} height={20} />
          </div>
          <div className="perf-kpi-info">
            <span>Completed OKRs</span>
            <h3>
              {completedGoals} / {goals.length}
            </h3>
            <small>{avgCompletion}% Overall Progress</small>
          </div>
        </div>

        <div className="perf-kpi-card punctuality">
          <div className="perf-kpi-icon">
            <CalendarIcon width={20} height={20} />
          </div>
          <div className="perf-kpi-info">
            <span>Punctuality Score</span>
            <h3>{performance?.punctualityScore || 98}%</h3>
            <small>Consistent on-time record</small>
          </div>
        </div>

        <div className="perf-kpi-card kpi-score">
          <div className="perf-kpi-icon">
            <BarChartIcon width={20} height={20} />
          </div>
          <div className="perf-kpi-info">
            <span>KPI Achievement</span>
            <h3>{performance?.kpiScore || 94}%</h3>
            <small>Exceeds Q3 benchmarks</small>
          </div>
        </div>
      </div>

      {/* Manager Feedback & Badges */}
      <div className="perf-feedback-card">
        <div className="perf-feedback-header">
          <div>
            <h3>Manager Evaluation & Recognition</h3>
            <small>Cycle: {performance?.reviewPeriod || "Q3 2026"}</small>
          </div>
          <span className="perf-status-pill verified">✓ Verified by HR</span>
        </div>

        <blockquote className="perf-quote">
          "{performance?.managerFeedback || "Exceptional contributions to team projects and proactive cross-department collaboration."}"
        </blockquote>

        <div className="perf-badges-wrap">
          <span className="perf-badge-label">Earned Recognition Badges:</span>
          <div className="perf-badge-list">
            {(performance?.badges || [
              "High Velocity",
              "Clean Code Star",
              "Punctuality Master",
              "Team Anchor",
            ]).map((badge, idx) => (
              <span key={idx} className="perf-badge-tag">
                {badge.replace(/^[^\w\s]+/, "").trim() || badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* OKR Goals List */}
      <div className="perf-goals-card">
        <div className="perf-goals-header">
          <div>
            <h3>Active Monthly Goals & OKRs</h3>
            <p>Update progress sliders to reflect completion towards Q3 deliverables</p>
          </div>
        </div>

        <div className="perf-goals-list">
          {goals.map((goal) => (
            <div key={goal.id} className="perf-goal-item">
              <div className="perf-goal-top">
                <div className="perf-goal-title-wrap">
                  <span
                    className={`perf-priority-tag ${goal.priority?.toLowerCase() || "high"}`}
                  >
                    {goal.priority || "High"}
                  </span>
                  <h4>{goal.title}</h4>
                </div>

                <div className="perf-goal-meta">
                  <span className={`perf-status-badge ${goal.status === "Completed" ? "completed" : "in-progress"}`}>
                    {goal.status}
                  </span>
                  <span className="perf-goal-target">Target: {goal.targetDate}</span>
                </div>
              </div>

              <div className="perf-progress-row">
                <div className="perf-progress-bar-wrap">
                  <div
                    className="perf-progress-bar"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="perf-progress-text">{goal.progress}%</span>
              </div>

              <div className="perf-goal-slider-row">
                <label>Adjust Progress:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) =>
                    handleUpdateProgress(goal.id, Number(e.target.value))
                  }
                  className="perf-slider"
                />
                <button
                  type="button"
                  className="perf-quick-complete-btn"
                  onClick={() => handleUpdateProgress(goal.id, 100)}
                >
                  ✓ Mark 100%
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div
          className="day-inspector-overlay"
          onClick={() => setShowAddGoalModal(false)}
        >
          <div
            className="day-inspector-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="day-inspector-header">
              <h3>+ Add New OKR Goal</h3>
              <button
                type="button"
                className="day-inspector-close"
                onClick={() => setShowAddGoalModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="day-inspector-body">
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                  Goal Objective / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Implement real-time notifications with WebSockets"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxComponents: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                    Priority
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, priority: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                    }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetDate: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="inspector-done-btn"
                  style={{ background: "#f1f5f9", color: "#334155" }}
                  onClick={() => setShowAddGoalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inspector-done-btn"
                  style={{ background: "#2563eb", color: "white" }}
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
