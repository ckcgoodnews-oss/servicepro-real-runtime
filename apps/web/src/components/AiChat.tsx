'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ id: string; title: string }>;
  timestamp: string;
};

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Hello! I\'m your ServicePro AI assistant. I can help you find information from your knowledge base, answer questions about your operations, and provide recommendations. How can I help?', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: `msg_${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await api<{ reply: string; sources: Array<{ id: string; title: string }>; conversationId: string }>('POST', '/api/v1/ai/chat', { message: userMessage.content, conversationId });

      if (result.data) {
        setConversationId(result.data.conversationId);
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: result.data.reply,
          sources: result.data.sources,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, { id: `msg_${Date.now()}_err`, role: 'assistant', content: 'I encountered an error. Please try again.', timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: `msg_${Date.now()}_err`, role: 'assistant', content: 'Unable to connect to the AI service. Please check your connection.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', marginBottom: '1rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '75%', padding: '0.75rem 1rem', borderRadius: '12px', background: msg.role === 'user' ? '#1a73e8' : '#f1f3f4', color: msg.role === 'user' ? '#fff' : '#202124', fontSize: '0.9rem', lineHeight: 1.5 }}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '0.75rem', opacity: 0.8 }}>
                  Sources: {msg.sources.map(s => s.title).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: '#f1f3f4', fontSize: '0.9rem' }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #e0e0e0', background: '#fafafa' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about your business..."
          disabled={loading}
          style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: '0.75rem 1.5rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, opacity: loading || !input.trim() ? 0.6 : 1 }}>
          Send
        </button>
      </form>
    </div>
  );
}
