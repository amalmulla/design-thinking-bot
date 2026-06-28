import React, { useState, useEffect } from "react";
import { Plus, Search, Star, ArrowLeft, Menu, MessageSquare, LayoutTemplate, X, Trash2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Standard shadcn/ui style components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import Header from "../components/ui/Header";
import { usersService } from "./usersService";
import { apiService } from "../lib/apiService";
import { getRandomPrompt } from "../components/ChatBot/socraticQuestions";
import { createChatMessage } from "../lib/dataModels";
import { getSocraticChatCompletion } from "../lib/aiService";
import { exportProjectJSON, exportProjectMarkdown, exportProjectPDF } from "../lib/projectExport";

// Modular Workspace Components
import PhaseStepper from "../components/ProgressTracker/PhaseStepper";
import ChatPanel from "../components/ChatBot/ChatPanel";
import EmpathyMapCanvas from "../components/PersonaBuilder/EmpathyMapCanvas";
import POVDefineCanvas from "../components/DesignCanvas/POVDefineCanvas";
import IdeationStickyNotes from "../components/IdeationBoard/IdeationStickyNotes";
import UploadPrototype from "../components/PrototypeTools/UploadPrototype";
import TestFeedbackGrid from "../components/DesignCanvas/TestFeedbackGrid";

// --- MAIN COMPONENT ---

export default function WorkspacePage({ theme, toggleTheme }) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [studentProjects, setStudentProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPhase, setCurrentPhase] = useState("empathize");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState("chat"); // "chat" or "canvas"
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf"); // pdf, md, json
  const [exportScope, setExportScope] = useState("full"); // full, chat, canvas

  // Simulated Read-Only state for Teacher Review
  const isReadOnly = window.location.pathname.includes('/teacher/review/');

  // Sync state on project loading
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        setIsLoading(true);
        const currentUser = usersService.getCurrentUser();
        const isTeacher = currentUser?.role?.toLowerCase() === 'teacher';

        // Load side panel projects (teachers see only their own students' projects)
        const allProjects = isTeacher
          ? await apiService.getProjectsByTeacher(currentUser?.id)
          : await apiService.getProjects(currentUser?.id);
        const normalizedProjects = (allProjects || []).map(p => ({ 
          ...p, 
          id: p._id || p.id, 
          title: p.name || p.title || 'Untitled Project',
          currentPhase: p.currentPhase?.toLowerCase() || 'empathize' 
        }));
        setStudentProjects(normalizedProjects);

        // Load active project canvas
        if (projectId && projectId !== 'new') {
          const projectRaw = await apiService.getProjectById(projectId);
          const normalizedActive = { 
            ...projectRaw, 
            id: projectRaw._id || projectRaw.id, 
            title: projectRaw.name || projectRaw.title || 'Untitled Project',
            currentPhase: projectRaw.currentPhase?.toLowerCase() || 'empathize' 
          };
          setActiveProject(normalizedActive);
          setCurrentPhase(normalizedActive.currentPhase);
          setMessages(normalizedActive.messages || []);
        } else if (normalizedProjects.length > 0) {
          const fallbackProject = normalizedProjects[0];
          setActiveProject(fallbackProject);
          setCurrentPhase(fallbackProject.currentPhase);
          setMessages(fallbackProject.messages || []);
        }
      } catch (err) {
        console.error("Failed to load workspace data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [projectId]);

  const handlePhaseChange = async (newPhase) => {
    setCurrentPhase(newPhase);
    if (activeProject && !isReadOnly) {
      const phaseProgress = { empathize: 20, define: 40, ideate: 60, prototype: 80, test: 100 };
      const updated = {
        ...activeProject,
        currentPhase: newPhase,
        progressPercentage: phaseProgress[newPhase] || activeProject.progressPercentage
      };
      
      setActiveProject(updated); // Optimistic UI update
      
      try {
        await apiService.updateProject(activeProject.id, { 
          currentPhase: newPhase,
          progressPercentage: phaseProgress[newPhase] || activeProject.progressPercentage
        });
      } catch (err) {
        console.error("Failed to update phase to DB:", err);
      }
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await apiService.deleteProject(projectToDelete);
      
      const remainingProjects = studentProjects.filter(p => p.id !== projectToDelete);
      setStudentProjects(remainingProjects);
      
      if (activeProject && activeProject.id === projectToDelete) {
        navigate('/dashboard');
      }
      
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. Please try again. Error: " + err.message);
      setProjectToDelete(null); // Close modal even on error so they aren't stuck
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !activeProject || isReadOnly || isAiTyping) return;
    
    const userMsg = createChatMessage("user", text);
    const newMessages = [...messages, userMsg];
    
    // Optimistic local update
    setMessages(newMessages);
    setInputValue("");
    setActiveProject(prev => ({ ...prev, messages: newMessages }));
    
    // Transmit user msg array to DB
    try {
      await apiService.updateProject(activeProject.id, { messages: newMessages });
    } catch (err) {
      console.error("Failed to save user message:", err);
    }
    
    // Trigger live GenAI chat
    setIsAiTyping(true);
    try {
      const aiResponseText = await getSocraticChatCompletion(newMessages, currentPhase, activeProject?.canvasData || {});
      const aiMsg = createChatMessage("ai", aiResponseText);
      const finalMessages = [...newMessages, aiMsg];
      
      // Optimistic local update
      setMessages(finalMessages);
      setActiveProject(prev => ({ ...prev, messages: finalMessages }));
      
      // Transmit AI msg array to DB
      await apiService.updateProject(activeProject.id, { messages: finalMessages });
    } catch (err) {
      console.error("[Socratic Chatbot] Error generating AI response:", err);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Open the new export modal
  const handleExportProjectClick = () => {
    setIsExportModalOpen(true);
  };

  const handleExportConfirm = () => {
    try {
      const includeChat = exportScope === 'full' || exportScope === 'chat';
      const includeCanvases = exportScope === 'full' || exportScope === 'canvas';
      
      const projectData = { ...activeProject, messages };

      if (exportFormat === 'json') {
        exportProjectJSON(projectData);
      } else if (exportFormat === 'md') {
        exportProjectMarkdown(projectData, includeChat, includeCanvases);
      } else if (exportFormat === 'pdf') {
        exportProjectPDF(projectData, includeChat, includeCanvases);
      }

      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export: " + err.message);
    }
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

  const updateCanvasData = async (phase, fieldOrValue, value) => {
    if (!activeProject || isReadOnly) return;

    try {
      const canvasData = activeProject.canvasData || {};
      let updatedCanvas = { ...canvasData };

      if (phase === "empathize") {
        const currentEmpathize = typeof canvasData.empathize === "object" && !Array.isArray(canvasData.empathize)
          ? canvasData.empathize
          : {};
        updatedCanvas.empathize = {
          ...currentEmpathize,
          [fieldOrValue]: value
        };
      } else if (phase === "define") {
        const currentDefine = typeof canvasData.define === "object" ? canvasData.define : {};
        updatedCanvas.define = {
          ...currentDefine,
          [fieldOrValue]: value
        };
      } else if (phase === "ideate") {
        updatedCanvas.ideate = fieldOrValue;
      } else if (phase === "prototype") {
        updatedCanvas.prototype = fieldOrValue;
      } else if (phase === "test") {
        const currentTest = typeof canvasData.test === "object" ? canvasData.test : {};
        updatedCanvas.test = {
          ...currentTest,
          [fieldOrValue]: value
        };
      }

      // Optimistic Update
      setActiveProject(prev => ({ ...prev, canvasData: updatedCanvas }));

      // Database Patch
      await apiService.updateProject(activeProject.id, { 
        canvasData: updatedCanvas, 
        currentPhase: currentPhase 
      });

    } catch (err) {
      console.error("[Workspace] Error updating canvas data:", err);
    }
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-200">
      
      {/* GLOBAL HEADER */}
      <Header theme={theme} toggleTheme={toggleTheme} brainColor="text-pink-500 dark:text-pink-400">
        <div className="flex items-center gap-2 sm:gap-3 mr-auto">
          {!isReadOnly && (
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 h-8 w-8 shrink-0"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-0 px-2 h-8 cursor-pointer"
            onClick={() => {
              const activeUser = usersService.getCurrentUser();
              if (activeUser && activeUser.role?.toLowerCase() === "teacher") {
                navigate("/teacher");
              } else {
                navigate("/dashboard");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {usersService.getCurrentUser()?.role?.toLowerCase() === "teacher" ? "Back to Command Center" : "Back to Dashboard"}
            </span>
          </Button>
          <Separator orientation="vertical" className="h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
          <h1 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 truncate max-w-[120px] sm:max-w-xs">
            {activeProject ? activeProject.title : "Design Thinking Project"}
          </h1>
          {isReadOnly && (
            <Badge className="hidden sm:inline-flex bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100/50 gap-1.5 text-xs font-semibold py-0.5 px-2 capitalize shadow-sm select-none">
              Review Mode (Read-Only)
            </Badge>
          )}
        </div>
      </Header>

      {/* MAIN BODY WRAPPER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL 1: LEFT SIDEBAR (Mobile overlay + Desktop fixed) */}
        {!isReadOnly && (
          <>
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <aside className={`w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-col absolute inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex lg:flex`}>
          <div className="p-4 space-y-5 flex-1 overflow-y-auto">
            <div className="flex justify-end lg:hidden mb-2">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
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
                    setIsSidebarOpen(false);
                    if (isReadOnly) {
                      navigate(`/teacher/review/${project.id}`);
                    } else {
                      navigate(`/workspace/${project.id}`);
                    }
                  }}
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2 flex-1">{project.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {project.isRecent && <Star className="h-3.5 w-3.5 text-yellow-500/70 fill-yellow-500/20" />}
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        </>
        )}

        {/* PANELS 2 & 3 CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative">
          
          {/* MOBILE VIEW TOGGLE */}
          <div className="md:hidden flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
            <button 
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeMobileView === 'chat' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-zinc-500'}`}
              onClick={() => setActiveMobileView('chat')}
            >
              <MessageSquare className="h-4 w-4" /> Chat
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeMobileView === 'canvas' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-zinc-500'}`}
              onClick={() => setActiveMobileView('canvas')}
            >
              <LayoutTemplate className="h-4 w-4" /> Canvas
            </button>
          </div>

          {/* HORIZONTAL PHASE STEPPER (Top Bar) */}
          <PhaseStepper currentPhase={currentPhase} setCurrentPhase={handlePhaseChange} />

          {/* CENTRAL SPLIT VIEW */}
          <div className="flex flex-1 overflow-hidden flex-row relative">
            
            {/* PANEL 2: SOCRATIC CHATBOT (Left/Middle Column, 50%) */}
            <div className={`w-full md:w-1/2 flex-col absolute inset-0 md:relative md:flex ${activeMobileView === 'chat' ? 'flex' : 'hidden'}`}>
              <ChatPanel
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSendMessage}
                currentPhase={currentPhase}
                isReadOnly={isReadOnly}
                isAiTyping={isAiTyping}
                onExportProject={handleExportProjectClick}
                canExportChat={isReadOnly}
              />
            </div>

            {/* PANEL 3: PHASE DELIVERABLES CANVAS (Right Column, 50%) */}
            <section className={`w-full md:w-1/2 flex-col bg-white dark:bg-zinc-950 min-h-0 md:border-l border-zinc-200 dark:border-zinc-800 absolute inset-0 md:relative md:flex ${activeMobileView === 'canvas' ? 'flex' : 'hidden'}`}>
              
              {/* Canvas Header */}
              <div className="h-12 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-6 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 capitalize">
                  {currentPhase} Canvas
                </h2>
              </div>

              {/* Dynamic Canvas Area Viewport */}
              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-950 scrollbar-thin">
                {renderCanvasContent()}
              </div>

            </section>
          </div>

        </main>
      </div>

      {/* EXPORT CONFIGURATION MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Export Project Data</h3>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Content to Export</label>
                <select
                  value={exportScope}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <option value="full">Full Project (Chat + Canvases)</option>
                  <option value="chat">Chat Conversation Only</option>
                  <option value="canvas">Canvases Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="md">Markdown File (.md)</option>
                  <option value="json">Raw JSON</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsExportModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExportConfirm}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Delete Project?</h3>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this project? This action cannot be undone and all data will be permanently lost.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setProjectToDelete(null)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteProject}
                className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm cursor-pointer"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
