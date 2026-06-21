import React, { useRef, useEffect } from "react";
import { Bot, MessageSquare, Paperclip, Send, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";

// A robust, React 19-compatible, zero-dependency lightweight Markdown parser
function parseMarkdown(text) {
  if (!text) return "";

  // Split by double newlines to separate paragraphs/blocks
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // 1. Heading 3: ### Heading
    if (trimmed.startsWith("### ")) {
      const content = trimmed.substring(4);
      return (
        <h3 key={index} className="text-sm font-bold mt-3 mb-1 text-zinc-900 dark:text-zinc-100 font-sans leading-snug">
          {parseInlineMarkdown(content)}
        </h3>
      );
    }

    // 2. Heading 2: ## Heading
    if (trimmed.startsWith("## ")) {
      const content = trimmed.substring(3);
      return (
        <h2 key={index} className="text-sm font-bold mt-2.5 mb-1 text-zinc-900 dark:text-zinc-100 font-sans leading-snug">
          {parseInlineMarkdown(content)}
        </h2>
      );
    }

    // 3. Bullet List: starts with "- " or "* "
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const lines = trimmed.split("\n");
      return (
        <ul key={index} className="list-disc pl-5 my-2 space-y-1.5 text-zinc-800 dark:text-zinc-300 font-sans">
          {lines.map((line, lIdx) => {
            const lineContent = line.replace(/^[-*]\s+/, "");
            return (
              <li key={lIdx} className="leading-relaxed text-sm">
                {parseInlineMarkdown(lineContent)}
              </li>
            );
          })}
        </ul>
      );
    }

    // 4. Numbered List: starts with a digit followed by a dot
    if (/^\d+\.\s+/.test(trimmed)) {
      const lines = trimmed.split("\n");
      return (
        <ol key={index} className="list-decimal pl-5 my-2 space-y-1.5 text-zinc-800 dark:text-zinc-300 font-sans">
          {lines.map((line, lIdx) => {
            const lineContent = line.replace(/^\d+\.\s+/, "");
            return (
              <li key={lIdx} className="leading-relaxed text-sm">
                {parseInlineMarkdown(lineContent)}
              </li>
            );
          })}
        </ol>
      );
    }

    // 5. Standard Paragraph
    return (
      <p key={index} className="mb-2 last:mb-0 leading-relaxed text-sm text-zinc-800 dark:text-zinc-300 font-sans select-text">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
}

// Helper to parse inline bolding (**text**)
function parseInlineMarkdown(text) {
  if (!text) return "";
  
  // Split by **
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    // Odd parts are matches between **
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-zinc-950 dark:text-white">{part}</strong>;
    }
    return part;
  });
}

export default function ChatPanel({
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
  currentPhase,
  isReadOnly,
  isAiTyping = false,
  onExportChat,
  canExportChat = false
}) {
  const scrollRef = useRef(null);

  // Auto-scroll chat natively
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 30);
    }
  }, [messages, isAiTyping]);

  return (
    <section className="w-1/2 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative">
      {/* Chat Header */}
      <div className="h-12 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Socratic Guide</span>
        </div>
        {canExportChat && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onExportChat}
            disabled={!messages || messages.length === 0}
            title={messages && messages.length > 0 ? "Export this conversation as Markdown" : "No conversation to export"}
            className="h-7 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Chat
          </Button>
        )}
      </div>

      {/* Chat History Viewport */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-250 dark:scrollbar-thumb-zinc-850"
      >
        {messages.length === 0 && !isAiTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-zinc-400 dark:text-zinc-500 py-20">
            <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-750" />
            <p className="text-sm max-w-xs select-none">
              Start the {currentPhase} phase. Describe your initial thoughts or ask for guidance to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className={`h-8 w-8 shrink-0 ${msg.role === "ai" ? "border border-zinc-200 dark:border-zinc-800" : ""}`}>
                  {msg.role === "ai" ? (
                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  ) : (
                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-xs text-zinc-850 dark:text-white">ME</AvatarFallback>
                  )}
                </Avatar>
                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 mb-1 px-1 uppercase tracking-wider select-none">
                    {msg.role === "user" ? "You" : "Design AI"}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm border border-zinc-200 dark:border-zinc-700" 
                      : "bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-tl-sm"
                  }`}>
                    {msg.role === "ai" ? (
                      <div className="space-y-2 select-text font-sans">
                        {parseMarkdown(msg.content)}
                      </div>
                    ) : (
                      <span className="select-text font-sans text-sm">{msg.content}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Bouncing Typing Dots Loader */}
            {isAiTyping && (
              <div className="flex gap-3 flex-row animate-in fade-in duration-200">
                <Avatar className="h-8 w-8 shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </Avatar>
                <div className="flex flex-col items-start max-w-[85%]">
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 mb-1 px-1 uppercase tracking-wider select-none">
                    Design AI
                  </span>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 min-w-[60px] select-none">
                    <span className="h-2 w-2 rounded-full bg-blue-500/70 dark:bg-blue-400/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-blue-500/70 dark:bg-blue-400/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-blue-500/70 dark:bg-blue-400/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Input / Read-Only Banner */}
      {isReadOnly ? (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 shrink-0 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-400 dark:text-zinc-500 font-semibold select-none flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Chat is read-only during teacher review.
        </div>
      ) : (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 shrink-0 border-t border-zinc-100 dark:border-zinc-900">
          <div className="relative flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 focus-within:border-zinc-400 dark:focus-within:border-zinc-700 transition-colors">
            <Button type="button" variant="ghost" size="icon" className="absolute left-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 h-8 w-8">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder={`Discuss the ${currentPhase} phase...`} 
              className="w-full bg-transparent border-0 focus-visible:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 pl-11 pr-12 h-12"
            />
            <Button 
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isAiTyping}
              size="icon" 
              className={`absolute right-1.5 h-9 w-9 rounded-lg transition-all ${
                inputValue.trim() && !isAiTyping
                  ? 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
              }`}
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
