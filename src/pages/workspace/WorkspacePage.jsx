import React, { useState, useEffect } from "react";
import { Plus, Search, Star, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Standard shadcn/ui style components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import Header from "../../components/ui/Header";
import { usersService } from "../../UsersManager/usersService";
import { getRandomPrompt } from "../../lib/socraticQuestions";
import { createChatMessage } from "../../lib/dataModels";
import { PROJECT_DATA } from "../../data/challenges";

// Modular Workspace Components
import PhaseStepper from "../../components/ProgressTracker/PhaseStepper";
import ChatPanel from "../../components/Chat/ChatPanel";
import EmpathyMapCanvas from "../../components/PersonaBuilder/EmpathyMapCanvas";
import POVDefineCanvas from "../../components/DesignCanvas/POVDefineCanvas";
import IdeationStickyNotes from "../../components/IdeationBoard/IdeationStickyNotes";
import UploadPrototype from "../../components/PrototypeTools/UploadPrototype";
import TestFeedbackGrid from "../../components/DesignCanvas/TestFeedbackGrid";

// --- MAIN COMPONENT ---

export default function WorkspacePage({ theme, toggleTheme }) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Dynamic sessionStorage States
  const [studentProjects, setStudentProjects] = useState(() => {
    const stored = sessionStorage.getItem("studentProjects");
    if (!stored) {
      sessionStorage.setItem("studentProjects", JSON.stringify(PROJECT_DATA));
      return PROJECT_DATA;
    }
    return JSON.parse(stored);
  });

  // Simulated Read-Only state for Teacher Review
  const isReadOnly = window.location.pathname.includes('/teacher/review/');

  // Find active project or fallback to first
  const activeProject = studentProjects.find(
    (p) => p.id.toString() === projectId?.toString()
  ) || studentProjects[0] || null;

  const [currentPhase, setCurrentPhase] = useState("empathize");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Sync state on project loading
  useEffect(() => {
    if (activeProject) {
      setCurrentPhase(activeProject.currentPhase || "empathize");
      setMessages(activeProject.messages || []);
    }
  }, [projectId, activeProject?.id]);

  const saveProject = (updatedProj) => {
    const updatedProjects = studentProjects.map((p) =>
      p.id.toString() === updatedProj.id.toString() ? updatedProj : p
    );
    sessionStorage.setItem("studentProjects", JSON.stringify(updatedProjects));
    setStudentProjects(updatedProjects);
  };

  const handlePhaseChange = (newPhase) => {
    setCurrentPhase(newPhase);
    if (activeProject && !isReadOnly) {
      const phaseProgress = {
        empathize: 20,
        define: 40,
        ideate: 60,
        prototype: 80,
        test: 100
      };
      const updated = {
        ...activeProject,
        currentPhase: newPhase,
        progressPercentage: phaseProgress[newPhase] || activeProject.progressPercentage,
        lastUpdated: "Just now"
      };
      saveProject(updated);
    }
  };

  const handleSendMessage = (text) => {
    if (!text.trim() || !activeProject || isReadOnly) return;
    
    const userMsg = createChatMessage("user", text);
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    
    const updatedProjWithUser = {
      ...activeProject,
      messages: newMessages,
      lastUpdated: "Just now"
    };
    saveProject(updatedProjWithUser);
    
    // Simulate Socratic AI response
    setTimeout(() => {
      const aiMsg = createChatMessage("ai", getRandomPrompt(currentPhase));
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      
      const updatedProjWithAI = {
        ...activeProject,
        messages: finalMessages,
        lastUpdated: "Just now"
      };
      saveProject(updatedProjWithAI);
    }, 1000);
  };

  // Safe canvas data resolution
  const canvasData = activeProject?.canvasData || {};

  // Empathize fields
  const empathizeSays = canvasData.empathize?.says || [];
  const empathizeThinks = canvasData.empathize?.thinks || [];
  const empathizeDoes = canvasData.empathize?.does || [];
  const empathizeFeels = canvasData.empathize?.feels || [];

  // POV fields
  const povUser = canvasData.define?.user || "";
  const povNeeds = canvasData.define?.needs || "";
  const povInsight = canvasData.define?.insight || "";

  // Ideate fields
  const ideateNotes = canvasData.ideate || [];

  // Prototype fields
  const prototypeList = canvasData.prototype || [];

  // Test fields
  const testWorked = canvasData.test?.worked || "";
  const testImproved = canvasData.test?.improved || "";
  const testQuestions = canvasData.test?.questions || "";
  const testIdeas = canvasData.test?.ideas || "";

  const updateCanvasData = (phase, fieldOrValue, value) => {
    if (!activeProject || isReadOnly) return;

    let updatedCanvas = { ...activeProject.canvasData };

    if (phase === "empathize") {
      updatedCanvas.empathize = {
        ...updatedCanvas.empathize,
        [fieldOrValue]: value
      };
    } else if (phase === "define") {
      updatedCanvas.define = {
        ...updatedCanvas.define,
        [fieldOrValue]: value
      };
    } else if (phase === "ideate") {
      updatedCanvas.ideate = fieldOrValue;
    } else if (phase === "prototype") {
      updatedCanvas.prototype = fieldOrValue;
    } else if (phase === "test") {
      updatedCanvas.test = {
        ...updatedCanvas.test,
        [fieldOrValue]: value
      };
    }

    const updatedProject = {
      ...activeProject,
      canvasData: updatedCanvas,
      lastUpdated: "Just now"
    };

    saveProject(updatedProject);
  };

  // --- DYNAMIC CANVAS RENDERS ---

  const renderCanvasContent = () => {
    switch (currentPhase) {
      case "empathize":
        return (
          <EmpathyMapCanvas 
            isReadOnly={isReadOnly} 
            says={empathizeSays}
            thinks={empathizeThinks}
            does={empathizeDoes}
            feels={empathizeFeels}
            onUpdate={(quadrant, newItems) => updateCanvasData("empathize", quadrant, newItems)}
          />
        );
      
      case "define":
        return (
          <POVDefineCanvas 
            isReadOnly={isReadOnly} 
            userVal={povUser}
            needsVal={povNeeds}
            insightVal={povInsight}
            onUpdate={(field, val) => updateCanvasData("define", field, val)}
          />
        );

      case "ideate":
        return (
          <IdeationStickyNotes 
            isReadOnly={isReadOnly} 
            notes={ideateNotes}
            onUpdate={(newNotes) => updateCanvasData("ideate", newNotes)}
          />
        );

      case "prototype":
        return (
          <UploadPrototype 
            isReadOnly={isReadOnly} 
            prototypes={prototypeList}
            onUpdate={(newList) => updateCanvasData("prototype", newList)}
          />
        );

      case "test":
        return (
          <TestFeedbackGrid 
            isReadOnly={isReadOnly}
            worked={testWorked}
            improved={testImproved}
            questions={testQuestions}
            ideas={testIdeas}
            onUpdate={(field, val) => updateCanvasData("test", field, val)}
          />
        );

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
          <h1 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
            {activeProject ? activeProject.title : "Design Thinking Project"}
          </h1>
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
              onClick={() => {
                const challenges = JSON.parse(sessionStorage.getItem("challenges") || "[]");
                if (challenges.length > 0) {
                  // Route back to dashboard and open model
                  navigate('/dashboard');
                } else {
                  navigate('/dashboard');
                }
              }}
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
              {studentProjects.slice(0, 5).map((project) => (
                <div 
                  key={project.id} 
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer group transition-colors ${
                    activeProject && project.id.toString() === activeProject.id.toString()
                      ? "bg-zinc-200 dark:bg-zinc-900"
                      : "hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50"
                  }`}
                  onClick={() => {
                    if (isReadOnly) {
                      navigate(`/teacher/review/${project.id}`);
                    } else {
                      navigate(`/workspace/${project.id}`);
                    }
                  }}
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">{project.title}</span>
                  {project.isRecent && <Star className="h-3.5 w-3.5 text-yellow-500/70 fill-yellow-500/20 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* PANELS 2 & 3 CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
          
          {/* HORIZONTAL PHASE STEPPER (Top Bar) */}
          <PhaseStepper currentPhase={currentPhase} setCurrentPhase={handlePhaseChange} />

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
