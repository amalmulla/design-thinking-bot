import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  LogOut,
  Plus,
  Search,
  Users,
  Target,
  Lightbulb,
  Layers,
  FlaskConical,
  Star,
  Paperclip,
  Send,
  MessageSquare,
  Bot,
  ArrowLeft,
  ChevronRight,
  Upload,
  CheckCircle2,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Assuming standard shadcn/ui components are available
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";

// --- MOCK DATA ---

const DESIGN_PHASES = [
  { id: "empathize", label: "Empathize", icon: Users, color: "text-rose-400" },
  { id: "define", label: "Define", icon: Target, color: "text-blue-400" },
  { id: "ideate", label: "Ideate", icon: Lightbulb, color: "text-yellow-400" },
  { id: "prototype", label: "Prototype", icon: Layers, color: "text-purple-400" },
  { id: "test", label: "Test", icon: FlaskConical, color: "text-emerald-400" },
];

const RECENT_SESSIONS = [
  { id: 1, title: "Campus Food Waste", pinned: true },
  { id: 2, title: "Library App Redesign", pinned: false },
  { id: 3, title: "Student Onboarding", pinned: false },
];

const EMPATHY_MAP = [
  { title: "SAYS", color: "border-blue-500/30", items: ["I don't have time to sort trash", "The bins are confusing"] },
  { title: "THINKS", color: "border-purple-500/30", items: ["Why isn't this automated?", "Someone else will do it"] },
  { title: "DOES", color: "border-emerald-500/30", items: ["Throws everything in nearest bin", "Uses reusable bottles"] },
  { title: "FEELS", color: "border-rose-500/30", items: ["Guilty when using plastic", "Rushed between classes"] },
];

