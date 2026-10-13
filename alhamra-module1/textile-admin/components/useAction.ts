"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/types";

/** Runs a server action, tracks pending state, error and a short-lived success toast. */
export function useAction() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function run(fn: () => Promise<ActionResult>, onSuccess?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        onSuccess?.();
        if (res.message) {
          setToast(res.message);
          setTimeout(() => setToast(null), 3500);
        }
      } else {
        setError(res.error);
      }
    });
  }
  return { pending, error, setError, toast, setToast, run };
}
