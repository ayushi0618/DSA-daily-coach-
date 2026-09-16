import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Trash2, HelpCircle, Lightbulb, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';

const SUGGESTIONS = [
  "How to recognize if a problem requires Two Pointers vs Sliding Window?",
  "Explain Dynamic Programming memoization vs tabulation with an example.",
  "What are the top 5 edge cases to always test in Binary Tree problems?",
  "How can I optimize an O(N^2) solution down to O(N log N) or O(N)?",
];

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());
  const [input, setInput] = useState('');
  const [isSocratic, setIsSocratic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      text: query.trim(),
      isUser: true,
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    StorageService.saveChatMessage(userMsg);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const botResponse = await GeminiService.askDoubt(query, updated, isSocratic);
      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        text: botResponse,
        isUser: false,
        timestamp: Date.now(),
        isSocratic,
      };
      setMessages(prev => [...prev, botMsg]);
      StorageService.saveChatMessage(botMsg);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        text: "I encountered a hiccup answering that question. Please make sure your Gemini API key is configured or retry.",
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    StorageService.clearChatMessages();
    setMessages([
      {
        id: 'msg_welcome',
        text: "Chat cleared! Ask me any Data Structures & Algorithms doubts.",
        isUser: false,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-14rem)] min-h-[550px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                AI DSA Mentor
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Doubts, intuition breakdowns, and interview coaching
            </p>
          </div>
        </div>

        {/* Header Right: Socratic Mode Toggle & Clear Button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsSocratic(!isSocratic)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              isSocratic
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={`Toggle Socratic Mode (Currently ${isSocratic ? 'ON' : 'OFF'})`}
          >
            <Lightbulb className={`w-4 h-4 ${isSocratic ? 'text-amber-500' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">{isSocratic ? 'Socratic ON' : 'Direct Answer'}</span>
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.isUser
                  ? 'bg-indigo-600 text-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-900 shadow-sm'
              }`}
            >
              {msg.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm relative group ${
                msg.isUser
                  ? 'bg-indigo-600 text-slate-900 rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-800/50'
              }`}
            >
              {!msg.isUser && (
                <button
                  onClick={() => handleCopy(msg.text, msg.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 hover:text-slate-800 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition"
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {msg.isSocratic && (
                <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1.5">
                  <Lightbulb className="w-3 h-3" />
                  <span>Socratic Guidance Hint</span>
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-slate-900 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs ml-2 font-medium">Gemini DSA Coach is formulating your explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Suggested Doubts to Ask:
          </p>
          <div className="flex items-center space-x-2">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Field Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            isSocratic
              ? "Ask a question (AI will guide you with hints and intuition)..."
              : "Ask any DSA doubt (e.g. 'Explain 0/1 Knapsack DP transition')..."
          }
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-slate-900 font-bold transition shadow-md shadow-indigo-500/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
};
