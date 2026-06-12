import { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [text])

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const hasText = text.trim().length > 0

  return (
    <div className="input-wrapper">
      <form className={`input-box ${disabled ? 'input-box--disabled' : ''} ${hasText ? 'input-box--active' : ''}`} onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Guru…"
          rows={1}
          disabled={disabled}
        />
        <button
          type="submit"
          className={`send-btn ${hasText && !disabled ? 'send-btn--ready' : ''}`}
          disabled={disabled || !hasText}
        >
          {disabled ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
      <p className="input-hint">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
