import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Edit2, Check, X, ArrowLeft, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersService } from "./usersService";

// Standard shadcn/ui style components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import Header from "../components/ui/Header";

export default function Profile({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync profile details with sessionStorage
  const fetchUser = () => {
    const user = usersService.getCurrentUser();
    if (!user) {
      // If not logged in, send back to login screen
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Keep password field empty for security
    });
  };

  useEffect(() => {
    fetchUser();

    // Listen to changes from user updates to keep in sync
    const handleUpdate = () => {
      fetchUser();
    };

    window.addEventListener("currentUserUpdated", handleUpdate);
    return () => {
      window.removeEventListener("currentUserUpdated", handleUpdate);
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const updatePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      // If user supplied a new password, include it in the update
      if (formData.password) {
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        updatePayload.password = formData.password;
      }

      await usersService.updateUser(currentUser.id, updatePayload);
      setSuccess("Profile details updated successfully!");
      setIsEditMode(false);
      setError("");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
  };

  const handleLogout = () => {
    usersService.logout();
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      
      {/* GLOBAL REUSABLE HEADER */}
      <Header theme={theme} toggleTheme={toggleTheme} brainColor="text-pink-500 dark:text-pink-400">
        <div className="flex items-center gap-3 mr-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-0 px-2 h-8 cursor-pointer"
            onClick={() => {
              if (currentUser.role?.toLowerCase() === "teacher") {
                navigate("/teacher");
              } else {
                navigate("/dashboard");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentUser.role?.toLowerCase() === "teacher" ? "Back to Command Center" : "Back to Dashboard"}
          </Button>
        </div>
        {currentUser.role?.toLowerCase() === "teacher" && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-800 dark:text-zinc-300 h-8"
            onClick={() => navigate("/manage-users")}
          >
            Manage Users
          </Button>
        )}
      </Header>

      {/* PROFILE CONTENT */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl overflow-hidden">
          
          <CardHeader className="text-center pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
            <div className="relative mx-auto w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center border border-violet-200 dark:border-violet-800 shadow-inner mb-4">
              <User className="w-12 h-12 text-violet-600 dark:text-violet-400" />
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200 cursor-pointer"
                aria-label="Toggle Edit Mode"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white">
              {currentUser.name}
            </CardTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 capitalize font-medium">
              System Role: <span className="text-violet-600 dark:text-violet-400 font-semibold">{currentUser.role}</span>
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {success}
              </div>
            )}

            {!isEditMode ? (
              // READ-ONLY PROFILE DETAIL VIEW
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <div className="bg-zinc-200 dark:bg-zinc-900 p-2 rounded-lg text-zinc-600 dark:text-zinc-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-medium text-zinc-850 dark:text-zinc-200">{currentUser.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <div className="bg-zinc-200 dark:bg-zinc-900 p-2 rounded-lg text-zinc-600 dark:text-zinc-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-zinc-850 dark:text-zinc-200">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <div className="bg-zinc-200 dark:bg-zinc-900 p-2 rounded-lg text-zinc-600 dark:text-zinc-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Access Clearance</p>
                    <p className="text-sm font-medium text-zinc-850 dark:text-zinc-200 capitalize">
                      Approved ({currentUser.role})
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // EDITABLE PROFILE VIEW
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 h-10 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled // email change disabled to preserve unique key in our mock DB
                    className="bg-zinc-100 dark:bg-zinc-950 border-zinc-250 dark:border-zinc-850 text-zinc-400 dark:text-zinc-500 h-10 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Leave empty to keep current password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 h-10 rounded-lg"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg shadow h-10 cursor-pointer"
                  >
                    <Check className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-zinc-200 dark:border-zinc-800 text-zinc-750 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-950 h-10 rounded-lg cursor-pointer"
                    onClick={() => {
                      setIsEditMode(false);
                      setError("");
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

        </Card>
      </div>

    </div>
  );
}
