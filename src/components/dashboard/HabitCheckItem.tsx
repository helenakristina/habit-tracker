"use client";

import { Habit } from "@/types";
import { HABIT_COLOR_MAP } from "@/lib/constants";
import { motion } from "framer-motion";
import StreakDisplay from "./StreakDisplay";

interface HabitCheckItemProps {
  habit: Habit;
  isCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  onToggle: () => void;
}

export default function HabitCheckItem({ habit, isCompleted, currentStreak, longestStreak, onToggle }: HabitCheckItemProps) {
  const colors = HABIT_COLOR_MAP[habit.color];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <button
        onClick={onToggle}
        className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={`${isCompleted ? "Uncheck" : "Check"} ${habit.name}`}
        role="checkbox"
        aria-checked={isCompleted}
      >
        <motion.div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors
            ${isCompleted ? `${colors.bg} border-transparent` : `border-gray-300 hover:border-gray-400`}`}
          whileTap={{ scale: 0.85 }}
          animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {isCompleted && (
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="white"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.path d="M3 7l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </motion.div>
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {habit.name}
        </p>
        <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />
      </div>
    </div>
  );
}
