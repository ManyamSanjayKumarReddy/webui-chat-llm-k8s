import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import ChatInput from './components/ChatInput.jsx'
import { api } from './api.js'
import './App.css'

const SUGGESTIONS = [
  { icon: '🧠', text: 'Explain a complex concept' },
  { icon: '⚡', text: 'Solve a technical problem' },
  { icon: '🌱', text: 'Guide my learning path' },
  { icon: '📖', text: 'Share deep knowledge' },
]

export default function App() {
  const [sessions, setSessions] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      const res = await api('/sessions')
      const data = await res.json()
      setSessions(Array.isArray(data) ? data : [])
    } catch { }
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  async function selectSession(id) {
    if (id === activeId) return
    setHistoryLoading(true)
    setActiveId(id)
    setMessages([])
    try {
      const res = await api(`/chat/${id}/history`)
      const data = await res.json()
      setMessages(Array.isArray(data.messages) ? data.messages : [])
    } catch {
      setMessages([])
    } finally {
      setHistoryLoading(false)
    }
  }

  function startNewChat() {
    setActiveId(null)
    setMessages([])
  }

  async function deleteSession(id) {
    await api(`/chat/${id}`, { method: 'DELETE' })
    if (id === activeId) startNewChat()
    setSessions(prev => prev.filter(s => s.session_id !== id))
  }

  async function sendMessage(text) {
    // Add user message + empty streaming assistant placeholder
    setMessages(prev => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '', streaming: true }
    ])
    setLoading(true)

    try {
      const res = await api('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeId, message: text })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const evt = JSON.parse(jsonStr)

            if (evt.type === 'chunk') {
              setMessages(prev => {
                const msgs = [...prev]
                const last = msgs[msgs.length - 1]
                msgs[msgs.length - 1] = { ...last, content: last.content + evt.content }
                return msgs
              })
            } else if (evt.type === 'done') {
              setMessages(prev => {
                const msgs = [...prev]
                msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], streaming: false }
                return msgs
              })
              if (!activeId) {
                setActiveId(evt.session_id)
                setSessions(prev => [{
                  session_id: evt.session_id,
                  title: evt.title,
                  created_at: new Date().toISOString()
                }, ...prev])
              } else {
                setSessions(prev => prev.map(s =>
                  s.session_id === evt.session_id ? { ...s, title: evt.title } : s
                ))
              }
            } else if (evt.type === 'error') {
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: `Error: ${evt.message}`, streaming: false }
              ])
            }
          } catch { }
        }
      }
    } catch {
      setMessages(prev => {
        const msgs = [...prev]
        const last = msgs[msgs.length - 1]
        if (last?.streaming) {
          msgs[msgs.length - 1] = { role: 'assistant', content: 'Could not reach the server.', streaming: false }
        }
        return msgs
      })
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = messages.length === 0 && !historyLoading

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={selectSession}
        onNew={startNewChat}
        onDelete={deleteSession}
      />
      <main className="main">
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-glow" />
            <div className="empty-logo">✺</div>
            <h2 className="empty-title">What wisdom do you seek?</h2>
            <p className="empty-sub">Your AI guide to knowledge · Ask anything, learn everything</p>
            <div className="suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s.text} className="suggestion-chip" onClick={() => sendMessage(s.text)}>
                  <span className="chip-icon">{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatWindow messages={messages} historyLoading={historyLoading} />
        )}
        <ChatInput onSend={sendMessage} disabled={loading || historyLoading} />
      </main>
    </div>
  )
}
