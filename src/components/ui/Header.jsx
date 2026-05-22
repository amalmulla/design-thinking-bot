import React from "react";
import { Brain } from "lucide-react";
import { LuSun, LuMoon } from "react-icons/lu";

export default function Header({ 
  theme, 
  toggleTheme, 
  brainColor = "text-pink-500 dark:text-pink-400", 
  children 
}) {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-200">
      {/* Left side: Brand Logo and Title */}
      <div className="flex items-center gap-2 shrink-0">
        <Brain className={`h-5 w-5 ${brainColor} transition-colors`} />
        <span className="text-sm font-bold tracking-wide text-zinc-800 dark:text-zinc-100">
          Design Thinking Bot
        </span>
      </div>

      {/* Middle & Right: Children controls and theme toggle */}
      <div className="flex flex-1 items-center justify-end gap-4 ml-4">
        {children}
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-650"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <LuSun className="h-4.5 w-4.5" />
          ) : (
            <LuMoon className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </header>
  );
}
