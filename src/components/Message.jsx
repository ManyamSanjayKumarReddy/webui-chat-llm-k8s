import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Message.css'

export default function Message({ role, content, isStreaming, index }) {
  const isUser = role === 'user'
  const isEmpty = !content

  return (
    <div
      className={`msg-row ${isUser ? 'msg-row--user' : 'msg-row--assistant'}`}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
    >
      {!isUser && (
        <div className="msg-avatar msg-avatar--bot">✺</div>
      )}

      <div className={`msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--assistant'}`}>
        {isUser ? (
          <p className="msg-content">{content}</p>
        ) : isEmpty && isStreaming ? (
          /* Typing dots while waiting for first chunk */
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        ) : (
          /* Markdown rendered assistant response */
          <div className="msg-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
            {isStreaming && <span className="stream-cursor" />}
          </div>
        )}
      </div>

      {isUser && (
        <div className="msg-avatar msg-avatar--user">U</div>
      )}
    </div>
  )
}
