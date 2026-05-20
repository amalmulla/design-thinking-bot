import React, { useState } from "react";
import { Brain, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Assuming standard shadcn/ui components are available at these paths
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Placeholder for future Firebase Authentication logic
    console.log("Submitting Auth Data:", {
      mode: isSignUp ? "Register" : "Login",
      role,
      ...formData,
    });

    // Navigation logic
    if (role === "student") {
      navigate("/dashboard"); // Or "/dashboard" depending on your intended starting point
    } else if (role === "teacher") {
      navigate("/teacher");
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/80 rounded-2xl overflow-hidden">
        
        <CardHeader className="space-y-4 pt-8 pb-6 text-center flex flex-col items-center">
          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 shadow-inner">
            {/* Brain icon representing the Socratic AI Bot */}
            <Brain className="w-10 h-10 text-pink-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Design Thinking Bot
            </h1>
            <p className="text-sm text-zinc-400">
              {isSignUp
                ? "Create your profile to start innovating"
                : "Your Socratic Guide to Innovation"}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 font-medium tracking-wider">
                I am a:
              </Label>
              <Tabs 
                value={role} 
                onValueChange={setRole} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-zinc-950 border border-zinc-800 rounded-lg h-11 p-1">
                  <TabsTrigger 
                    value="student" 
                    className="rounded-md data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-zinc-300 transition-all"
                  >
                    Student
                  </TabsTrigger>
                  <TabsTrigger 
                    value="teacher" 
                    className="rounded-md data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-zinc-300 transition-all"
                  >
                    Teacher
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-4 pt-2">
              {/* Conditional Full Name Field for Registration */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-zinc-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required={isSignUp}
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-100 placeholder:text-zinc-600 h-11 rounded-lg"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-100 placeholder:text-zinc-600 h-11 rounded-lg"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    Password
                  </Label>
                  {!isSignUp && (
                    <button type="button" className="text-xs text-violet-400 hover:text-violet-300 hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-zinc-100 placeholder:text-zinc-600 h-11 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-900/20 transition-all duration-300"
              >
                {isSignUp ? "Create Account" : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Footer Toggle Link */}
        <CardFooter className="pb-8 justify-center border-t border-zinc-800/50 pt-6 mt-2">
          <div className="text-sm text-zinc-400">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                // Clear form data on toggle
                setFormData({ name: "", email: "", password: "" });
              }}
              className="font-semibold text-white hover:text-violet-400 hover:underline transition-colors focus:outline-none"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardFooter>

      </Card>
    </div>
  );
}