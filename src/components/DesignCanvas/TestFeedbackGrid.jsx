import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function TestFeedbackGrid({ 
  isReadOnly, 
  worked = "", 
  improved = "", 
  questions = "", 
  ideas = "", 
  onUpdate 
}) {
  const cards = [
    { 
      key: "worked", 
      title: "What Worked", 
      icon: CheckCircle2, 
      colorClass: "text-emerald-600 dark:text-emerald-400", 
      borderClass: "border-emerald-500/20",
      value: worked, 
      placeholder: "Capture positive user feedback, features they liked, or successful interactions..." 
    },
    { 
      key: "improved", 
      title: "What Could Be Improved", 
      icon: AlertCircle, 
      colorClass: "text-rose-600 dark:text-rose-400", 
      borderClass: "border-rose-500/20",
      value: improved, 
      placeholder: "Capture friction points, user confusion, or elements that didn't work well..." 
    },
    { 
      key: "questions", 
      title: "Questions Raised", 
      icon: HelpCircle, 
      colorClass: "text-blue-600 dark:text-blue-400", 
      borderClass: "border-blue-500/20",
      value: questions, 
      placeholder: "What new questions came up? What did they ask or inquire about?" 
    },
    { 
      key: "ideas", 
      title: "New Ideas", 
      icon: Lightbulb, 
      colorClass: "text-amber-600 dark:text-yellow-400", 
      borderClass: "border-yellow-500/20",
      value: ideas, 
      placeholder: "What new creative suggestions or potential solutions were triggered during testing?" 
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 h-full content-start mt-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className={`bg-zinc-50/50 dark:bg-zinc-900/50 border ${card.borderClass} shadow-sm rounded-xl`}>
            <CardHeader className="pb-2 pt-4 select-none">
              <CardTitle className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${card.colorClass}`}>
                <Icon className="h-4 w-4"/> 
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isReadOnly ? (
                <p className="text-sm text-zinc-750 dark:text-zinc-350 min-h-[100px] leading-relaxed whitespace-pre-wrap">
                  {card.value.trim() ? `"${card.value}"` : <span className="italic text-zinc-400 dark:text-zinc-650">No notes captured.</span>}
                </p>
              ) : (
                <textarea
                  value={card.value}
                  onChange={(e) => onUpdate && onUpdate(card.key, e.target.value)}
                  placeholder={card.placeholder}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-blue-500 outline-none min-h-[110px] resize-y transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 leading-normal"
                />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
