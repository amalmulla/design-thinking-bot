import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, ShieldAlert, CheckCircle, Ban, UserCheck, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersService } from "./usersService";

// Standard UI components
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Header from "../components/ui/Header";

export default function ManageUsers({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });

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
      const users = await usersService.getAllUsers();
      const normalizedUsers = (users || []).map(u => ({ ...u, id: u._id || u.id }));
      setUsersList(normalizedUsers);
    } catch (err) {
      showNotification("Failed to load users.", "error");
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

  const handleRoleChange = async (id, newRole) => {
    try {
      await usersService.changeUserRole(id, newRole);
      await fetchUsersData();
      showNotification(`Successfully changed user role to ${newRole}.`);
    } catch (err) {
      showNotification(err.message || "Failed to update user role.", "error");
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const updatedUser = await usersService.toggleBlockUser(id);
      await fetchUsersData();
      
      if (updatedUser.blocked) {
        showNotification(`Blocked user.`, "warning");
      } else {
        showNotification(`Unblocked user.`, "success");
      }
    } catch (err) {
      showNotification(err.message || "Failed to toggle block status.", "error");
    }
  };

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
          <CardHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Registered System Accounts ({usersList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="px-6 py-4">User ID / Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Password</th>
                    <th className="px-6 py-4">System Role</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {usersList.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors duration-150 ${
                        user.blocked ? "bg-rose-50/10 dark:bg-rose-950/5" : ""
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tighter">
                            ID: {user.id}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {user.email}
                      </td>

                      {/* Password Privacy Mask */}
                      <td className="px-6 py-4 text-xs font-mono text-zinc-400 dark:text-zinc-600 select-none">
                        •••••••• (secured)
                      </td>

                      {/* Role Toggle Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.id === currentUser.id} // Prevent self role downgrading
                          className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300"
                        >
                          <option value="Student">Student</option>
                          <option value="Teacher">Teacher</option>
                        </select>
                      </td>

                      {/* Access Status Badge */}
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant={user.blocked ? "outline" : "destructive"}
                          size="sm"
                          disabled={user.id === currentUser.id} // Prevent blocking oneself
                          onClick={() => handleToggleBlock(user.id)}
                          className={`text-xs font-semibold px-3 h-8 cursor-pointer ${
                            user.blocked 
                              ? "border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300" 
                              : "bg-rose-600 hover:bg-rose-500 text-white"
                          }`}
                        >
                          {user.blocked ? "Unblock" : "Block User"}
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

    </div>
  );
}
