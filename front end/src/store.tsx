import {
  createContext,
  useContext,
  useCallback,
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
  cvStoragePath: string;
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
  jobAnalyses: Record<string, JobAnalysisResponse>;
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
  cvStoragePath: "",
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
  jobAnalyses: {},
  step: 0,
  maxStep: 0,
  view: "home",
};
const Context = createContext<{
  state: Profile;
  update: (data: Partial<Profile>) => void;
  replace: (profile: Profile) => void;
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  reset: () => void;
} | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      localStorage.removeItem("virage-profile");
    } catch {
      // Old local-only profile data is optional to clear.
    }
  }, []);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [state, setState] = useState<Profile>(initial);
  const update = useCallback(
    (data: Partial<Profile>) => setState((current) => ({ ...current, ...data })),
    [],
  );
  const replace = useCallback((profile: Profile) => setState(profile), []);
  const reset = useCallback(() => {
    setCvFile(null);
    setState({ ...initial, view: "wizard" });
  }, []);
  return (
    <Context.Provider
      value={{
        state,
        update,
        replace,
        cvFile,
        setCvFile,
        reset,
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
