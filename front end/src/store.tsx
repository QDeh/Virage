import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  JobAnalysisResponse,
  JobSuggestion,
  ProfileAnalysisResponse,
} from "./api";
export type Profile = {
  job: string;
  region: string;
  education: string;
  remote: string;
  cv: string;
  interests: string[];
  team: number;
  office: number;
  technical: number;
  relational: number;
  management: boolean;
  travel: boolean;
  autonomy: boolean;
  selected: string;
  profileAnalysis: ProfileAnalysisResponse | null;
  jobs: JobSuggestion[];
  jobAnalysis: JobAnalysisResponse | null;
  step: number;
  maxStep: number;
  view: "home" | "wizard" | "loading" | "dashboard";
};
export const initial: Profile = {
  job: "",
  region: "",
  education: "",
  remote: "Sans importance",
  cv: "",
  interests: [],
  team: 65,
  office: 70,
  technical: 60,
  relational: 75,
  management: false,
  travel: false,
  autonomy: true,
  selected: "",
  profileAnalysis: null,
  jobs: [],
  jobAnalysis: null,
  step: 0,
  maxStep: 0,
  view: "home",
};
const Context = createContext<{
  state: Profile;
  update: (data: Partial<Profile>) => void;
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  reset: () => void;
} | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [state, setState] = useState<Profile>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("virage-profile") || "null",
      );
      if (!saved) return initial;
      const restored = { ...initial, ...saved };
      if (!Array.isArray(saved.jobs) && saved.step >= 3) {
        restored.step = 2;
        restored.maxStep = Math.min(saved.maxStep ?? 0, 2);
        restored.selected = "";
        restored.view = "wizard";
      }
      if (saved.view === "loading") restored.view = "wizard";
      return restored;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("virage-profile", JSON.stringify(state));
    } catch {
      /* Private browsing can disable storage. */
    }
  }, [state]);
  return (
    <Context.Provider
      value={{
        state,
        update: (data) => setState((s) => ({ ...s, ...data })),
        cvFile,
        setCvFile,
        reset: () => {
          setCvFile(null);
          setState({ ...initial, view: "wizard" });
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useVirage() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Provider required");
  return ctx;
}
