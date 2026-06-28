import React, { useEffect, useState } from "react";
import { Brain, LogOut } from "lucide-react";
import { LuSun, LuMoon, LuUser } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { Badge } from "./badge";
import { usersService } from "../../UsersManager/usersService";

export default function Header({ 
  theme, 
  toggleTheme, 
  brainColor = "text-pink-500 dark:text-pink-400", 
  children 
}) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(usersService.getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(usersService.getCurrentUser());
    };
    window.addEventListener("currentUserUpdated", handleUpdate);
    return () => {
      window.removeEventListener("currentUserUpdated", handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    usersService.logout();
    navigate("/login");
  };

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-200">
      {/* Left side: Brand Logo and Title */}
      <div className="flex items-center gap-2 shrink-0">
        <Brain className={`h-5 w-5 ${brainColor} transition-colors`} />
        <span className="text-sm font-bold tracking-wide text-zinc-800 dark:text-zinc-100 hidden sm:inline-block">
          Design Thinking Bot
        </span>
      </div>

      {/* Middle & Right: Children controls and unified user controls */}
      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 ml-2 sm:ml-4 min-w-0 shrink-0">
        {/* Render page-specific custom controls (e.g. back buttons) */}
        {children}
        
        {/* Unified Right-Side Controls */}
        {currentUser && (
          <>
            {/* [Role Badge] ("Student" or "Teacher") */}
            {currentUser.role?.toLowerCase() === "teacher" ? (
              <Badge 
                variant="secondary" 
                className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-semibold px-2.5 py-0.5 capitalize shadow-sm text-xs cursor-default hidden sm:inline-flex"
              >
                Teacher
              </Badge>
            ) : (
              <Badge 
                variant="secondary" 
                className="bg-zinc-200/60 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800 font-semibold px-2.5 py-0.5 capitalize shadow-sm text-xs cursor-default hidden sm:inline-flex"
              >
                Student
              </Badge>
            )}

            {/* [Profile Navigation Button] (LuUser) */}
            <button
              onClick={() => navigate('/profile')}
              type="button"
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-650 cursor-pointer flex items-center justify-center"
              aria-label="View Profile"
              title="View Profile"
            >
              <LuUser className="h-4.5 w-4.5" />
            </button>
          </>
        )}

        {/* [Theme Toggle Button] (LuSun/LuMoon) */}
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-650 cursor-pointer flex items-center justify-center"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <LuSun className="h-4.5 w-4.5" />
          ) : (
            <LuMoon className="h-4.5 w-4.5" />
          )}
        </button>

        {/* [Logout Button] (LogOut icon) */}
        {currentUser && (
          <button
            onClick={handleLogout}
            type="button"
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-650 cursor-pointer flex items-center justify-center"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </header>
  );
}

