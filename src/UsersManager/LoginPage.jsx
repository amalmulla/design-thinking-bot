import React, { useState } from "react";
import { Brain, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersService } from "./usersService";

// Standard shadcn/ui components
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(""); // Clear error message when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      // Validate credentials using our asynchronous service
      const loggedUser = await usersService.login(formData.email.trim(), formData.password);
      
      // Check role to determine redirection target as requested
      const userRole = loggedUser.role ? loggedUser.role.toLowerCase() : "";
      if (userRole === "teacher" || userRole === "admin") {
        navigate("/teacher");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 text-black dark:text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans transition-colors duration-200">
      <Card className="w-full max-w-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
        
        <CardHeader className="space-y-4 pt-8 pb-6 text-center flex flex-col items-center">
          <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <Brain className="w-10 h-10 text-pink-500 dark:text-pink-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Design Thinking Bot
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your Socratic Guide to Innovation
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-11 rounded-lg"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-11 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-900/20 transition-all duration-300 cursor-pointer"
              >
                Login
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Footer Toggle Link */}
        <CardFooter className="pb-6 justify-center border-t border-zinc-100 dark:border-zinc-800/50 pt-6 mt-2">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-zinc-800 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </CardFooter>

      </Card>
    </div>
  );
}