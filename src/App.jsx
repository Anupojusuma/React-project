import { useState, useRef, useEffect } from 'react';
import './app.css';

function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      className="theme-toggle-btn"
      aria-label="Theme switch"
      onClick={() => setDarkMode(prev => !prev)}
      style={{
        width: '52px', height: '32px', border: "none", borderRadius: "999px",
        background: darkMode ? "#3c3c3c" : "#e8e8ea", display: "flex",
        alignItems: "center", padding: "3px",
        justifyContent: darkMode ? "flex-end" : "flex-start",
        cursor: "pointer", position: "relative", boxShadow: "0 2px 8px #0001",
        transition: "background 0.25s"
      }}>
      <div style={{
        width: "26px", height: "26px", borderRadius: "50%",
        background: darkMode ? "#232326" : "#fff",
        boxShadow: "0 2px 4px #0002", transition: "background 0.25s",
      }} />
    </button>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = window.localStorage.getItem("tasks_purple");
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(() => (
    window.localStorage.getItem("theme_purple") === "dark"
  ));
  useEffect(() => {
    window.localStorage.setItem("theme_purple", darkMode ? "dark" : "light");
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);
  const [input, setInput] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('');
  const [tab, setTab] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef();
  useEffect(() => {
    window.localStorage.setItem("tasks_purple", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  function handleKeyDown(e) { if (e.key === 'Enter') addTask(); }
  useEffect(() => {
    if (input.trim()) {
      const completed = tasks.filter(t => t.completed);
      const uniqueTexts = [...new Set(completed.map(t => t.text))]
        .filter(txt => txt.toLowerCase().includes(input.toLowerCase()) && txt.toLowerCase() !== input.toLowerCase());
      setSuggestions(uniqueTexts.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [input, tasks]);
  function addTask(suggestedText) {
    const textToAdd = typeof suggestedText === 'string' ? suggestedText : input;
    if (textToAdd.trim() && priority) {
      setTasks([
        ...tasks,
        { text: textToAdd, desc, priority, completed: false }
      ]);
      setInput(''); setDesc(''); setPriority(''); setSuggestions([]);
    }
  }
  function handleSuggestionClick(text) { setInput(text); setSuggestions([]); }
  function toggleDone(idx) {
    setTasks(tasks.map((task, i) => (
      i === idx ? { ...task, completed: !task.completed } : task
    )));
  }
  function deleteTask(idx) { setTasks(tasks.filter((_, i) => i !== idx)); }
  function filteredTasks() {
    if (tab === 'All') return tasks;
    if (tab === 'To-do') return tasks.filter(t => !t.completed);
    if (tab === 'Completed') return tasks.filter(t => t.completed);
    return tasks;
  }
  return (
    <>
      <div className="bg-blur-bg"></div>
      <div className="theme-toggle-floating">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
      <div className={`todo-bg${darkMode ? " dark-theme" : ""}`}>
        <div className="todo-main-header">
          <img src="/emoji-2.jpg" alt="Logo" style={{
            width: 40, height: 40, objectFit: 'cover', borderRadius: '10px', marginRight: '0.7em'
          }} />
          <span className="main-heading-text">My To-Do List</span>
        </div>
        <div className="todo-controls">
          <div style={{ position: 'relative', flex: 2 }}>
            <input
              ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add a new to-do" aria-label="Add a new to-do"
              onKeyDown={handleKeyDown} autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-dropdown" style={{
                position: 'absolute', left: 0, right: 0, top: '100%',
                background: '#fff9ed', borderRadius: '999px', boxShadow: '0 6px 22px #0001',
                zIndex: 4, margin: 0, padding: 0, listStyle: 'none'
              }}>
                {suggestions.map((s, i) =>
                  <li key={i}
                    style={{ padding: "0.6em 1em", cursor: "pointer", borderRadius: "999px" }}
                    onMouseDown={() => handleSuggestionClick(s)}>
                    {s}
                    <button style={{ float: "right", fontSize: "0.95em", marginLeft: 8 }}
                      onMouseDown={() => addTask(s)}>Add</button>
                  </li>
                )}
              </ul>
            )}
          </div>
          <input type="text" value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Description "
            style={{
              flex: 3, minWidth: 150, maxWidth: 280, borderRadius: 999,
              border: 'none', background: '#e9d8ca', fontSize: '1.05em',
              fontFamily: 'inherit', outline: 'none', padding: '0.95em 1.25em',
              marginLeft: '0.5em', color: '#000'
            }}
            onKeyDown={handleKeyDown}
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{
              flex: 1, minWidth: 110, borderRadius: 999, border: 'none',
              background: '#e9d8ca', color: '#000', fontSize: '1em',
              fontWeight: 600, outline: 'none', padding: '0.75em 0.6em', marginLeft: '0.5em',
            }}
            onKeyDown={handleKeyDown}
          >
            <option value="" disabled>Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button className="add-btn" onClick={() => addTask()}>Add</button>
          <div className="toggle-tabs">
            {['All', 'To-do', 'Completed'].map(name =>
              <button
                key={name}
                className={"tab-btn" + (name === tab ? " selected" : "")}
                onClick={() => setTab(name)}
              >{name}</button>
            )}
          </div>
        </div>
        <div className="tasks-table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks().length === 0
                ? <tr><td colSpan={4} className="no-tasks">No tasks yet. Start by adding one!</td></tr>
                : filteredTasks().map((task, idx) => (
                  <tr key={idx}>
                    <td style={{ textDecoration: task.completed ? 'line-through' : 'none', color: '#000' }}>
                      {task.text}
                    </td>
                    <td style={{ color: '#000' }}>{task.desc}</td>
                    <td style={{ color: '#000' }}>{task.priority}</td>
                    <td className="action-btns">
                      <button className="icon-btn" title="Toggle Complete" onClick={() => toggleDone(idx)}>
                        {task.completed ? '✅' : '⬜'}
                      </button>
                      <button className="icon-btn" title="Delete" onClick={() => deleteTask(idx)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export default App;
