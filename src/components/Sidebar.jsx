import { useState } from 'react'
import './Sidebar.css'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Sidebar({ sessions = [], activeId, onSelect, onNew, onDelete }) {
  const safeSessions = Array.isArray(sessions) ? sessions : []
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-mark">✦</span>
          <span className="logo-text">LLM Chat</span>
        </div>
        <button className="new-btn" onClick={onNew} title="New chat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5"  y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="sessions-label">Conversations</div>

      <div className="sessions-list">
        {safeSessions.length === 0 && (
          <p className="sessions-empty">No conversations yet</p>
        )}
        {safeSessions.map((s, i) => (
          <div
            key={s.session_id}
            className={`session-item ${activeId === s.session_id ? 'active' : ''}`}
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => onSelect(s.session_id)}
            onMouseEnter={() => setHoveredId(s.session_id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="session-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="session-info">
              <span className="session-title">{s.title || 'New Chat'}</span>
              <span className="session-time">{timeAgo(s.created_at)}</span>
            </div>
            {hoveredId === s.session_id && (
              <button
                className="delete-btn"
                onClick={e => { e.stopPropagation(); onDelete(s.session_id) }}
                title="Delete"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6"  y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="footer-model">
          <span className="model-dot" />
          GPT-4o mini
        </div>
      </div>
    </aside>
  )
}
