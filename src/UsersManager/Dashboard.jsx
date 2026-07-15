import React, { useState, useEffect } from "react";
import { 
  Plus,
  ArrowRight,
  Clock,
  Target,
  Layers,
  Users,
  Activity,
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Crown,
  UserCheck,
  GraduationCap,
  Clock as ClockIcon,
  Trash2,
  BookOpen
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

import { usersService } from "./usersService";
import { apiService } from "../lib/apiService";
// Phase display config + progress logic live in lib so every screen shares one source.
import { PHASE_MAP, calculatePhaseProgress } from "../lib/phaseUtils";
import ConfirmModal from "../components/ui/ConfirmModal";
import ProjectModal from "./dashboard/ProjectModal";
import CourseModal from "./dashboard/CourseModal";
import EnrollModal from "./dashboard/EnrollModal";

// --- MAIN COMPONENT ---
export default function Dashboard({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const currentUser = usersService.getCurrentUser();
  const isTeacher = currentUser?.role?.toLowerCase() === 'teacher';

  // Shared States
  const [challenges, setChallenges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // for student enrollment
  const [studentProjects, setStudentProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // to map student IDs to names
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Teachers see only their own challenges + their own students' projects.
        // Students see their own projects + the list of teachers to pick from.
        const [fetchedChallenges, fetchedProjects, fetchedTeachers, fetchedCourses, fetchedAllCourses, fetchedAllUsers] = await Promise.all([
          isTeacher ? apiService.getChallenges(currentUser?.id) : apiService.getChallenges(),
          isTeacher ? apiService.getProjectsByTeacher(currentUser?.id) : apiService.getProjects(currentUser?.id),
          isTeacher ? Promise.resolve([]) : apiService.getTeachers(),
          isTeacher ? apiService.getCourses(currentUser?.id) : apiService.getStudentCourses(currentUser?.id),
          isTeacher ? Promise.resolve([]) : apiService.getCourses(),
          isTeacher ? usersService.getAllUsers() : Promise.resolve([])
        ]);

        // Normalize _id to id and name to title so we don't have to rewrite the entire UI template
        const normalizedChallenges = (fetchedChallenges || []).map(c => {
          const id = c._id || c.id;
          const teamCount = (fetchedProjects || []).filter(p => p.challengeId === id).length;
          const status = teamCount > 0 ? "Active" : "Inactive";
          return { ...c, id, teamCount, status };
        });
        const normalizedProjects = (fetchedProjects || []).map(p => {
          const memberCount = Array.isArray(p.members) ? p.members.length : 0;
          return {
            ...p,
            id: p._id || p.id,
            title: p.name || p.title || 'Untitled Project',
            currentPhase: p.currentPhase?.toLowerCase() || 'empathize',
            // Owner's real name (resolved by the backend); keep any legacy field as fallback.
            studentOrTeamName: p.studentName || p.studentOrTeamName || null,
            memberCount,
            teamworkStatus: memberCount > 0 ? 'Team' : 'Solo',
          };
        });

        setChallenges(normalizedChallenges);
        setStudentProjects(normalizedProjects);
        setTeachers(fetchedTeachers || []);
        
        const normalizedCourses = (fetchedCourses || []).map(c => ({ ...c, id: c._id || c.id }));
        setCourses(normalizedCourses);
        if (!isTeacher) setAllCourses((fetchedAllCourses || []).map(c => ({ ...c, id: c._id || c.id })));
        if (isTeacher) setAllUsers((fetchedAllUsers || []).map(u => ({ ...u, id: u._id || u.id })));
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

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  // Common Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Student Modal Inputs
  const [projectPath, setProjectPath] = useState("A"); // "A" or "B"
  const [newTitle, setNewTitle] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  // Student picks a teacher first, then one of that teacher's challenges (for fallback/old UI)
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherChallenges, setTeacherChallenges] = useState([]);

  // Teacher Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseChallenges, setCourseChallenges] = useState([]);
  
  // Student Enroll Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState("");

  // Teacher Modal Inputs & States
  const [newDesc, setNewDesc] = useState("");
  const [editingChallengeId, setEditingChallengeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  // Which project's team roster is expanded in the teacher table (one open at a time).
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  // Student Actions
  // When a student picks a teacher, load only that teacher's challenges into the picker.
  const handleSelectTeacher = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    setSelectedChallengeId("");
    setTeacherChallenges([]);
    if (!teacherId) return;
    try {
      const fetched = await apiService.getChallenges(teacherId);
      setTeacherChallenges((fetched || []).map(c => ({ ...c, id: c._id || c.id })));
    } catch (err) {
      console.error("Failed to load teacher's challenges:", err);
    }
  };

  const resetProjectModal = () => {
    setNewTitle("");
    setSelectedChallengeId("");
    setSelectedCourseId("");
    setProjectPath("A");
    setIsModalOpen(false);
  };

  // Creates a project on either path: "A" derives title/course/challenge from the
  // picked course challenge; "B" is independent (free title, no course/challenge).
  // On success the new project is prepended locally and the user jumps straight in.
  const handleCreateStudentProject = async () => {
    let finalTitle = newTitle.trim();
    let finalChallengeId = selectedChallengeId;
    let finalCourseId = selectedCourseId;
    let finalTeacherName = null;
    let finalChallengeTitle = null;

    if (projectPath === "A") {
      if (!selectedCourseId || !selectedChallengeId) return;
      const course = courses.find(c => c.id === selectedCourseId);
      const challenge = challenges.find(c => c.id === selectedChallengeId);
      finalTitle = challenge ? challenge.title : "Untitled Project";
      finalTeacherName = teachers.find(t => t.id === course?.teacherId)?.name;
      finalChallengeTitle = challenge?.title;
    } else {
      if (!newTitle.trim()) return;
      finalChallengeId = null;
      finalCourseId = null;
    }

    try {
      const newProjectRaw = await apiService.createProject({
        studentId: currentUser.id,
        challengeId: finalChallengeId,
        courseId: finalCourseId,
        name: finalTitle,
      });

      const selectedTeacher = { name: finalTeacherName };
      const selectedChallenge = { title: finalChallengeTitle };

      // Map id, normalize name → title, and set local properties
      const newProject = {
        ...newProjectRaw,
        id: newProjectRaw._id || newProjectRaw.id,
        title: newProjectRaw.name || newTitle.trim(),
        currentPhase: newProjectRaw.currentPhase?.toLowerCase() || 'empathize',
        teacherName: selectedTeacher?.name || null,
        challengeTitle: selectedChallenge?.title || null,
        isRecent: true
      };

      const updatedProjects = studentProjects.map(p => ({ ...p, isRecent: false }));
      updatedProjects.unshift(newProject);
      setStudentProjects(updatedProjects);

      resetProjectModal();

      navigate(`/workspace/${newProject.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  // Permanently deletes the project picked in the confirm dialog (projectToDelete).
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await apiService.deleteProject(projectToDelete);
      setStudentProjects(studentProjects.filter(p => p.id !== projectToDelete));
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. Please try again. Error: " + err.message);
      setProjectToDelete(null); // Close modal even on error so they aren't stuck
    }
  };

  // Enroll Student
  const handleEnrollStudent = async () => {
    if (!enrollCourseId) return;
    try {
      await apiService.enrollInCourse(enrollCourseId, currentUser.id);
      const c = allCourses.find(c => c.id === enrollCourseId);
      if (c) {
        setCourses([...courses, c]);
      }
      setIsEnrollModalOpen(false);
      setEnrollCourseId("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKickStudent = async (studentId, courseId, studentName, courseTitle) => {
    setConfirmModal({
      isOpen: true,
      title: "Kick Student",
      message: `Are you sure you want to kick ${studentName} from ${courseTitle}? This will archive their projects.`,
      onConfirm: async () => {
        try {
          await apiService.kickStudentFromCourse(courseId, studentId);
          setCourses(courses.map(c => {
            if (c.id === courseId) {
              return { ...c, enrolledStudents: c.enrolledStudents.filter(sid => sid !== studentId) };
            }
            return c;
          }));
          setNotification({ message: `Student ${studentName} kicked successfully from ${courseTitle}.`, type: "success" });
          setTimeout(() => setNotification({ message: "", type: "" }), 3000);
        } catch (err) {
          console.error(err);
          setNotification({ message: "Failed to kick student.", type: "error" });
          setTimeout(() => setNotification({ message: "", type: "" }), 3000);
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleLeaveCourse = async (courseId, courseTitle) => {
    setConfirmModal({
      isOpen: true,
      title: "Leave Course",
      message: `Are you sure you want to leave ${courseTitle}? This will archive your projects.`,
      onConfirm: async () => {
        try {
          await apiService.kickStudentFromCourse(courseId, currentUser.id);
          setCourses(courses.filter(c => c.id !== courseId));
          setNotification({ message: `Successfully left ${courseTitle}.`, type: "success" });
          setTimeout(() => setNotification({ message: "", type: "" }), 3000);
          
          const fetchedProjects = await apiService.getProjects(currentUser.id);
          const normalizedProjects = (fetchedProjects || []).map(p => {
            const memberCount = Array.isArray(p.members) ? p.members.length : 0;
            return {
              ...p,
              id: p._id || p.id,
              title: p.name || p.title || 'Untitled Project',
              currentPhase: p.currentPhase?.toLowerCase() || 'empathize',
              studentOrTeamName: p.studentName || p.studentOrTeamName || null,
              memberCount,
              teamworkStatus: memberCount > 0 ? 'Team' : 'Solo',
            };
          });
          setStudentProjects(normalizedProjects);
        } catch (err) {
          console.error(err);
          setNotification({ message: "Failed to leave course.", type: "error" });
          setTimeout(() => setNotification({ message: "", type: "" }), 3000);
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  // Teacher Course Actions
  // Creates a new course or updates the one being edited (title + assigned challenges).
  const handleSaveCourse = async () => {
    if (!courseTitle.trim()) return;
    try {
      if (editingCourseId) {
        const updatedRaw = await apiService.updateCourse(editingCourseId, {
          title: courseTitle.trim(),
          challenges: courseChallenges
        });
        const updated = { ...updatedRaw, id: updatedRaw._id || updatedRaw.id };
        setCourses(courses.map(c => c.id === editingCourseId ? updated : c));
      } else {
        const newRaw = await apiService.createCourse({
          title: courseTitle.trim(),
          teacherId: currentUser.id,
          challenges: courseChallenges
        });
        const newCourse = { ...newRaw, id: newRaw._id || newRaw.id };
        setCourses([...courses, newCourse]);
      }
      setCourseTitle("");
      setCourseChallenges([]);
      setEditingCourseId(null);
      setIsCourseModalOpen(false);
    } catch (e) { console.error(e); }
  };
  
  // Deletes the course being edited. Only reachable for empty courses — the modal
  // hides the delete button once any student is enrolled.
  const handleDeleteCourse = async () => {
    if (!editingCourseId) return;
    try {
      await apiService.deleteCourse(editingCourseId);
      setCourses(courses.filter(c => c.id !== editingCourseId));
      setIsCourseModalOpen(false);
      setEditingCourseId(null);
      setCourseTitle("");
    } catch (e) { console.error(e); }
  };

  // Teacher Actions
  // Creates a new design challenge or updates the one being edited (title + brief).
  const handleSaveChallenge = async () => {
    if (!newTitle.trim()) return;
    try {
      if (editingChallengeId) {
        const updatedRaw = await apiService.updateChallenge(editingChallengeId, {
          title: newTitle.trim(),
          description: newDesc.trim()
        });
        const updatedChallenge = { ...updatedRaw, id: updatedRaw._id || updatedRaw.id };
        setChallenges(challenges.map(c => c.id === editingChallengeId ? updatedChallenge : c));
      } else {
        const newChallengeRaw = await apiService.createChallenge({
          title: newTitle.trim(),
          description: newDesc.trim(),
          createdByTeacherId: currentUser?.id
        });
        
        const newChallenge = { ...newChallengeRaw, id: newChallengeRaw._id || newChallengeRaw.id };
        setChallenges([...challenges, newChallenge]);
      }
      
      setNewTitle("");
      setNewDesc("");
      setEditingChallengeId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save challenge:", err);
    }
  };

  // Deletes the challenge being edited. Only reachable when no team is working on
  // it (teamCount === 0) — the modal hides the delete button otherwise.
  const handleDeleteChallenge = async () => {
    if (!editingChallengeId) return;
    try {
      await apiService.deleteChallenge(editingChallengeId);
      setChallenges(challenges.filter(c => c.id !== editingChallengeId));
      setIsModalOpen(false);
      setEditingChallengeId(null);
      setNewTitle("");
      setNewDesc("");
    } catch (err) {
      console.error("Failed to delete challenge:", err);
      alert("Failed to delete challenge.");
    }
  };

  // Student Computed Values — sort by lastUpdated descending, most recent first
  const sortedProjects = [...studentProjects].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  const activeRecentProject = sortedProjects[0] || null;
  const otherProjects = sortedProjects.slice(1);

  // Teacher Computed Values
  // Lookup of challenge id -> title, so the projects table can show which challenge each project belongs to
  const challengeTitleById = React.useMemo(() => {
    const map = {};
    challenges.forEach(c => { map[c.id] = c.title; });
    return map;
  }, [challenges]);
  
  const courseTitleById = React.useMemo(() => {
    const map = {};
    courses.forEach(c => { map[c.id] = c.title; });
    allCourses.forEach(c => { map[c.id] = c.title; });
    return map;
  }, [courses, allCourses]);

  const filteredTeacherProjects = studentProjects.filter(p => {
    const nameToMatch = [p.studentOrTeamName || "", ...(p.memberNames || [])].join(" ");
    const titleToMatch = p.projectTitle || p.title || "";
    const matchesSearch = nameToMatch.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          titleToMatch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = phaseFilter === "All" || p.currentPhase === phaseFilter;
    const matchesCourse = courseFilter === "All" 
                          ? true 
                          : courseFilter === "Unassigned" 
                            ? !p.courseId 
                            : p.courseId === courseFilter;
    return matchesSearch && matchesPhase && matchesCourse;
  });

  const totalProjectsCount = studentProjects.length;
  const avgCompletionValue = studentProjects.length 
    ? Math.round(studentProjects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / studentProjects.length) + "%" 
    : "0%";
  const needsReviewCount = studentProjects.filter(p => p.needsTeacherReview).length;
  // Count every distinct participant — project owners (studentId) AND invited collaborators (members).
  const activeStudentsCount = new Set(
    studentProjects.flatMap(p => [p.studentId, ...(p.members || [])]).filter(Boolean)
  ).size;

  const renderStatusBadge = (value, type) => {
    let colorClass = "bg-zinc-800 text-zinc-300 border-zinc-700";
    if (type === 'creativity') {
      if (value === 'High') colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
      if (value === 'Needs Focus') colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    }
    if (type === 'teamwork') {
      if (value === 'Excellent') colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      if (value === 'Team') colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
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

      {notification.message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className={`p-4 rounded-xl border shadow-sm transition-all duration-300 flex items-center gap-3 text-sm font-semibold ${
            notification.type === "error" 
              ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-450" 
              : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-450"
          }`}>
            {notification.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        </div>
      )}

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

            {/* Teacher Active Courses */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  Active Courses
                </h3>
                <Button 
                  onClick={() => {
                    setCourseTitle("");
                    setCourseChallenges([]);
                    setEditingCourseId(null);
                    setIsCourseModalOpen(true);
                  }} 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Course
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {course.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-auto pt-2">
                        {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
                                <Users className="h-4 w-4 mr-1.5" /> {(course.enrolledStudents || []).length} Students
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                              {course.enrolledStudents.map(studentId => {
                                const studentUser = allUsers.find(u => u.id === studentId);
                                const studentName = studentUser ? studentUser.name : "Unknown Student";
                                return (
                                  <div key={studentId} className="flex items-center justify-between px-2 py-1.5 text-sm">
                                    <span className="truncate pr-2 text-zinc-700 dark:text-zinc-300">{studentName}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 px-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                      onClick={() => handleKickStudent(studentId, course.id, studentName, course.title)}
                                    >
                                      Kick
                                    </Button>
                                  </div>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 text-xs px-2">
                            <Users className="h-4 w-4" /> 0 Students
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            setCourseTitle(course.title);
                            setCourseChallenges(course.challenges || []);
                            setEditingCourseId(course.id);
                            setIsCourseModalOpen(true);
                          }}
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

            {/* Teacher Active Challenges */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  Active Design Challenges
                </h3>
                <Button 
                  onClick={() => {
                    setNewTitle("");
                    setNewDesc("");
                    setEditingChallengeId(null);
                    setIsModalOpen(true);
                  }} 
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
                        <Badge variant="outline" className={`text-[10px] uppercase shrink-0 ${challenge.status === 'Active' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-zinc-500 border-zinc-500/20 bg-zinc-500/10'}`}>
                          {challenge.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-auto pt-2">
                        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <Users className="h-4 w-4" /> {challenge.teamCount} Teams
                        </span>
                        <button 
                          onClick={() => {
                            setNewTitle(challenge.title);
                            setNewDesc(challenge.description || "");
                            setEditingChallengeId(challenge.id);
                            setIsModalOpen(true);
                          }}
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
                        <BookOpen className="h-4 w-4 mr-2" />
                        {courseFilter === 'All' ? 'All Courses' : courseFilter === 'Unassigned' ? 'Unassigned' : (courseTitleById[courseFilter] || 'Unknown Course')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 max-h-60 overflow-y-auto">
                      <DropdownMenuItem onClick={() => setCourseFilter('All')} className="cursor-pointer">All Courses</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCourseFilter('Unassigned')} className="cursor-pointer">Unassigned</DropdownMenuItem>
                      {courses.map(c => (
                        <DropdownMenuItem key={c.id} onClick={() => setCourseFilter(c.id)} className="cursor-pointer">
                          {c.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

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
                      <TableHead className="text-zinc-500 font-medium w-[20%]">Project Title</TableHead>
                      <TableHead className="text-zinc-500 font-medium hidden md:table-cell w-[18%]">Course</TableHead>
                      <TableHead className="text-zinc-500 font-medium hidden md:table-cell w-[18%]">Challenge</TableHead>
                      <TableHead className="text-zinc-500 font-medium">Phase</TableHead>

                      <TableHead className="text-zinc-500 font-medium hidden md:table-cell">Teamwork</TableHead>
                      <TableHead className="text-zinc-500 font-medium hidden lg:table-cell">Last Active</TableHead>
                      <TableHead className="text-zinc-500 font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeacherProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-zinc-500">No projects found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredTeacherProjects.map((project) => {
                        const PhaseData = PHASE_MAP[project.currentPhase];
                        const PhaseIcon = PhaseData.icon;

                        return (
                          <TableRow key={project.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30">
                            <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                              <div className="flex items-center gap-1.5">
                                <span>{project.studentOrTeamName || "Student"}</span>
                                {project.memberCount > 0 && (
                                  <span
                                    title={(project.memberNames || []).join(', ')}
                                    className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-500 dark:text-blue-400"
                                  >
                                    <Users className="h-3 w-3" />+{project.memberCount}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-700 dark:text-zinc-300 font-medium">{project.title || project.projectTitle || "Untitled Project"}</TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm hidden md:table-cell">{courseTitleById[project.courseId] || <span className="text-zinc-400 dark:text-zinc-600 italic">Unassigned</span>}</TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm hidden md:table-cell">{challengeTitleById[project.challengeId] || <span className="text-zinc-400 dark:text-zinc-600 italic">None</span>}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${PhaseData.bg}`}>
                                  <PhaseIcon className={`h-3.5 w-3.5 ${PhaseData.color}`} />
                                </div>
                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{PhaseData.label}</span>
                              </div>
                            </TableCell>

                            <TableCell className="hidden md:table-cell align-top">
                              {project.memberCount > 0 ? (
                                <div className="space-y-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedTeamId(expandedTeamId === project.id ? null : project.id)}
                                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                  >
                                    <Users className="h-3 w-3" />
                                    Team ({project.memberCount + 1})
                                    <ChevronDown className={`h-3 w-3 transition-transform ${expandedTeamId === project.id ? 'rotate-180' : ''}`} />
                                  </button>
                                  {expandedTeamId === project.id && (
                                    <div className="w-44 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 text-xs shadow-sm">
                                      <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-700 dark:text-zinc-200">
                                        <Crown className="h-3 w-3 shrink-0 text-amber-500" />
                                        <span className="truncate">{project.studentOrTeamName || "Student"}</span>
                                        <span className="ml-auto text-[10px] uppercase tracking-wide text-zinc-400">owner</span>
                                      </div>
                                      {(project.memberNames || []).map((name, i) => {
                                        const isMatch = searchTerm && name.toLowerCase().includes(searchTerm.toLowerCase());
                                        return (
                                          <div
                                            key={i}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded ${isMatch ? 'bg-blue-500/10 font-medium text-blue-500 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-300'}`}
                                          >
                                            <Users className="h-3 w-3 shrink-0 opacity-60" />
                                            <span className="truncate">{name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                renderStatusBadge("Solo", 'teamwork')
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-400 hidden lg:table-cell">{project.lastUpdated || project.lastActiveDate || "Recently"}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                onClick={async () => {
                                  if (project.needsTeacherReview) {
                                    try {
                                      await apiService.updateProject(project.id, { needsTeacherReview: false });
                                    } catch(e) {}
                                  }
                                  navigate(`/teacher/review/${project.id}`);
                                }}
                                size="sm" 
                                variant={project.needsTeacherReview ? "default" : "outline"} 
                                className={project.needsTeacherReview 
                                  ? "bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold border-amber-500 cursor-pointer shadow-sm" 
                                  : "bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                                }
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

              {courses.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 items-center">
                  <span className="text-sm text-zinc-500 font-medium mr-1 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1.5" /> Enrolled in:
                  </span>
                  {courses.map(c => (
                    <Badge key={c.id} variant="secondary" className="px-2.5 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50">
                      {c.title}
                      <button 
                        onClick={() => handleLeaveCourse(c.id, c.title)}
                        className="ml-2 hover:text-rose-500 focus:outline-none transition-colors"
                        title="Leave course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {activeRecentProject && (
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                  <CardContent className="p-0 sm:flex items-stretch relative z-10">
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/50 p-8 sm:w-1/3 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800">
                      <div className={`p-4 rounded-2xl ${PHASE_MAP[activeRecentProject.currentPhase].bg} mb-4`}>
                        {React.createElement(PHASE_MAP[activeRecentProject.currentPhase].icon, { className: `h-10 w-10 ${PHASE_MAP[activeRecentProject.currentPhase].color}` })}
                      </div>
                      <Badge variant="outline" className={`${PHASE_MAP[activeRecentProject.currentPhase].border} ${PHASE_MAP[activeRecentProject.currentPhase].color} bg-white dark:bg-zinc-950 px-3 py-1 text-xs uppercase tracking-wider`}>
                        Phase: {PHASE_MAP[activeRecentProject.currentPhase].label} ({calculatePhaseProgress(activeRecentProject)}%)
                      </Badge>
                    </div>

                    <div className="p-8 sm:w-2/3 flex flex-col justify-center">
                      <div className="flex items-center text-xs text-zinc-500 mb-2 gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Last updated {activeRecentProject.lastUpdated}
                      </div>

                      {activeRecentProject.teacherName && (
                        <div className="flex items-center text-xs text-zinc-500 mb-2 gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Teacher: {activeRecentProject.teacherName}
                        </div>
                      )}

                      {/* Collaboration context: shared-with-you vs. a team you own */}
                      {activeRecentProject.studentId?.toString() !== currentUser?.id?.toString() ? (
                        <div className="flex items-center text-xs text-blue-500 dark:text-blue-400 mb-2 gap-1.5 font-medium">
                          <Users className="h-3.5 w-3.5" />
                          Shared by {activeRecentProject.studentName || "a teammate"}
                        </div>
                      ) : (activeRecentProject.memberNames?.length > 0 && (
                        <div className="flex items-center text-xs text-zinc-500 mb-2 gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Team: you + {activeRecentProject.memberNames.length} {activeRecentProject.memberNames.length === 1 ? 'collaborator' : 'collaborators'}
                        </div>
                      ))}

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

                      <div className="mt-auto flex gap-3">
                        <Button 
                          onClick={() => navigate(`/workspace/${activeRecentProject.id}`)}
                          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all font-semibold px-6 shadow-sm border border-zinc-800 dark:border-transparent cursor-pointer"
                        >
                          Continue Working
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        {activeRecentProject.studentId?.toString() === currentUser?.id?.toString() && (
                          <Button
                            variant="outline"
                            onClick={() => setProjectToDelete(activeRecentProject.id)}
                            className="border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors cursor-pointer px-3"
                            title="Delete Project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 max-w-6xl mx-auto">
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">My Portfolio</h2>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsEnrollModalOpen(true)}
                  size="sm" 
                  variant="outline"
                  className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  Enroll in Course
                </Button>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Project
                </Button>
              </div>
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
                        <div className="flex items-center gap-2">
                          {project.studentId?.toString() === currentUser?.id?.toString() && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProjectToDelete(project.id);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <div className={`p-2 rounded-lg shrink-0 ${PhaseData.bg}`}>
                            <Icon className={`h-5 w-5 ${PhaseData.color}`} />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="py-5 flex-1 space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-semibold border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50`}>
                          {PhaseData.label}
                        </Badge>
                        {project.studentId?.toString() !== currentUser?.id?.toString() ? (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-blue-300/40 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 gap-1">
                            <Users className="h-3 w-3" /> Shared
                          </Badge>
                        ) : (project.memberNames?.length > 0 && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50 gap-1">
                            <Users className="h-3 w-3" /> Team
                          </Badge>
                        ))}
                      </div>

                      {project.teacherName && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{project.teacherName}</span>
                        </div>
                      )}
                      
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
                onClick={() => setIsModalOpen(true)}
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

      {/* Create/edit modal — teacher challenges and student projects (extracted component) */}
      <ProjectModal
        isOpen={isModalOpen}
        isTeacher={isTeacher}
        editingChallengeId={editingChallengeId}
        challenges={challenges}
        courses={courses}
        newTitle={newTitle} setNewTitle={setNewTitle}
        newDesc={newDesc} setNewDesc={setNewDesc}
        projectPath={projectPath} setProjectPath={setProjectPath}
        selectedCourseId={selectedCourseId} setSelectedCourseId={setSelectedCourseId}
        selectedChallengeId={selectedChallengeId} setSelectedChallengeId={setSelectedChallengeId}
        onSaveChallenge={handleSaveChallenge}
        onDeleteChallenge={handleDeleteChallenge}
        onCreateProject={handleCreateStudentProject}
        onCancel={() => {
          setNewDesc("");
          setEditingChallengeId(null);
          resetProjectModal();
        }}
      />

      {/* Teacher: create/edit course (extracted component) */}
      <CourseModal
        isOpen={isCourseModalOpen && isTeacher}
        editingCourseId={editingCourseId}
        courses={courses}
        challenges={challenges}
        courseTitle={courseTitle} setCourseTitle={setCourseTitle}
        courseChallenges={courseChallenges} setCourseChallenges={setCourseChallenges}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
        onClose={() => {
          setCourseTitle("");
          setCourseChallenges([]);
          setEditingCourseId(null);
          setIsCourseModalOpen(false);
        }}
      />

      {/* Student: enroll in a course (extracted component) */}
      <EnrollModal
        isOpen={isEnrollModalOpen && !isTeacher}
        allCourses={allCourses}
        enrolledCourses={courses}
        enrollCourseId={enrollCourseId} setEnrollCourseId={setEnrollCourseId}
        onEnroll={handleEnrollStudent}
        onClose={() => {
          setEnrollCourseId("");
          setIsEnrollModalOpen(false);
        }}
      />

      {/* Shared confirmation dialogs (extracted component) */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        title="Delete Project?"
        message="Are you sure you want to delete this project? This action cannot be undone and all data will be permanently lost."
        confirmLabel="Yes, Delete"
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
        }}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
