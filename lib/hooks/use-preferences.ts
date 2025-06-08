"use client";

import { useState, useEffect } from "react";
import type { StoredPreferences, Template } from "@/lib/types/cover-sheet";

const STORAGE_KEY = "cover-sheet-preferences";

export function usePreferences() {
  const [preferences, setPreferences] = useState<StoredPreferences>({});

  useEffect(() => {
    // Load preferences from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse stored preferences:", err);
      }
    }
  }, []);

  const updatePreferences = (newPrefs: Partial<StoredPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const saveTemplate = (template: Template) => {
    updatePreferences({ lastUsedTemplate: template });
  };

  const saveDeclaration = (declaration: string) => {
    updatePreferences({ defaultDeclaration: declaration });
  };

  const clearPreferences = () => {
    setPreferences({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    preferences,
    saveTemplate,
    saveDeclaration,
    clearPreferences
  };
} 