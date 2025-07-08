import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import './App.css';
// Import modern, minimalist icons from react-icons
import { FiHome, FiMap, FiTarget, FiSettings } from 'react-icons/fi';
import { MdFlag, MdAddCircleOutline, MdStarOutline, MdSchool, MdWork, MdDone, MdBrightness4, MdBrightness7 } from 'react-icons/md';

/**
 * Dashboard sidebar navigation items with icon components.
 */
const SIDEBAR_LINKS = [
  { icon: <FiHome />, label: "Dashboard" },
  { icon: <FiMap />, label: "My Roadmap" },
  { icon: <FiTarget />, label: "Goals" },
  { icon: <FiSettings />, label: "Settings" },
];

// Color mapping for milestone statuses
const STATUS_COLOR = {
  completed: "#43A047",      // green
  "in-progress": "#FFB300",  // yellow
  pending: "#C5C5C6",        // grey
};

// Timeline filter label mapping
const TIMELINE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Short-Term", value: "short" },
  { label: "Medium-Term", value: "medium" },
  { label: "Long-Term", value: "long" }
];

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

/**
 * Modern minimalist icons for milestones, by type/status.
 */
const milestoneIcons = {
  study: <MdSchool />,
  project: <FiMap />,
  career: <MdWork />,
  complete: <MdDone />,
  custom: <MdStarOutline />,
};

/**
 * Example milestones for roadmap (default state in App), now using icons.
 */
const INITIAL_MILESTONES = [
  {
    icon: milestoneIcons.study,
    title: "Learn JavaScript",
    completed: true,
    description: "Master the basics of JS.",
    term: "short"
  },
  {
    icon: milestoneIcons.project,
    title: "Build My First Project",
    completed: true,
    description: "Create and deploy a project.",
    term: "medium"
  },
  {
    icon: milestoneIcons.career,
    title: "Get Internship",
    completed: false,
    description: "Gain real-world experience.",
    term: "long"
  }
];

