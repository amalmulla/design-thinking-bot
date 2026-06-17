import React, { useState, useEffect } from "react";
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  Target, 
  Lightbulb, 
  Layers, 
  FlaskConical, 
  Users,
  Brain,
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Assuming standard shadcn/ui components are available
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import Header from "../components/ui/Header";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// --- MOCK DATA ---
import { PROJECT_DATA, ACTIVE_CHALLENGES, STUDENT_PROJECTS } from "../data/challenges";
import { CLASS_METRICS } from "../lib/analytics";
import { createStudentProject, createDesignChallenge } from "../lib/dataModels";
import { usersService } from "./usersService";
import { apiService } from "../lib/apiService";

const PHASE_MAP = {
  empathize: { label: "Empathize", icon: Users, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
  define: { label: "Define", icon: Target, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  ideate: { label: "Ideate", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  prototype: { label: "Prototype", icon: Layers, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  test: { label: "Test", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

// --- MAIN COMPONENT ---
export default function Dashboard({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const currentUser = usersService.getCurrentUser();
  const isTeacher = currentUser?.role?.toLowerCase() === 'teacher';

  // Shared States
  const [challenges, setChallenges] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [fetchedChallenges, fetchedProjects] = await Promise.all([
          apiService.getChallenges(),
          apiService.getProjects(isTeacher ? undefined : currentUser?.id)
        ]);
        
        // Normalize _id to id and name to title so we don't have to rewrite the entire UI template
        const normalizedChallenges = (fetchedChallenges || []).map(c => ({ ...c, id: c._id || c.id }));
        const normalizedProjects = (fetchedProjects || []).map(p => ({ 
          ...p, 
          id: p._id || p.id,
          title: p.name || p.title || 'Untitled Project',
          currentPhase: p.currentPhase?.toLowerCase() || 'empathize'
        }));

        setChallenges(normalizedChallenges);
        setStudentProjects(normalizedProjects);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (currentUser) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Common Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Student Modal Inputs
  const [newTitle, setNewTitle] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] = useState("");

  // Teacher Modal Inputs & States
  const [newDesc, setNewDesc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("All");

  // Student Actions
  const handleCreateStudentProject = async () => {
    if (!newTitle.trim() || !selectedChallengeId) return;

    try {
      const newProjectRaw = await apiService.createProject({
        studentId: currentUser.id,
        challengeId: selectedChallengeId,
        name: newTitle.trim(),
      });

      // Map id, normalize name → title, and set local properties
      const newProject = { 
        ...newProjectRaw, 
        id: newProjectRaw._id || newProjectRaw.id, 
        title: newProjectRaw.name || newTitle.trim(),
        currentPhase: newProjectRaw.currentPhase?.toLowerCase() || 'empathize',
        isRecent: true 
      };

      const updatedProjects = studentProjects.map(p => ({ ...p, isRecent: false }));
      updatedProjects.unshift(newProject);
      setStudentProjects(updatedProjects);

      setNewTitle("");
      setSelectedChallengeId("");
      setIsModalOpen(false);

      navigate(`/workspace/${newProject.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  // Teacher Actions
  const handleSaveChallenge = async () => {
    if (!newTitle.trim()) return;
    try {
      const newChallengeRaw = await apiService.createChallenge({
        title: newTitle.trim(),
        description: newDesc.trim(),
        createdByTeacherId: currentUser?.id
      });
      
      const newChallenge = { ...newChallengeRaw, id: newChallengeRaw._id || newChallengeRaw.id };
      setChallenges([...challenges, newChallenge]);
      
      setNewTitle("");
      setNewDesc("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save challenge:", err);
    }
  };

  // Student Computed Values — sort by lastUpdated descending, most recent first
  const sortedProjects = [...studentProjects].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  const activeRecentProject = sortedProjects[0] || null;
  const otherProjects = sortedProjects.slice(1);

  // Teacher Computed Values
  const filteredTeacherProjects = studentProjects.filter(p => {
    const nameToMatch = p.studentOrTeamName || "";
    const titleToMatch = p.projectTitle || p.title || "";
    const matchesSearch = nameToMatch.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          titleToMatch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = phaseFilter === "All" || p.currentPhase === phaseFilter;
    return matchesSearch && matchesFilter;
  });

  const totalProjectsCount = studentProjects.length;
  const avgCompletionValue = studentProjects.length 
    ? Math.round(studentProjects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / studentProjects.length) + "%" 
    : "0%";
  const needsReviewCount = studentProjects.filter(p => p.currentPhase === 'test' || p.creativityScore === 'Needs Focus').length;
  const activeStudentsCount = new Set(studentProjects.map(p => p.studentId).filter(Boolean)).size;

  const renderStatusBadge = (value, type) => {
    let colorClass = "bg-zinc-800 text-zinc-300 border-zinc-700";
    if (type === 'creativity') {
      if (value === 'High') colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
      if (value === 'Needs Focus') colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    }
    if (type === 'teamwork') {
      if (value === 'Excellent') colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      if (value === 'Needs Work') colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      if (value === 'Solo') colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
    return (
      <Badge variant="outline" className={`font-medium ${colorClass}`}>
        {value}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200 selection:bg-blue-500/30">
      <Header theme={theme} toggleTheme={toggleTheme} brainColor={isTeacher ? "text-indigo-500 dark:text-indigo-400" : "text-pink-500 dark:text-pink-400"} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {isTeacher ? (
          // TEACHER DASHBOARD VIEW
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Class Command Center</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Overview of student progress and active design challenges.</p>
            </div>

            {/* Teacher Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Projects</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{totalProjectsCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Completion</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{avgCompletionValue}</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500/20" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Needs Review</CardTitle>
                  <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-3xl font-bold text-rose-500 dark:text-rose-400">{needsReviewCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Students</CardTitle>
                  <UserCheck className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{activeStudentsCount}</div>
                </CardContent>
              </Card>
            </section>

            {/* Teacher Active Challenges */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  Active Design Challenges
                </h3>
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Challenge
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {challenge.title}
                        </h4>
                        <Badge variant="outline" className={`text-[10px] uppercase shrink-0 ${challenge.status === 'Active' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-orange-500 border-orange-500/20 bg-orange-500/10'}`}>
                          {challenge.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-auto pt-2">
                        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <Users className="h-4 w-4" /> {challenge.teamCount} Teams
                        </span>
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium flex items-center cursor-pointer"
                        >
                          Manage <ChevronRight className="h-3 w-3 ml-0.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Teacher Student Projects Table */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 gap-4">
                <h3 className="text-xl font-semibold text-zinc-850 dark:text-zinc-100 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  All Student Projects
                </h3>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <Input 
                      placeholder="Search students..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus-visible:ring-indigo-500 w-[250px] text-sm text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                        <Filter className="h-4 w-4 mr-2" />
                        {phaseFilter === 'All' ? 'All Phases' : PHASE_MAP[phaseFilter].label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                      <DropdownMenuItem onClick={() => setPhaseFilter('All')} className="cursor-pointer">All Phases</DropdownMenuItem>
                      {Object.entries(PHASE_MAP).map(([key, config]) => (
                        <DropdownMenuItem key={key} onClick={() => setPhaseFilter(key)} className="cursor-pointer flex items-center gap-2">
                          <config.icon className={`h-3 w-3 ${config.color}`} /> {config.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
                <Table>
                  <TableHeader className="bg-zinc-50/75 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-zinc-500 font-medium">Student / Team</TableHead>
                      <TableHead className="text-zinc-500 font-medium w-[25%]">Project Title</TableHead>
                      <TableHead className="text-zinc-500 font-medium">Phase</TableHead>
                      <TableHead className="text-zinc-500 font-medium">AI Creativity</TableHead>
                      <TableHead className="text-zinc-500 font-medium">Teamwork</TableHead>
                      <TableHead className="text-zinc-500 font-medium">Last Active</TableHead>
                      <TableHead className="text-zinc-500 font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeacherProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-zinc-500">No projects found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredTeacherProjects.map((project) => {
                        const PhaseData = PHASE_MAP[project.currentPhase];
                        const PhaseIcon = PhaseData.icon;

                        return (
                          <TableRow key={project.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30">
                            <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">{project.studentOrTeamName || "Student"}</TableCell>
                            <TableCell className="text-zinc-700 dark:text-zinc-300 font-medium">{project.title || project.projectTitle || "Untitled Project"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${PhaseData.bg}`}>
                                  <PhaseIcon className={`h-3.5 w-3.5 ${PhaseData.color}`} />
                                </div>
                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{PhaseData.label}</span>
                              </div>
                            </TableCell>
                            <TableCell>{renderStatusBadge(project.creativityScore || "Not Evaluated", 'creativity')}</TableCell>
                            <TableCell>{renderStatusBadge(project.teamworkStatus || "Solo", 'teamwork')}</TableCell>
                            <TableCell className="text-xs text-zinc-400">{project.lastUpdated || project.lastActiveDate || "Recently"}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                onClick={() => navigate(`/teacher/review/${project.id}`)}
                                size="sm" 
                                variant="outline" 
                                className="bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                              >
                                Review
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        ) : (
          // STUDENT DASHBOARD VIEW
          <>
            <section className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back, {currentUser?.name || "Student"}!</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Ready to continue your innovation journey?</p>
              </div>

              {activeRecentProject && (
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                  <CardContent className="p-0 sm:flex items-stretch relative z-10">
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/50 p-8 sm:w-1/3 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800">
                      <div className={`p-4 rounded-2xl ${PHASE_MAP[activeRecentProject.currentPhase].bg} mb-4`}>
                        {React.createElement(PHASE_MAP[activeRecentProject.currentPhase].icon, { className: `h-10 w-10 ${PHASE_MAP[activeRecentProject.currentPhase].color}` })}
                      </div>
                      <Badge variant="outline" className={`${PHASE_MAP[activeRecentProject.currentPhase].border} ${PHASE_MAP[activeRecentProject.currentPhase].color} bg-white dark:bg-zinc-950 px-3 py-1 text-xs uppercase tracking-wider`}>
                        Phase: {PHASE_MAP[activeRecentProject.currentPhase].label}
                      </Badge>
                    </div>

                    <div className="p-8 sm:w-2/3 flex flex-col justify-center">
                      <div className="flex items-center text-xs text-zinc-500 mb-2 gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Last updated {activeRecentProject.lastUpdated}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {activeRecentProject.title}
                      </h3>
                      
                      <div className="space-y-2 mb-8 max-w-md">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Project Progress</span>
                          <span className="text-zinc-700 dark:text-zinc-300 font-bold">{activeRecentProject.progressPercentage}%</span>
                        </div>
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
                          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all font-semibold px-6 shadow-sm border border-zinc-800 dark:border-transparent cursor-pointer"
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

            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 max-w-6xl mx-auto">
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

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {otherProjects.map((project) => {
                const PhaseData = PHASE_MAP[project.currentPhase];
                const Icon = PhaseData.icon;

                return (
                  <Card 
                    key={project.id} 
                    onClick={() => navigate(`/workspace/${project.id}`)}
                    className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group flex flex-col shadow-sm hover:shadow-md"
                  >
                    <CardHeader className="pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/30">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg font-semibold leading-tight text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
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

              <Card 
                onClick={() => { if (challenges.length > 0) { setSelectedChallengeId(challenges[0].id.toString()); } setIsModalOpen(true); }}
                className="bg-transparent border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px] group"
              >
                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Start New Project</p>
              </Card>
            </section>
          </>
        )}
      </main>

      {/* OVERLAY MODAL (SHARED) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md lg:max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-between items-center select-none">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                {isTeacher ? <Target className="h-5 w-5 text-indigo-500" /> : <Brain className="h-5 w-5 text-pink-500" />}
                {isTeacher ? "Manage Design Challenge" : "Start New Project"}
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                  {isTeacher ? "Challenge Title" : "Project Title"}
                </label>
                <Input 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isTeacher ? "e.g. Eco-Packaging Design" : "e.g. Smart Bins sorting system"}
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-blue-500 h-10"
                />
              </div>

              {isTeacher ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Brief & Objectives</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full h-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 text-zinc-800 dark:text-zinc-200 text-sm focus:ring-1 focus:ring-indigo-500 dark:focus:ring-zinc-700 outline-none resize-none"
                    placeholder="Enter challenge description, constraints, and learning goals..."
                  />
                </div>
              ) : (
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
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setNewTitle("");
                  setNewDesc("");
                  setIsModalOpen(false);
                }} 
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9"
              >
                Cancel
              </Button>
              <Button 
                onClick={isTeacher ? handleSaveChallenge : handleCreateStudentProject} 
                disabled={!newTitle.trim() || (!isTeacher && !selectedChallengeId)}
                className={`${isTeacher ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-sm h-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isTeacher ? "Save Challenge" : "Launch Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
