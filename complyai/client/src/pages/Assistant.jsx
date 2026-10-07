import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Bot, User, Sparkles, Scale, ExternalLink,
  CheckCircle2, AlertTriangle, Copy, Check, RotateCcw, ArrowRight,
  ShieldAlert, BookOpen
} from 'lucide-react';
import api from '../services/api';
import { ConfidenceMeter } from '../components/shared/UIComponents';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const SUGGESTED_QUESTION_KEYS = [
  'asst_q1',
  'asst_q2',
  'asst_q3',
  'asst_q4',
  'asst_q5',
  'asst_q6'
];

export default function Assistant() {
  const { t, currentLang } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('asst_welcome_msg'),
      citations: [],
      recommended_actions: [],
      confidence: 1.0,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          ...prev[0],
          content: t('asst_welcome_msg')
        }];
      }
      return prev;
    });
  }, [currentLang, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const query = (messageText || input).trim();
    if (!query || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: query });
      const botResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.answer || "I have analyzed your query, but could not produce a detailed response.",
        citations: res.data.citations || [],
        recommended_actions: res.data.recommended_actions || [],
        confidence: res.data.confidence ?? 0.85,
        requires_verification: res.data.requires_verification ?? false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to get answer from compliance copilot');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I encountered an issue connecting to the compliance reasoning service. Please check your network or try asking again in a moment.",
          error: true,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              {t('asst_title')}
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {t('asst_rag_badge')}
              </span>
            </h1>
            <p className="text-xs text-surface-400">
              {t('asst_subtitle')}
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={handleClear}
            className="text-xs text-surface-400 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {t('asst_clear_chat')}
          </button>
        )}
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0 mt-1 border border-primary-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl ${
                    isUser
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'glass-card border-surface-700/60 text-surface-200 rounded-tl-none space-y-3'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>

                  {/* Actions & Citations for Assistant response */}
                  {!isUser && msg.id !== 'welcome' && (
                    <div className="space-y-3 pt-3 border-t border-surface-800">
                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {t('asst_citations')}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((cite, idx) => (
                              <a
                                key={idx}
                                href={cite.url || '#'}
                                target={cite.url ? '_blank' : '_self'}
                                rel="noreferrer"
                                className="text-xs bg-surface-900 hover:bg-surface-800 border border-surface-700/80 text-surface-300 hover:text-white px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-colors"
                              >
                                <span>{cite.title || cite.source_id}</span>
                                {cite.url && <ExternalLink className="w-3 h-3 text-primary-400" />}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Actions */}
                      {msg.recommended_actions && msg.recommended_actions.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {t('asst_recommended_actions')}
                          </span>
                          <ul className="space-y-1 text-xs text-surface-300">
                            {msg.recommended_actions.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-400 font-bold">•</span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Confidence & Copy */}
                      <div className="flex items-center justify-between text-xs text-surface-400 pt-2 border-t border-surface-800/80">
                        <div className="flex items-center gap-2">
                          <span>{t('comp_conf_col')}:</span>
                          <ConfidenceMeter value={msg.confidence} />
                        </div>

                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> {t('asst_copied')}
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> {t('asst_copy')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`text-[10px] text-surface-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-surface-800 text-surface-300 flex items-center justify-center flex-shrink-0 mt-1 border border-surface-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0 border border-primary-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none border-surface-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-surface-400 ml-2">...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips (when conversation has only initial messages) */}
      {messages.length <= 2 && (
        <div className="pb-3">
          <div className="text-[11px] text-surface-400 mb-2 font-medium">{t('asst_suggested_heading')}</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTION_KEYS.map((k, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(t(k))}
                disabled={loading}
                className="text-xs bg-surface-900/90 hover:bg-surface-800 border border-surface-700/60 hover:border-primary-500/40 text-surface-300 hover:text-white px-3 py-1.5 rounded-xl transition-all text-left"
              >
                {t(k)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="pt-2 border-t border-surface-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('asst_input_placeholder')}
            className="input-field text-sm flex-1 py-3"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary py-3 px-5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-surface-500 text-center mt-2">
          {t('asst_disclaimer')}
        </div>
      </div>
    </div>
  );
}
