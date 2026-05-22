import React, { useState } from "react";
import { 
  Users, 
  Target, 
  Lightbulb, 
  Layers, 
  FlaskConical, 
  Brain, 
  LogOut, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronRight,
  UserCheck
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// Assuming standard shadcn/ui components are available
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import Header from "../../components/ui/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

// --- MOCK DATA ---

const CLASS_METRICS = {
  totalProjects: 24,
  avgCompletion: "68%",
  needsReview: 5,
  activeStudents: 42
};

const ACTIVE_CHALLENGES = [
  { id: 1, title: "Campus Food Waste Reduction", teamCount: 8, status: "Active" },
  { id: 2, title: "Library App Redesign", teamCount: 12, status: "Active" },
  { id: 3, title: "Student Onboarding UX", teamCount: 4, status: "Closing Soon" },
];

const PHASE_CONFIG = {
  empathize: { label: "Empathize", icon: Users, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
  define: { label: "Define", icon: Target, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  ideate: { label: "Ideate", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  prototype: { label: "Prototype", icon: Layers, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  test: { label: "Test", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

const STUDENT_PROJECTS = [
  { id: 1, studentOrTeamName: "Team Alpha", projectTitle: "Smart Bin Sorting System", currentPhase: "ideate", creativityScore: "High", teamworkStatus: "Excellent", lastActiveDate: "2 hours ago", challengeId: 1 },
  { id: 2, studentOrTeamName: "Sarah Jenkins", projectTitle: "AR Study Room Finder", currentPhase: "prototype", creativityScore: "Medium", teamworkStatus: "Solo", lastActiveDate: "1 day ago", challengeId: 2 },
  { id: 3, studentOrTeamName: "Team Beta", projectTitle: "Compost Gamification", currentPhase: "empathize", creativityScore: "Needs Focus", teamworkStatus: "Needs Work", lastActiveDate: "3 days ago", challengeId: 1 },
  { id: 4, studentOrTeamName: "Marcus Wei", projectTitle: "Digital Orientation Map", currentPhase: "test", creativityScore: "High", teamworkStatus: "Solo", lastActiveDate: "4 hours ago", challengeId: 3 },
  { id: 5, studentOrTeamName: "Team Delta", projectTitle: "Book Reservation Flow", currentPhase: "define", creativityScore: "Medium", teamworkStatus: "Good", lastActiveDate: "2 days ago", challengeId: 2 }
];

// --- MAIN COMPONENT ---

export default function TeacherDashboard({ theme, toggleTheme }) {
  const navigate = useNavigate();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal State

  // Filter Logic
  const filteredProjects = STUDENT_PROJECTS.filter(p => {
    const matchesSearch = p.studentOrTeamName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = phaseFilter === "All" || p.currentPhase === phaseFilter;
    return matchesSearch && matchesFilter;
  });

  // Modal Handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Helper function for status badges
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 relative transition-colors duration-200">
      
      {/* GLOBAL HEADER */}
      <Header theme={theme} toggleTheme={toggleTheme} brainColor="text-indigo-500 dark:text-indigo-400">
        <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20">
          Instructor View
        </Badge>
        <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
          <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-xs text-zinc-650 dark:text-zinc-300">Prof</AvatarFallback>
        </Avatar>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hidden sm:flex" 
          onClick={() => navigate('/login')}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Class Command Center</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Overview of student progress and active design challenges.</p>
        </div>

        {/* TOP SECTION: Class Overview Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Projects</CardTitle>
              <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{CLASS_METRICS.totalProjects}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg Completion</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{CLASS_METRICS.avgCompletion}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500/20" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Needs Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="text-3xl font-bold text-rose-500 dark:text-rose-400">{CLASS_METRICS.needsReview}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Students</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{CLASS_METRICS.activeStudents}</div>
            </CardContent>
          </Card>
        </section>

        {/* MIDDLE SECTION: Active Design Challenges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Active Design Challenges
            </h3>
            <Button 
              onClick={openModal} 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Challenge
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTIVE_CHALLENGES.map((challenge) => (
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
                      onClick={openModal}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium flex items-center"
                    >
                      Manage <ChevronRight className="h-3 w-3 ml-0.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* BOTTOM SECTION: The Master Data Table */}
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
                  placeholder="Search students or projects..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus-visible:ring-indigo-500 w-[250px] text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <Filter className="h-4 w-4 mr-2" />
                    {phaseFilter === 'All' ? 'All Phases' : PHASE_CONFIG[phaseFilter].label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <DropdownMenuItem onClick={() => setPhaseFilter('All')} className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer">All Phases</DropdownMenuItem>
                  {Object.entries(PHASE_CONFIG).map(([key, config]) => (
                    <DropdownMenuItem key={key} onClick={() => setPhaseFilter(key)} className="focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 cursor-pointer flex items-center gap-2">
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
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Student / Team</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium w-[25%]">Project Title</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Phase</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">AI Creativity</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Teamwork</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium">Last Active</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                      No projects found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => {
                    const PhaseData = PHASE_CONFIG[project.currentPhase];
                    const PhaseIcon = PhaseData.icon;

                    return (
                      <TableRow key={project.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                          {project.studentOrTeamName}
                        </TableCell>
                        <TableCell className="text-zinc-700 dark:text-zinc-350 font-medium">
                          {project.projectTitle}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${PhaseData.bg}`}>
                              <PhaseIcon className={`h-3.5 w-3.5 ${PhaseData.color}`} />
                            </div>
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{PhaseData.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(project.creativityScore, 'creativity')}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(project.teamworkStatus, 'teamwork')}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400 dark:text-zinc-500">
                          {project.lastActiveDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => navigate(`/teacher/review/${project.id}`)}
                            size="sm" 
                            variant="outline" 
                            className="bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white"
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
      </main>

      {/* OVERLAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          {/* Modal Container */}
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-55/35 dark:bg-zinc-950/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Manage Design Challenge
              </h3>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Challenge Title</label>
                <Input 
                  defaultValue="Campus Food Waste Reduction" 
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Brief & Objectives</label>
                <textarea
                  className="w-full h-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md p-3 text-zinc-800 dark:text-zinc-250 text-sm focus:ring-1 focus:ring-indigo-500 dark:focus:ring-zinc-700 outline-none resize-none"
                  placeholder="Enter challenge description, constraints, and learning goals..."
                  defaultValue="Design an actionable solution to reduce post-consumer food waste in the main dining halls. Focus on student behavioral shifts and structural friction."
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-55/35 dark:bg-zinc-950/50 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={closeModal} 
                className="text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={closeModal} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Save Challenge
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}