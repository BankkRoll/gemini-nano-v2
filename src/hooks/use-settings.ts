"use client";

import type { AppSettings } from "@/lib/config";
import { getSettings, setSettings } from "@/lib/storage";
import { useEffect, useState } from "react";

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());

  useEffect(() => {
    setSettingsState(getSettings());
  }, []);

  const update = (
    next: Partial<AppSettings> | ((prev: AppSettings) => AppSettings),
  ) => {
    const newSettings = setSettings(next);
    setSettingsState(newSettings);
    return newSettings;
  };

  return { settings, update };
}
