"use client";

import { useState, useCallback } from "react";
import { Toast, ToastType } from "@/types";
import { generateId } from "@/lib/id";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const toast: Toast = { id: generateId(), message, type };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
