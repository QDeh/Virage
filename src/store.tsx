import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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
  selected: "support",
  step: 0,
  maxStep: 0,
  view: "home",
};
const Context = createContext<{
  state: Profile;
  update: (data: Partial<Profile>) => void;
  reset: () => void;
} | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Profile>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("virage-profile") || "null",
      );
      return saved
        ? {
            ...initial,
            ...saved,
            view: saved.view === "loading" ? "wizard" : saved.view,
          }
        : initial;
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
        reset: () => setState({ ...initial, view: "wizard" }),
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
