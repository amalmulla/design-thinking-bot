import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function TestFeedbackGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 h-full content-start">
      <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 select-none">
            <CheckCircle2 className="h-4 w-4"/> What Worked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 select-none">Capture positive user feedback here...</p>
        </CardContent>
      </Card>
      
      <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 select-none">
            <AlertCircle className="h-4 w-4"/> What Could Be Improved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 select-none">Capture pain points and friction here...</p>
        </CardContent>
      </Card>
      
      <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2 select-none">
            <HelpCircle className="h-4 w-4"/> Questions Raised
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 select-none">What confused the user?</p>
        </CardContent>
      </Card>
      
      <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-amber-600 dark:text-yellow-400 flex items-center gap-2 select-none">
            <Lightbulb className="h-4 w-4"/> New Ideas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 select-none">New solutions sparked during testing...</p>
        </CardContent>
      </Card>
    </div>
  );
}
