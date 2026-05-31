'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, BrainCircuit, Terminal, ArrowRight } from 'lucide-react';
import { sendChatMessage } from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI Career Coach. I am connected to your professional profile and ready to help. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(currentInput);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.content
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I encountered an error connecting to the knowledge base. Please try again or check your CV upload status.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] max-w-4xl mx-auto flex flex-col bg-neutral-900/30 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-none mb-1">AI Career Coach</div>
            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Connected to MongoDB • Live Insight</div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10' 
                : 'bg-white/5 text-neutral-300 border border-white/5 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-white/5 text-neutral-500 text-sm italic flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                AI is analyzing your profile...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your career, CV, or interview prep..."
            className="w-full h-14 pl-6 pr-24 rounded-2xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
          />
          <div className="absolute right-2 top-2 bottom-2 flex gap-2">
            <button 
              onClick={handleSend}
              disabled={isTyping}
              className="px-6 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              Send <Send size={14} />
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar">
          {['Analyze my CV', 'What are my skill gaps?', 'How to improve my score?', 'Interview prep for Node.js'].map((chip, i) => (
            <button 
              key={i}
              onClick={() => setInput(chip)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-neutral-500 hover:text-white hover:border-white/20 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
