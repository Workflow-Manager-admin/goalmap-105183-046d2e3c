import React, { useState, useEffect } from 'react';
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

// Example milestones for roadmap
const GOAL_MILESTONES = [
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
  }
];

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleMilestoneClick = (index) => {
    setSelectedMilestone(index === selectedMilestone ? null : index);
  };

  // Calculates milestone progress percentage
  const completedCount = GOAL_MILESTONES.filter(m => m.completed).length;
  const progressPercent = (completedCount - 1) / (GOAL_MILESTONES.length - 1) * 100;

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
                  style={{ width: `${progressPercent}%` }}
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="roadmap-milestones">
                {GOAL_MILESTONES.map((milestone, idx) => (
                  <div 
                    className={`milestone-item${milestone.completed ? ' completed' : ''}${selectedMilestone === idx ? ' active' : ''}`}
                    key={milestone.title}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedMilestone === idx}
                    title={milestone.title}
                    onClick={() => handleMilestoneClick(idx)}
                  >
                    <div className="milestone-icon">
                      {milestone.icon}
                    </div>
                    <div className="milestone-title">
                      {milestone.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Milestone Details (shown if any) */}
            {selectedMilestone !== null && (
              <div className="milestone-detail-card" tabIndex={0}>
                <h2>{GOAL_MILESTONES[selectedMilestone].icon}{" "}{GOAL_MILESTONES[selectedMilestone].title}</h2>
                <p>{GOAL_MILESTONES[selectedMilestone].description}</p>
                <p>
                  Status:{" "}
                  <strong>
                    {GOAL_MILESTONES[selectedMilestone].completed ? "Completed" : "In Progress"}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
