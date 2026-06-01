import React, { useState } from "react";
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  Target, 
  Lightbulb, 
  Layers, 
  FlaskConical, 
  Users,
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Assuming standard shadcn/ui components are available
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import Header from "../../components/ui/Header";
import { Input } from "../../components/ui/input"; // Adding text input

// --- MOCK DATA ---
import { PROJECT_DATA, ACTIVE_CHALLENGES } from "../../data/challenges";
import { createStudentProject } from "../../lib/dataModels";
import { usersService } from "../../UsersManager/usersService";

const PHASE_MAP = {
  empathize: { label: "Empathize", icon: Users, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
  define: { label: "Define", icon: Target, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  ideate: { label: "Ideate", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  prototype: { label: "Prototype", icon: Layers, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  test: { label: "Test", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

// --- MAIN COMPONENT ---

export default function DashboardPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  
  // Dynamic sessionStorage States
  const [challenges] = useState(() => {
    const stored = sessionStorage.getItem("challenges");
    if (!stored) {
      sessionStorage.setItem("challenges", JSON.stringify(ACTIVE_CHALLENGES));
      return ACTIVE_CHALLENGES;
    }
    return JSON.parse(stored);
  });

  const [studentProjects, setStudentProjects] = useState(() => {
    const stored = sessionStorage.getItem("studentProjects");
    if (!stored) {
      sessionStorage.setItem("studentProjects", JSON.stringify(PROJECT_DATA));
      return PROJECT_DATA;
    }
    return JSON.parse(stored);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] = useState("");

  const activeRecentProject = studentProjects.find(p => p.isRecent || p.lastUpdated === "Just now") || studentProjects[0];
  const otherProjects = studentProjects.filter(p => p.id !== (activeRecentProject?.id));

  const handleCreateProject = () => {
    if (!newTitle.trim()) return;

    const activeUser = usersService.getCurrentUser();
    const studentName = activeUser ? activeUser.name : "Student";

    const newProject = createStudentProject(newTitle.trim(), studentName, selectedChallengeId);
    newProject.isRecent = true;

    // Reset isRecent for other items
    const updatedProjects = studentProjects.map(p => ({ ...p, isRecent: false }));
    updatedProjects.unshift(newProject);

    sessionStorage.setItem("studentProjects", JSON.stringify(updatedProjects));
    setStudentProjects(updatedProjects);

    setNewTitle("");
    setSelectedChallengeId("");
    setIsModalOpen(false);

    navigate(`/workspace/${newProject.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/30 transition-colors duration-200">
      
      {/* GLOBAL HEADER */}
      <Header theme={theme} toggleTheme={toggleTheme} brainColor="text-pink-500 dark:text-pink-400" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* TOP SECTION: Welcome & Hero Banner */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back, Student!</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Ready to continue your innovation journey?</p>
          </div>

          {activeRecentProject && (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative group">
              {/* Subtle background glow effect */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <CardContent className="p-0 sm:flex items-stretch relative z-10">
                {/* Visual Indicator Area */}
                <div className="bg-zinc-50/50 dark:bg-zinc-950/50 p-8 sm:w-1/3 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800">
                  <div className={`p-4 rounded-2xl ${PHASE_MAP[activeRecentProject.currentPhase].bg} mb-4`}>
                    {React.createElement(PHASE_MAP[activeRecentProject.currentPhase].icon, { className: `h-10 w-10 ${PHASE_MAP[activeRecentProject.currentPhase].color}` })}
                  </div>
                  <Badge variant="outline" className={`${PHASE_MAP[activeRecentProject.currentPhase].border} ${PHASE_MAP[activeRecentProject.currentPhase].color} bg-white dark:bg-zinc-950 px-3 py-1 text-xs uppercase tracking-wider`}>
                    Phase: {PHASE_MAP[activeRecentProject.currentPhase].label}
                  </Badge>
                </div>

                {/* Content Area */}
                <div className="p-8 sm:w-2/3 flex flex-col justify-center">
                  <div className="flex items-center text-xs text-zinc-500 mb-2 gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Last updated {activeRecentProject.lastUpdated}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-zinc-850 dark:text-zinc-100 mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {activeRecentProject.title}
                  </h3>
                  
                  <div className="space-y-2 mb-8 max-w-md">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Project Progress</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-bold">{activeRecentProject.progressPercentage}%</span>
                    </div>
                    {/* Replaced shadcn Progress with explicit Left-to-Right div implementation */}
                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex justify-start">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${activeRecentProject.progressPercentage}%` }} 
                      />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button 
                      onClick={() => navigate(`/workspace/${activeRecentProject.id}`)}
                      className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all font-semibold px-6 shadow-sm border border-zinc-850 dark:border-transparent"
                    >
                      Continue Working
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* MIDDLE SECTION: Action Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">My Portfolio</h2>
            <Button 
              onClick={() => { if (challenges.length > 0) { setSelectedChallengeId(challenges[0].id.toString()); } setIsModalOpen(true); }}
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Project
            </Button>
        </div>

        {/* BOTTOM SECTION: The Project Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherProjects.map((project) => {
            const PhaseData = PHASE_MAP[project.currentPhase];
            const Icon = PhaseData.icon;

            return (
              <Card 
                key={project.id} 
                onClick={() => navigate(`/workspace/${project.id}`)}
                className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group flex flex-col shadow-sm hover:shadow-md"
              >
                <CardHeader className="pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/55 dark:bg-zinc-950/30">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-semibold leading-tight text-zinc-850 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {project.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg shrink-0 ${PhaseData.bg}`}>
                      <Icon className={`h-5 w-5 ${PhaseData.color}`} />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="py-5 flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-semibold border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50`}>
                        {PhaseData.label}
                     </Badge>
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">Completion</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{project.progressPercentage}%</span>
                    </div>
                    {/* Explicit Left-to-Right div implementation */}
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex justify-start">
                      <div 
                        className="h-full bg-zinc-500 dark:bg-zinc-400 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${project.progressPercentage}%` }} 
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-4 px-6">
                  <div className="flex items-center text-xs text-zinc-500 w-full">
                    <Clock className="h-3 w-3 mr-1.5" />
                    {project.lastUpdated}
                  </div>
                </CardFooter>
              </Card>
            );
          })}

          {/* Empty State / Add New Placeholder in Grid */}
          <Card 
            onClick={() => { if (challenges.length > 0) { setSelectedChallengeId(challenges[0].id.toString()); } setIsModalOpen(true); }}
            className="bg-transparent border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px] group"
          >
             <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
               <Plus className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
             </div>
             <p className="text-sm font-medium text-zinc-550 dark:text-zinc-400">Start New Project</p>
          </Card>

        </section>

      </main>

      {/* OVERLAY PROJECT CREATOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-between items-center select-none">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Brain className="h-5 w-5 text-pink-500" />
                Start New Project
              </h3>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Project Title</label>
                <Input 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Smart Bins sorting system"
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-blue-500 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Select Active Design Challenge</label>
                {challenges.length === 0 ? (
                  <p className="text-xs text-rose-500 font-semibold select-none">No active challenges available. Please contact your teacher.</p>
                ) : (
                  <select
                    value={selectedChallengeId}
                    onChange={(e) => setSelectedChallengeId(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {challenges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-550 dark:text-zinc-450 hover:text-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject} 
                disabled={!newTitle.trim() || !selectedChallengeId}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Launch Project
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>

    
  );

  
}