import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * Dashboard sidebar navigation items.
 */
const SIDEBAR_LINKS = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "🗺️", label: "My Roadmap" },
  { icon: "🎯", label: "Goals" },
  { icon: "⚙️", label: "Settings" },
];

// Color mapping for milestone statuses
const STATUS_COLOR = {
  completed: "#43A047",    // green
  "in-progress": "#FFB300", // yellow
  pending: "#C5C5C6",      // grey
};

/**
 * Get status string: "completed" | "in-progress" | "pending" for a milestone
 * @param {number} idx index in array
 * @param {object} milestone
 * @param {array} milestones
 */
function getMilestoneStatus(idx, milestone, milestones) {
  if (milestone.completed) return "completed";
  // In-progress: next incomplete milestone in order
  if (
    idx === milestones.findIndex(m => !m.completed)
  )
    return "in-progress";
  return "pending";
}

// Example milestones for roadmap (moved into default state in App)
const INITIAL_MILESTONES = [
  {
    icon: "📚",
    title: "Learn JavaScript",
    completed: true,
    description: "Master the basics of JS.",
  },
  {
    icon: "💻",
    title: "Build My First Project",
    completed: true,
    description: "Create and deploy a project.",
  },
  {
    icon: "🧑‍💼",
    title: "Get Internship",
    completed: false,
    description: "Gain real-world experience.",
  },
];

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [milestones, setMilestones] = useState([...INITIAL_MILESTONES]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [progress, setProgress] = useState(0); // for animated progress bar
  const animFrame = useRef(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Animate bar on milestones change
  useEffect(() => {
    const completedCount = milestones.filter(m => m.completed).length;
    // Clamp: if 1 milestone, treat as 100% when that is done
    const percent = milestones.length === 1
      ? 100
      : ((completedCount - 1) / (milestones.length - 1)) * 100;
    let running = true;

    // Animation: smoothly interpolate progress value to percent
    const animate = () => {
      setProgress((cur) => {
        if (!running) return percent;
        const diff = percent - cur;
        if (Math.abs(diff) < 0.5) return percent;
        return cur + diff * 0.18;
      });
      if (running) {
        animFrame.current = window.requestAnimationFrame(animate);
      }
    };

    animFrame.current && window.cancelAnimationFrame(animFrame.current);
    animFrame.current = window.requestAnimationFrame(animate);
    return () => {
      running = false;
      animFrame.current && window.cancelAnimationFrame(animFrame.current);
    };
  }, [milestones]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleMilestoneClick = (index) => {
    setSelectedMilestone(index === selectedMilestone ? null : index);
  };

  const handleMarkAsComplete = (idx) => {
    setMilestones((prev) =>
      prev.map((milestone, i) =>
        i === idx ? { ...milestone, completed: true } : milestone
      )
    );
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span role="img" aria-label="logo" style={{ fontSize: "2rem" }}>🚀</span>
          <span className="sidebar-title">GoalMap</span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map((link, idx) => (
            <a className="sidebar-link" href="#" key={link.label} tabIndex={0}>
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <section className="roadmap-section">
          <h1 className="roadmap-title">
            My Goal Roadmap
          </h1>
          <div className="roadmap-container">
            {/* Visual Progress Path */}
            <div className="roadmap-visual">
              <div className="roadmap-progress-bar-bg">
                <div 
                  className="roadmap-progress-bar-fg"
                  style={{
                    width: `${progress}%`,
                    transition: "width 0.33s cubic-bezier(0.45,0.05,0.55,0.95)",
                  }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="roadmap-milestones">
                {milestones.map((milestone, idx) => {
                  const status = getMilestoneStatus(idx, milestone, milestones);
                  let color;
                  if (status === "completed") color = STATUS_COLOR.completed; // green
                  else if (status === "in-progress") color = STATUS_COLOR["in-progress"]; // yellow
                  else color = STATUS_COLOR.pending; // grey

                  let borderColor;
                  if (status === "completed") borderColor = STATUS_COLOR.completed;
                  else if (status === "in-progress") borderColor = STATUS_COLOR["in-progress"];
                  else borderColor = "#ececec";

                  const iconBg =
                    status === "completed"
                      ? `linear-gradient(135deg, var(--primary), var(--secondary))`
                      : status === "in-progress"
                        ? "#fffbe0"
                        : "#f2f2f4";

                  const labelStyle = {};
                  if (status === "completed") labelStyle.color = STATUS_COLOR.completed;
                  else if (status === "in-progress") labelStyle.color = STATUS_COLOR["in-progress"];
                  else labelStyle.color = STATUS_COLOR.pending;

                  return (
                    <div 
                      className={`milestone-item${milestone.completed ? ' completed' : ''}${selectedMilestone === idx ? ' active' : ''}${status === 'in-progress' ? ' inprogress' : ''}${status === 'pending' ? ' pending' : ''}`}
                      key={milestone.title}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedMilestone === idx}
                      title={milestone.title}
                      onClick={() => handleMilestoneClick(idx)}
                      style={{}}
                    >
                      <div 
                        className="milestone-icon"
                        style={{
                          background: iconBg,
                          color: status === "completed" ? "#fff" : color,
                          border: `2px solid ${borderColor}`,
                          boxShadow: status === "in-progress" ? "0 2px 13px 0 #ffb40033" : "",
                        }}
                      >
                        {milestone.icon}
                      </div>
                      <div 
                        className="milestone-title"
                        style={labelStyle}
                      >
                        {milestone.title}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: `calc(var(--milestone-size) + 12px)`,
                  right: 0,
                  left: 0,
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: "1.25rem",
                  color: "var(--primary)",
                  letterSpacing: "0.5px",
                  zIndex: 2,
                  textShadow: "0 2px 7px #e0e5ef",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                aria-label={`Progress: ${Math.round(progress)}%`}
              >
                {`${Math.round(progress)}% Complete`}
              </div>
            </div>
            {/* Milestone Details (shown if any) */}
            {selectedMilestone !== null && (
              <div className="milestone-detail-card" tabIndex={0}>
                <h2>{milestones[selectedMilestone].icon}{" "}{milestones[selectedMilestone].title}</h2>
                <p>{milestones[selectedMilestone].description}</p>
                <p>
                  Status:{" "}
                  <strong>
                    {milestones[selectedMilestone].completed
                      ? "Completed"
                      : getMilestoneStatus(selectedMilestone, milestones[selectedMilestone], milestones) === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                  </strong>
                </p>
                {!milestones[selectedMilestone].completed && (
                  <button
                    className="btn"
                    style={{
                      marginTop: 18,
                      background:
                        getMilestoneStatus(selectedMilestone, milestones[selectedMilestone], milestones) === "in-progress"
                          ? STATUS_COLOR["in-progress"]
                          : STATUS_COLOR.pending,
                      color: "#333",
                    }}
                    onClick={() => {
                      handleMarkAsComplete(selectedMilestone);
                    }}
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
