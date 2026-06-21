import React, { useState } from "react";
import { Brain, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersService } from "./usersService";

// Assuming standard shadcn/ui components are available
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function Register() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(""); // Clear error on change
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Full name is required.";
    if (!formData.email.trim()) return "Email address is required.";
    
    // Simple email validation pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
    
    if (!formData.password) return "Password is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters long.";
    if (!formData.confirmPassword) return "Please confirm your password.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await usersService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: role === "teacher" ? "Teacher" : "Student",
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Card className="w-full max-w-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
        
        <CardHeader className="space-y-4 pt-8 pb-6 text-center flex flex-col items-center">
          <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <Brain className="w-10 h-10 text-pink-500 dark:text-pink-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Create an Account
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Join the Socratic Design Thinking Platform
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wider">
                I am registering as a:
              </Label>
              <Tabs 
                value={role} 
                onValueChange={setRole} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg h-11 p-1">
                  <TabsTrigger 
                    value="student" 
                    className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all font-medium text-sm"
                  >
                    Student
                  </TabsTrigger>
                  <TabsTrigger 
                    value="teacher" 
                    className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all font-medium text-sm"
                  >
                    Teacher
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-4 pt-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-11 rounded-lg"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-11 rounded-lg"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-11 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-11 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-900/20 transition-all duration-300 cursor-pointer"
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Footer Toggle Link */}
        <CardFooter className="pb-8 justify-center border-t border-zinc-100 dark:border-zinc-800/50 pt-6 mt-2">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-zinc-800 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </CardFooter>

      </Card>
    </div>
  );
}
