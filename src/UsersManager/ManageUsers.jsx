import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, ShieldAlert, CheckCircle, Ban, UserCheck, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersService } from "./usersService";
import { apiService } from "../lib/apiService";

// Standard UI components
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Header from "../components/ui/Header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ChevronDown, AlertCircle } from "lucide-react";

export default function ManageUsers({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState("All");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const fetchUsersData = async () => {
    // Auth Check
    const activeUser = usersService.getCurrentUser();
    if (!activeUser) {
      navigate("/login");
      return;
    }
    if (activeUser.role?.toLowerCase() !== "teacher") {
      // Direct unauthorized student away
      navigate("/dashboard");
      return;
    }
    setCurrentUser(activeUser);
    
    try {
      const [users, fetchedCourses] = await Promise.all([
        usersService.getAllUsers(),
        apiService.getCourses(activeUser.id)
      ]);
      const normalizedUsers = (users || []).map(u => ({ ...u, id: u._id || u.id }));
      const normalizedCourses = (fetchedCourses || []).map(c => ({ ...c, id: c._id || c.id }));
      setUsersList(normalizedUsers);
      setCourses(normalizedCourses);
    } catch (err) {
      showNotification("Failed to load users and courses.", "error");
    }
  };

  useEffect(() => {
    fetchUsersData();

    // Re-fetch users if another tab/action updates active session
    const handleUpdate = () => {
      fetchUsersData();
    };

    window.addEventListener("currentUserUpdated", handleUpdate);
    return () => {
      window.removeEventListener("currentUserUpdated", handleUpdate);
    };
  }, [navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };


  const handleToggleBlock = async (id) => {
    try {
      const userToToggle = usersList.find(u => u.id === id);
      await usersService.toggleBlockUser(id);
      await fetchUsersData();
      
      setUsersList(usersList.map((user) => 
        user.id === id ? { ...user, blocked: !user.blocked } : user
      ));
      
      showNotification(`User ${userToToggle.name} ${!userToToggle.blocked ? "blocked" : "unblocked"} successfully.`);
    } catch (err) {
      showNotification("Failed to update user status.", "error");
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
          showNotification(`Student ${studentName} kicked successfully from ${courseTitle}.`);
          fetchUsersData(); // refresh courses list to show they are removed
        } catch (err) {
          showNotification("Failed to kick student.", "error");
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const filteredUsers = usersList.filter(user => {
    if (courseFilter === "All") return true;
    if (user.role?.toLowerCase() !== 'student') return false;
    const course = courses.find(c => c.id === courseFilter);
    return course && course.enrolledStudents?.includes(user.id);
  });

  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      
      {/* HEADER BAR */}
      <Header theme={theme} toggleTheme={toggleTheme} brainColor="text-pink-500 dark:text-pink-400">
        <div className="flex items-center gap-3 mr-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-0 px-2 h-8 cursor-pointer"
            onClick={() => navigate("/teacher")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Command Center
          </Button>
        </div>
      </Header>

      {/* BODY */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
        
        {/* TOP ROW */}
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-pink-500 dark:text-pink-400" />
              User Control Database
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage system permissions, assign administrative roles, and toggle access blocks.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={async () => {
              await fetchUsersData();
              showNotification("Users list reloaded from database.");
            }}
            className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 cursor-pointer h-9 w-9 rounded-lg"
            title="Reload database"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* NOTIFICATION HEADER */}
        {notification.message && (
          <div className={`p-4 rounded-xl border shadow-sm transition-all duration-300 flex items-center gap-3 text-sm font-semibold ${
            notification.type === "error" 
              ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-450" 
              : notification.type === "warning"
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-450"
              : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-450"
          }`}>
            {notification.type === "error" ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}

        {/* DATABASE TABLE CARD */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Registered System Accounts ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-500">Filter by Course:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    {courseFilter === "All" ? "All Courses" : courses.find(c => c.id === courseFilter)?.title || "Unknown"}
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <DropdownMenuItem onClick={() => setCourseFilter("All")} className="cursor-pointer">All Courses</DropdownMenuItem>
                  {courses.map(c => (
                    <DropdownMenuItem key={c.id} onClick={() => setCourseFilter(c.id)} className="cursor-pointer">
                      {c.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3 hidden md:table-cell">Role</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Enrolled Courses</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors duration-150 ${
                        user.blocked ? "bg-rose-50/10 dark:bg-rose-950/5" : ""
                      }`}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {user.name}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">
                        {user.email}
                      </td>

                      {/* Role Text */}
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell capitalize">
                        {user.role}
                      </td>

                      {/* Enrolled Courses */}
                      <td className="px-4 py-3 text-sm hidden lg:table-cell">
                        {user.role?.toLowerCase() === 'student' && (() => {
                          const userCourses = courses.filter(c => c.enrolledStudents?.includes(user.id));
                          if (userCourses.length === 0) return <span className="text-xs text-zinc-500">None</span>;
                          return (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 gap-1 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                  {userCourses.length} Enrolled <ChevronDown className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                {userCourses.map(c => (
                                  <div key={c.id} className="flex items-center justify-between px-2 py-1.5 text-sm">
                                    <span className="truncate pr-2">{c.title}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 px-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                      onClick={() => handleKickStudent(user.id, c.id, user.name, c.title)}
                                    >
                                      Kick
                                    </Button>
                                  </div>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        })()}
                      </td>

                      {/* Access Status Badge */}
                      <td className="px-4 py-3">
                        {user.blocked ? (
                          <Badge className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 text-[10px] font-bold">
                            <Ban className="w-3 h-3" /> Blocked
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1 text-[10px] font-bold">
                            <UserCheck className="w-3 h-3" /> Active
                          </Badge>
                        )}
                      </td>

                      {/* Inline Actions */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={user.blocked ? "outline" : "destructive"}
                          size="sm"
                          disabled={user.id === currentUser.id || user.role?.toLowerCase() === 'teacher'} // Prevent blocking oneself or other teachers
                          onClick={() => handleToggleBlock(user.id)}
                          className={`text-xs font-semibold px-2 py-1 h-7 cursor-pointer ${
                            user.blocked 
                              ? "border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300" 
                              : "bg-rose-600 hover:bg-rose-500 text-white"
                          }`}
                        >
                          {user.blocked ? "Unblock" : "Block"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                {confirmModal.title}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-medium"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