const STICKY_NOTES = [
  { id: 1, text: "Smart bins with AI sorting", color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-100" },
  { id: 2, text: "Gamified recycling app for students", color: "bg-blue-500/20 border-blue-500/30 text-blue-100" },
  { id: 3, text: "Mandatory campus composting", color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-100" },
];

// --- MAIN COMPONENT ---

export default function WorkspacePage() {
  const [currentPhase, setCurrentPhase] = useState("empathize");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");
    
    // Simulate Socratic AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        role: "ai", 
        content: `Reflecting on the ${currentPhase} phase: How does this specific idea challenge your initial assumptions?` 
      }]);
    }, 1000);
  };

  // --- DYNAMIC CANVAS RENDERS ---

  const renderCanvasContent = () => {
    switch (currentPhase) {
      case "empathize":
        return (
          <div className="grid grid-cols-2 gap-4 h-full content-start">
            {EMPATHY_MAP.map((quadrant, i) => (
              <Card key={i} className={`bg-zinc-950/50 border ${quadrant.color} shadow-sm rounded-xl`}>
                <CardHeader className="pb-2 pt-4 px-4 border-b border-inherit/30">
                  <CardTitle className="text-xs font-bold tracking-widest text-zinc-400">{quadrant.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {quadrant.items.map((item, idx) => (
                    <div key={idx} className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-800 leading-snug">
                      "{item}"
                    </div>
                  ))}
                  <button className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center mt-2 font-medium transition-colors">
                    <Plus className="h-3 w-3 mr-1" /> Add note
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case "define":
        return (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full mt-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                Problem Statement (POV)
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500">USER (Who)</label>
                  <Input className="bg-zinc-950 border-zinc-800 text-zinc-100" placeholder="e.g., A busy college student..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500">NEEDS (What)</label>
                  <Input className="bg-zinc-950 border-zinc-800 text-zinc-100" placeholder="e.g., Needs a quick way to recycle..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500">INSIGHT (Why)</label>
                  <textarea 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:ring-1 focus:ring-zinc-700 outline-none min-h-[100px]" 
                    placeholder="e.g., Because they feel guilty but prioritize getting to class on time..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "ideate":
        return (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 content-start">
            {STICKY_NOTES.map((note) => (
              <div 
                key={note.id} 
                className={`${note.color} border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer aspect-square flex flex-col`}
              >
                <p className="font-medium text-sm leading-relaxed flex-1">{note.text}</p>
              </div>
            ))}
            <button className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-900 transition-colors flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Add Idea</span>
            </button>
          </div>
        );

      case "prototype":
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 text-zinc-500">
            <div className="p-4 bg-zinc-900 rounded-full mb-4">
              <Upload className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-300">Upload Prototype Artifacts</h3>
            <p className="text-xs mt-1 text-center max-w-sm">
              Drag and drop wireframes, photos of physical models, or links to digital prototypes here.
            </p>
            <Button variant="outline" className="mt-6 bg-zinc-900 border-zinc-700 text-zinc-300">
              Browse Files
            </Button>
          </div>
        );

      case "test":
        return (
          <div className="grid grid-cols-2 gap-4 h-full content-start">
            <Card className="bg-zinc-950/50 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-400 flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> What Worked</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-zinc-500">Capture positive user feedback here...</p></CardContent>
            </Card>
            <Card className="bg-zinc-950/50 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-rose-400 flex items-center gap-2"><AlertCircle className="h-4 w-4"/> What Could Be Improved</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-zinc-500">Capture pain points and friction here...</p></CardContent>
            </Card>
            <Card className="bg-zinc-950/50 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-400 flex items-center gap-2"><HelpCircle className="h-4 w-4"/> Questions Raised</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-zinc-500">What confused the user?</p></CardContent>
            </Card>
            <Card className="bg-zinc-950/50 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-400 flex items-center gap-2"><Lightbulb className="h-4 w-4"/> New Ideas</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-zinc-500">New solutions sparked during testing...</p></CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* GLOBAL HEADER */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 p-0 px-2 h-8"
          onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Separator orientation="vertical" className="h-6 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-pink-400" />
            <h1 className="text-sm font-bold tracking-wide text-zinc-100">Eco-Packaging Project</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-zinc-900 text-zinc-300 border-zinc-800">
            Student
          </Badge>
          {/* Replace your existing LogOut Button with this */}
          <Button 
            variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 hidden sm:flex" 
            onClick={() => navigate('/login')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* MAIN BODY WRAPPER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL 1: LEFT SIDEBAR (Fixed w-64) */}
        <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
          <div className="p-4 space-y-5 flex-1 overflow-y-auto">
            <Button 
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-sm font-semibold"
              onClick={() => navigate('/workspace/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search projects..." 
                className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700 placeholder:text-zinc-600 text-sm"
              />
            </div>

            <div className="space-y-1 pt-2">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1">Recent Sessions</h3>
              {RECENT_SESSIONS.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-900 cursor-pointer group transition-colors"
                  onClick={() => navigate(`/workspace/${session.id}`)}
                >
                  <span className="text-sm font-medium text-zinc-300 truncate pr-2">{session.title}</span>
                  {session.pinned && <Star className="h-3.5 w-3.5 text-yellow-500/70 fill-yellow-500/20 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* PANELS 2 & 3 CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          
          {/* HORIZONTAL PHASE STEPPER (Top Bar) */}
          <div className="h-16 shrink-0 border-b border-zinc-800 flex items-center px-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center w-full max-w-4xl mx-auto justify-between">
              {DESIGN_PHASES.map((phase, index) => {
                const Icon = phase.icon;
                const isActive = currentPhase === phase.id;
                
                // Determine if a step is "past" (for generic styling if desired)
                const currentIndex = DESIGN_PHASES.findIndex(p => p.id === currentPhase);
                const isCompleted = index < currentIndex;

                return (
                  <React.Fragment key={phase.id}>
                    <button
                      onClick={() => setCurrentPhase(phase.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                        isActive 
                          ? "bg-zinc-900 text-zinc-100" 
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${isActive ? 'bg-zinc-800' : ''}`}>
                        <Icon className={`h-4 w-4 ${isActive ? phase.color : (isCompleted ? 'text-zinc-400' : 'text-zinc-600')}`} />
                      </div>
                      <span className="text-sm font-semibold tracking-wide">{phase.label}</span>
                    </button>
                    {/* Connector line between steps */}
                    {index < DESIGN_PHASES.length - 1 && (
                      <div className="flex-1 max-w-[40px] mx-2 h-[1px] bg-zinc-800" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* CENTRAL SPLIT VIEW */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* PANEL 2: SOCRATIC CHATBOT (Left/Middle Column, 50%) */}
            <section className="w-1/2 flex flex-col border-r border-zinc-800 bg-zinc-950 relative">
              
              {/* Chat Header */}
              <div className="h-12 border-b border-zinc-800/50 flex items-center px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-zinc-300">Socratic Guide</span>
                </div>
              </div>

              {/* Chat History */}
              <ScrollArea ref={scrollRef} className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-zinc-500 py-20">
                    <MessageSquare className="h-8 w-8 text-zinc-700" />
                    <p className="text-sm max-w-xs">
                      Start the {currentPhase} phase. Describe your initial thoughts or ask for guidance to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <Avatar className={`h-8 w-8 shrink-0 ${msg.role === "ai" ? "border border-zinc-800" : ""}`}>
                          {msg.role === "ai" ? (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-blue-400" />
                            </div>
                          ) : (
                            <AvatarFallback className="bg-zinc-800 text-xs text-white">ME</AvatarFallback>
                          )}
                        </Avatar>
                        <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                          <span className="text-[10px] font-medium text-zinc-600 mb-1 px-1 uppercase tracking-wider">
                            {msg.role === "user" ? "You" : "Design AI"}
                          </span>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user" 
                              ? "bg-zinc-800 text-zinc-100 rounded-tr-sm" 
                              : "bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-tl-sm"
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 bg-zinc-950 shrink-0">
                <div className="relative flex items-center border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-zinc-700 transition-colors">
                  <Button type="button" variant="ghost" size="icon" className="absolute left-2 text-zinc-500 hover:text-zinc-300 h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder={`Discuss the ${currentPhase} phase...`} 
                    className="w-full bg-transparent border-0 focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-600 pl-11 pr-12 h-12"
                  />
                  <Button 
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim()}
                    size="icon" 
                    className={`absolute right-1.5 h-9 w-9 rounded-lg transition-all ${
                      inputValue.trim() ? 'bg-zinc-100 text-zinc-900 hover:bg-white' : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
              </div>
            </section>

            {/* PANEL 3: PHASE DELIVERABLES CANVAS (Right Column, 50%) */}
            <section className="w-1/2 flex flex-col bg-zinc-950">
              
              {/* Canvas Header */}
              <div className="h-12 border-b border-zinc-800/50 flex items-center justify-between px-6 shrink-0">
                <h2 className="text-sm font-semibold text-zinc-100 capitalize">
                  {currentPhase} Canvas
                </h2>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-800 rounded">
                  Export
                </Button>
              </div>

              {/* Dynamic Canvas Area */}
              <ScrollArea className="flex-1">
                <div className="p-6 h-full">
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
