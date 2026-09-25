import { useCallback, useEffect, useState, type SetStateAction } from "react";

import type { Task } from "@/lib/mock-ai";

export type SavedItem = {
  id: string;
  tool: "Task Planner" | "Research Assistant" | "AI Assistant";
  title: string;
  content: string;
  createdAt: string;
};

const FAV_KEY = "teachassist:favourites";
const ACT_KEY = "teachassist:activity";
const TASK_KEY = "teachassist:tasks";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("teachassist:storage", { detail: key }));
  } catch {
    /* quota or private mode */
  }
}

function useStoredList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    const sync = () => setItems(read<T[]>(key, []));
    sync();
    window.addEventListener("teachassist:storage", sync);
    return () => window.removeEventListener("teachassist:storage", sync);
  }, [key]);

  const set = useCallback(
    (next: SetStateAction<T[]>) => {
      const value = typeof next === "function" ? next(read<T[]>(key, [])) : next;
      write(key, value);
      setItems(value);
    },
    [key],
  );

  return [items, set] as const;
}

export function useFavourites() {
  const [items, set] = useStoredList<SavedItem>(FAV_KEY);

  const add = useCallback(
    (item: Omit<SavedItem, "id" | "createdAt">) => {
      const next: SavedItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      set([next, ...read<SavedItem[]>(FAV_KEY, [])]);
    },
    [set],
  );

  const remove = useCallback(
    (id: string) => set(read<SavedItem[]>(FAV_KEY, []).filter((i) => i.id !== id)),
    [set],
  );

  const clear = useCallback(() => set([]), [set]);

  return { favourites: items, add, remove, clear };
}

export type ActivityEntry = {
  id: string;
  tool: SavedItem["tool"];
  label: string;
  createdAt: string;
};

export function logActivity(tool: SavedItem["tool"], label: string) {
  const current = read<ActivityEntry[]>(ACT_KEY, []);
  write(ACT_KEY, [
    { id: crypto.randomUUID(), tool, label, createdAt: new Date().toISOString() },
    ...current,
  ].slice(0, 12));
}

export function useActivity() {
  const [items] = useStoredList<ActivityEntry>(ACT_KEY);
  return items;
}

export function clearActivity() {
  write(ACT_KEY, []);
}

export function useTasks() {
  return useStoredList<Task>(TASK_KEY);
}

export function exportToPdf() {
  if (typeof window !== "undefined") window.print();
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
