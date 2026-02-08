import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am the StockFlow AI assistant. How can I help you manage your inventory or invoices today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Initialize Gemini Client
      // Note: In a real production environment, API calls should often be proxied through a backend
      // to keep the API key secure, but we follow the instruction to use process.env.API_KEY directly here.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // System instructions to give the bot context about the app
      const systemInstruction = `You are an expert AI assistant for "StockFlow", a web-based inventory management application.
      
      Here is an overview of the application features to help you answer user questions:
      1. **Dashboard**: Shows overview stats (Total Products, Inventory Value, Low Stock). Has an activity feed and a list of out-of-stock items.
      2. **Inventory**: Lists all products. Allows searching, filtering by category/status, sorting, and exporting to PDF/Excel. Users can delete or edit items here.
      3. **Add Product**: Form to create new products. Supports image upload, auto-SKU generation, and QR code generation.
      4. **Register Sale**: A point-of-sale feature. Users can scan/search items, add them to a cart, and process a sale, which automatically updates stock.
      5. **Invoices**: Manage supplier invoices. Statuses: Paid, Pending, Draft. Users can upload files and export reports.
      6. **History**: Logs of all actions (Sales, Stock additions, Invoice uploads).
      7. **Settings**: Change company profile, user profile, password, and toggle Dark/Light mode.
      
      **Tone**: Professional, helpful, concise, and friendly.
      **Goal**: Help employees perform tasks or understand how the app works.
      
      If a user asks how to do something, provide clear step-by-step instructions based on the features above.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          ...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const responseText = response.text || "I'm sorry, I couldn't generate a response at the moment.";

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to the AI service. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${
          isOpen 
            ? 'bg-red-500 text-white rotate-90' 
            : 'bg-primary text-white hover:bg-primary-hover'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-[380px] h-[500px] bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          
          {/* Header */}
          <div className="bg-primary p-4 flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">StockFlow AI</h3>
              <p className="text-xs text-blue-100 opacity-90">Powered by Gemini</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-main dark:text-gray-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                   <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about inventory, invoices..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default ChatBot;
