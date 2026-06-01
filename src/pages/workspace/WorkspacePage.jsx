import React, { useState, useEffect } from "react";
import { Plus, Search, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Standard shadcn/ui style components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import Header from "../../components/ui/Header";
import { usersService } from "../../UsersManager/usersService";
import { getRandomPrompt } from "../../lib/socraticQuestions";

// Modular Workspace Components
import PhaseStepper from "../../components/ProgressTracker/PhaseStepper";
import ChatPanel from "../../components/Chat/ChatPanel";
import EmpathyMapCanvas from "../../components/PersonaBuilder/EmpathyMapCanvas";
import POVDefineCanvas from "../../components/DesignCanvas/POVDefineCanvas";
import IdeationStickyNotes from "../../components/IdeationBoard/IdeationStickyNotes";
import UploadPrototype from "../../components/PrototypeTools/UploadPrototype";
import TestFeedbackGrid from "../../components/DesignCanvas/TestFeedbackGrid";

// --- MOCK DATA ---

const RECENT_SESSIONS = [
  { id: 1, title: "Campus Food Waste", pinned: true },
  { id: 2, title: "Library App Redesign", pinned: false },
  { id: 3, title: "Student Onboarding", pinned: false },
];

// --- MAIN COMPONENT ---

export default function WorkspacePage({ theme, toggleTheme }) {
  const [currentPhase, setCurrentPhase] = useState("empathize");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  // Simulated Read-Only state for Teacher Review
  const isReadOnly = window.location.pathname.includes('/teacher/review/');

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");
    
    // Simulate Socratic AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        role: "ai", 
        content: getRandomPrompt(currentPhase) 
      }]);
    }, 1000);
  };

  // --- DYNAMIC CANVAS RENDERS ---

  const renderCanvasContent = () => {
    switch (currentPhase) {
      case "empathize":
        return <EmpathyMapCanvas isReadOnly={isReadOnly} />;
      
      case "define":
        return <POVDefineCanvas isReadOnly={isReadOnly} />;

      case "ideate":
        return <IdeationStickyNotes isReadOnly={isReadOnly} />;

      case "prototype":
        return <UploadPrototype isReadOnly={isReadOnly} />;

      case "test":
        return <TestFeedbackGrid />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-200">
      
      {/* GLOBAL HEADER */}
      <Header theme={theme} toggleTheme={toggleTheme} brainColor="text-pink-500 dark:text-pink-400">
        <div className="flex items-center gap-3 mr-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-0 px-2 h-8 cursor-pointer"
            onClick={() => {
              const activeUser = usersService.getCurrentUser();
              if (activeUser && activeUser.role === "teacher") {
                navigate("/teacher");
              } else {
                navigate("/dashboard");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {usersService.getCurrentUser()?.role === "teacher" ? "Back to Command Center" : "Back to Dashboard"}
          </Button>
          <Separator orientation="vertical" className="h-6 bg-zinc-200 dark:bg-zinc-800" />
          <h1 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">Eco-Packaging Project</h1>
          {isReadOnly && (
            <Badge className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100/50 gap-1.5 text-xs font-semibold py-0.5 px-2 capitalize shadow-sm select-none">
              Review Mode (Read-Only)
            </Badge>
          )}
        </div>
      </Header>

      {/* MAIN BODY WRAPPER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL 1: LEFT SIDEBAR (Fixed w-64) */}
        <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col">
          <div className="p-4 space-y-5 flex-1 overflow-y-auto">
            <Button 
              disabled={isReadOnly}
              className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => navigate('/workspace/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <Input 
                placeholder="Search projects..." 
                className="pl-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1 pt-2">
              <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1">Recent Sessions</h3>
              {RECENT_SESSIONS.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer group transition-colors"
                  onClick={() => navigate(`/workspace/${session.id}`)}
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">{session.title}</span>
                  {session.pinned && <Star className="h-3.5 w-3.5 text-yellow-500/70 fill-yellow-500/20 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* PANELS 2 & 3 CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
          
          {/* HORIZONTAL PHASE STEPPER (Top Bar) */}
          <PhaseStepper currentPhase={currentPhase} setCurrentPhase={setCurrentPhase} />

          {/* CENTRAL SPLIT VIEW */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* PANEL 2: SOCRATIC CHATBOT (Left/Middle Column, 50%) */}
            <ChatPanel
              messages={messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSendMessage={handleSendMessage}
              currentPhase={currentPhase}
              isReadOnly={isReadOnly}
            />

            {/* PANEL 3: PHASE DELIVERABLES CANVAS (Right Column, 50%) */}
            <section className="w-1/2 flex flex-col bg-white dark:bg-zinc-950">
              
              {/* Canvas Header */}
              <div className="h-12 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-6 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 capitalize">
                  {currentPhase} Canvas
                </h2>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded">
                  Export
                </Button>
              </div>

              {/* Dynamic Canvas Area */}
              <ScrollArea className="flex-1">
                <div className="p-6 h-full bg-white dark:bg-zinc-950">
                  {renderCanvasContent()}
                </div>
              </ScrollArea>

            </section>
          </div>

        </main>
      </div>
    </div>
  );
}