// Timeline helper: returns "short"|"medium"|"long"
function guessTermFromDescription(desc, idx) {
  // Fallback: first is short, last is long, everything else medium
  if (idx === 0) return "short";
  if (desc && /internship|career|full/i.test(desc)) return "long";
  if (desc && /project|build|deploy/i.test(desc)) return "medium";
  if (idx === 1) return "medium";
  return "medium";
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [milestones, setMilestones] = useState([...INITIAL_MILESTONES]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [progress, setProgress] = useState(0); // for animated progress bar
  const [appearStates, setAppearStates] = useState(() => Array(INITIAL_MILESTONES.length).fill(false));
  const [statusFlashes, setStatusFlashes] = useState(() => Array(INITIAL_MILESTONES.length).fill(false));
  const [showConfetti, setShowConfetti] = useState(false);

  // Add milestone modal/inputs
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({ title: '', description: '', term: 'short' });
  const [addFormError, setAddFormError] = useState('');

  // Timeline filter state
  const [timelineFilter, setTimelineFilter] = useState('all');

  const animFrame = useRef(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Animate bar on milestones change
  useEffect(() => {
    const completedCount = milestones.filter(m => m.completed).length;
    const percent = milestones.length === 1
      ? 100
      : ((completedCount - 1) / (milestones.length - 1)) * 100;
    let running = true;

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

  // Animate milestones' entrance on first mount, adjust for new milestones
  useEffect(() => {
    const prev = appearStates.length;
    if (milestones.length > prev) {
      // Animate in any new ones
      setTimeout(() => {
        setAppearStates((s) => {
          const arr = s.slice();
          for (let i = prev; i < milestones.length; ++i) {
            arr[i] = true;
          }
          return arr;
        });
      }, 200);
    } else {
      if (milestones.length < appearStates.length)
        setAppearStates(prev => prev.slice(0, milestones.length));
    }
  }, [milestones, appearStates.length]);

  // Animate milestones' initial entrance
  useEffect(() => {
    // Appear one-by-one with a delay
    const timeouts = [];
    for (let i = 0; i < appearStates.length; ++i) {
      timeouts.push(setTimeout(() => {
        setAppearStates(prev => {
          const copy = [...prev];
          copy[i] = true;
          return copy;
        });
      }, 160 * i));
    }
    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line
  }, []);

  // Animate status change flash and handle confetti trigger
  useEffect(() => {
    milestones.forEach((milestone, i) => {
      // major milestone = last in list
      if (milestone.completed && statusFlashes[i] === false) {
        setStatusFlashes((prev) => {
          const copy = [...prev];
          copy[i] = true;
          return copy;
        });
        setTimeout(() => {
          setStatusFlashes((prev) => {
            const copy = [...prev];
            copy[i] = false;
            return copy;
          });
        }, 800);

        // Confetti: trigger only if this is the last (major milestone) and the user just completed it
        if (i === milestones.length - 1 && !milestone._confettiShown) {
          setShowConfetti(true);
          // Avoid repeat for same item (add a flag)
          setMilestones((prev) =>
            prev.map((m, idx) =>
              idx === i ? { ...m, _confettiShown: true } : m
            )
          );
          setTimeout(() => setShowConfetti(false), 2400);
        }
      }
    });
    // eslint-disable-next-line
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
    setStatusFlashes((prev) => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });
    setTimeout(() => {
      setStatusFlashes((prev) => {
        const copy = [...prev];
        copy[idx] = false;
        return copy;
      });
    }, 800);
  };

  // Handlers for adding new custom milestones
  const handleOpenAddForm = () => {
    setAddFormData({ title: '', description: '', term: 'short' });
    setAddFormError('');
    setShowAddForm(true);
  };
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setAddFormError('');
  };
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleAddFormSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.title.trim()) {
      setAddFormError('Please enter a title.');
      return;
    }
    const icon = milestoneIcons.custom; // Use a default icon for custom milestones
    const estimatedTerm = addFormData.term || guessTermFromDescription(addFormData.description, milestones.length);
    setMilestones(prev => [
      ...prev,
      {
        icon,
        title: addFormData.title,
        description: addFormData.description || '',
        completed: false,
        term: estimatedTerm
      }
    ]);
    setShowAddForm(false);
    setAddFormError('');
    // Add corresponding appear and flash state
    setAppearStates((prev) => [...prev, false]);
    setStatusFlashes((prev) => [...prev, false]);
  };

  // Filtering milestones based on selected timeline
  const filteredMilestones = milestones.filter(m => timelineFilter === 'all' || m.term === timelineFilter);

  // Render add milestone form modal (simple overlay)
  function AddMilestoneModal() {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(40,40,64,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20
        }}
        onClick={handleCloseAddForm}
        tabIndex={-1}
      >
        <form
          className="add-milestone-modal"
          style={{
            background: 'var(--bg-primary)',
            borderRadius: 16,
            boxShadow: '0 8px 32px 0 #26384939',
            padding: '2.1em 1.7em 1.5em 1.7em',
            minWidth: 300,
            maxWidth: 370,
            width: '96vw',
            position: 'relative'
          }}
          onClick={e => e.stopPropagation()}
          onSubmit={handleAddFormSubmit}
        >
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>Add a Milestone</h2>
          <label htmlFor="milestone-title" style={{ marginTop: 14, fontWeight: 600, display: 'block' }}>Title<span style={{ color: 'red' }}>*</span></label>
          <input
            name="title"
            id="milestone-title"
            autoFocus
            type="text"
            placeholder="E.g. Finish Portfolio Site"
            value={addFormData.title}
            onChange={handleAddFormChange}
            style={{
              width: '100%',
              padding: '10px 8px',
              border: '1px solid #e5e7ed',
              borderRadius: 9,
              marginTop: 4,
              fontSize: 16,
              marginBottom: 8
            }}
            maxLength={64}
            required
          />
          <label htmlFor="milestone-desc" style={{ marginTop: 2, fontWeight: 600, display: 'block' }}>Description</label>
          <textarea
            name="description"
            id="milestone-desc"
            placeholder="Describe the milestone (optional)"
            value={addFormData.description}
            onChange={handleAddFormChange}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 8px',
              border: '1px solid #e5e7ed',
              borderRadius: 8,
              fontSize: 15,
              marginTop: 3,
              marginBottom: 10
            }}
            maxLength={180}
          />
          <label style={{ fontWeight: 600, display: 'block' }}>Timeline</label>
          <select
            name="term"
            value={addFormData.term}
            onChange={handleAddFormChange}
            style={{
              width: '100%',
              padding: '7px 8px',
              border: '1px solid #e5e7ed',
              borderRadius: 8,
              fontSize: 14,
              marginTop: 1,
              marginBottom: 10,
              background: '#f5f5fa'
            }}
          >
            <option value="short">Short-Term</option>
            <option value="medium">Medium-Term</option>
            <option value="long">Long-Term</option>
          </select>

          <div style={{ color: '#db2100', fontSize: "0.98em", minHeight: 16, marginBottom: 0, marginTop: 0, fontWeight: 500 }}>
            {addFormError}
          </div>
          <div style={{ display: 'flex', gap: 13, marginTop: 17, justifyContent: 'end' }}>
            <button
              type="button"
              onClick={handleCloseAddForm}
              style={{
                background: '#f5f5fa',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontWeight: 600,
                color: '#333'
              }}
            >
              Cancel
            </button>
            <button
              className="btn"
              type="submit"
              style={{
                borderRadius: 8,
                padding: '8px 22px',
                fontWeight: 600
              }}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Responsive window size for confetti
  const [windowSize, setWindowSize] = useState({width: window.innerWidth, height: window.innerHeight});
  useEffect(() => {
    function onResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="dashboard-root">
      {/* Confetti celebration overlay */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={180}
          recycle={false}
          gravity={0.21}
          initialVelocityY={25}
          style={{ position: "fixed", zIndex: 5000, pointerEvents: "none", top: 0, left: 0 }}
        />
      )}
      {/* Add milestone input modal */}
      {showAddForm && <AddMilestoneModal />}
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <MdStarOutline style={{ fontSize: "2rem", color: "var(--primary)" }} aria-label="logo" />
          <span className="sidebar-title" style={{ fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif", letterSpacing: ".01em" }}>GoalMap</span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map((link, idx) => (
            <a className="sidebar-link" href="#" key={link.label} tabIndex={0}>
              <span className="sidebar-icon" aria-hidden="true">{link.icon}</span>
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
            {theme === 'light' ? (
              <>
                <MdBrightness4 style={{ verticalAlign: '-2px', marginRight: 5 }} /> Dark
              </>
            ) : (
              <>
                <MdBrightness7 style={{ verticalAlign: '-2px', marginRight: 5 }} /> Light
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <section className="roadmap-section">
          <div className="roadmap-motivation-header" tabIndex={-1}>
            <MdFlag className="roadmap-motivation-icon" aria-label="flag" style={{ color: "var(--accent)" }} />
            <span>Your Journey to Success Starts Here</span>
          </div>
          <h1 className="roadmap-title">
            My Goal Roadmap
          </h1>
          {/* Timeline Filter Controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            margin: '0 auto 11px auto',
            padding: '0 2px'
          }}>
            {TIMELINE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="btn"
                style={{
                  background: timelineFilter === opt.value
                    ? "linear-gradient(90deg, var(--primary), var(--secondary))"
                    : "var(--button-bg, var(--primary))",
                  color: timelineFilter === opt.value ? "#fff" : "#f1fbf9",
                  padding: '6px 16px',
                  minWidth: 64,
                  fontWeight: timelineFilter === opt.value ? 700 : 500,
                  opacity: timelineFilter === opt.value ? 1 : 0.75,
                  fontSize: "0.97rem",
                  border: timelineFilter === opt.value ? "2px solid var(--accent)" : "none",
                  borderRadius: 14,
                  boxShadow: "none"
                }}
                onClick={() => setTimelineFilter(opt.value)}
                aria-pressed={timelineFilter === opt.value}
              >
                {opt.label}
              </button>
            ))}
            <button
              className="btn"
              style={{
                background: "var(--accent)",
                color: "#fff",
                padding: '7px 16px',
                fontWeight: 700,
                borderRadius: 13,
                marginLeft: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontFamily: 'inherit',
              }}
              onClick={handleOpenAddForm}
              aria-label="Add Milestone"
            >
              <MdAddCircleOutline style={{ fontSize: '1.2em', marginBottom: '-2px' }} /> Add Milestone
            </button>
          </div>
          <div className="roadmap-container">
            {/* Visual Progress Path */}
            <div className="roadmap-visual">
              <div className="roadmap-progress-bar-bg">
                <div
                  className="roadmap-progress-bar-fg roadmap-progress-bar-anim"
                  style={{
                    width: `${progress}%`,
                  }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="roadmap-milestones">
                {filteredMilestones.length === 0 &&
                  <div style={{ flex: 1, textAlign: "center", color: "#aaa", fontSize: "1.07em" }}>
                    No milestones to show for this timeline.
                  </div>
                }
                {filteredMilestones.map((milestone, filteredIdx) => {
                  // Find its true index in all milestones, for updating states
                  const idx = milestones.findIndex((m, i) =>
                    m.title === milestone.title &&
                    m.description === milestone.description &&
                    i >= filteredIdx // Use first matching after that uncovered so we don't break on repeats
                  );
                  
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

                  // Assemble milestone animation classes
                  let animClass = "milestone-item-appear";
                  if (appearStates[idx]) animClass += " active";
                  if (statusFlashes[idx]) animClass += " milestone-status-flash";

                  return (
                    <div
                      className={`milestone-item${milestone.completed ? ' completed' : ''}${selectedMilestone === idx ? ' active' : ''}${status === 'in-progress' ? ' inprogress' : ''}${status === 'pending' ? ' pending' : ''} ${animClass}`}
                      key={milestone.title + "_" + idx}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedMilestone === idx}
                      title={milestone.title}
                      onClick={() => handleMilestoneClick(idx)}
                      style={{
                        opacity: appearStates[idx] ? 1 : 0,
                        pointerEvents: appearStates[idx] ? 'auto' : 'none',
                        transform: appearStates[idx] ? 'none' : 'translateY(45px) scale(.95)',
                        transition: 'opacity 0.49s cubic-bezier(.35,1.4,.8,1.0), transform 0.5s cubic-bezier(.25,1.15,.9,.9)'
                      }}
                    >
                      <div
                        className="milestone-icon"
                        style={{
                          background: iconBg,
                          color: status === "completed" ? "#fff" : color,
                          border: `2px solid ${borderColor}`,
                          boxShadow: status === "in-progress" ? "0 2px 13px 0 #ffb40033" : "",
                          transition: "border 0.2s, background 0.22s, color 0.21s, box-shadow 0.18s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        aria-hidden="true"
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
            {/* Milestone Details (shown if any and only if visible in this filter) */}
            {selectedMilestone !== null && (
              (() => {
                if (filteredMilestones.some((m) => {
                  const idx = milestones.findIndex((item) =>
                    item.title === m.title && item.description === m.description
                  );
                  return idx === selectedMilestone;
                })) {
                  const ms = milestones[selectedMilestone];
                  return (
                    <div className="milestone-detail-card" tabIndex={0}>
                      <h2 style={{ marginBottom: 1, fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif" }}>
                        <span style={{ verticalAlign: "-2px", marginRight: 7 }}>{ms.icon}</span> {ms.title}
                      </h2>
                      <div style={{ fontSize: "0.99em", color: "#585858" }}>
                        {ms.term === 'short' && "Short-Term Goal"}
                        {ms.term === 'medium' && "Medium-Term Goal"}
                        {ms.term === 'long' && "Long-Term Goal"}
                      </div>
                      <p style={{ marginTop: 9, marginBottom: 8 }}>{ms.description}</p>
                      <p>
                        Status:{" "}
                        <strong>
                          {ms.completed
                            ? "Completed"
                            : getMilestoneStatus(selectedMilestone, ms, milestones) === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                        </strong>
                      </p>
                      {!ms.completed && (
                        <button
                          className="btn"
                          style={{
                            marginTop: 18,
                            background:
                              getMilestoneStatus(selectedMilestone, ms, milestones) === "in-progress"
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
                  );
                } else {
                  // If selected milestone is invisible due to filter
                  setSelectedMilestone(null);
                  return null;
                }
              })()
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
