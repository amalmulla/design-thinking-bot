import React, { useRef, useEffect } from "react";
import { Bot, MessageSquare, Paperclip, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";

export default function ChatPanel({
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
  currentPhase,
  isReadOnly
}) {
  const scrollRef = useRef(null);

  // Auto-scroll chat on new message logs
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="w-1/2 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative">
      {/* Chat Header */}
      <div className="h-12 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center px-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Socratic Guide</span>
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
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
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

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
              disabled={!inputValue.trim()}
              size="icon" 
              className={`absolute right-1.5 h-9 w-9 rounded-lg transition-all ${
                inputValue.trim() 
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
