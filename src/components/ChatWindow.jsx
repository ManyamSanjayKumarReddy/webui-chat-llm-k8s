import { useEffect, useRef } from 'react'
import Message from './Message.jsx'
import './ChatWindow.css'

export default function ChatWindow({ messages = [], historyLoading }) {
  const safeMessages = Array.isArray(messages) ? messages : []
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (historyLoading) {
    return (
      <div className="chat-window">
        <div className="history-loading">
          <div className="spinner" />
          <span>Loading conversation…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="messages-inner">
        {safeMessages.map((msg, i) => (
          <Message
            key={i}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.streaming === true}
            index={i}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
