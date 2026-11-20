import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { Route } from "lucide-react";
import { Button, Card } from "./components/ui";
import { supabase, supabaseConfigured } from "./supabase";

type AccountContextValue = {
  user: User;
  signOut: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("An authenticated account is required");
  return account;
}

function SignInScreen() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signUp") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage("Consultez votre courriel pour confirmer la création du compte.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "La connexion a échoué. Réessayez.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="account-screen">
      <Card className="account-card">
        <div className="account-brand">
          <span className="brand-icon">
            <Route size={23} strokeWidth={2.5} />
          </span>
          <strong>virage<span className="brand-dot">.</span></strong>
        </div>
        <h1>{mode === "signIn" ? "Retrouvez votre parcours" : "Créer un compte"}</h1>
        <p className="muted">
          Votre profil, votre CV et les résultats de vos analyses seront
          enregistrés dans votre espace personnel.
        </p>
        <form className="account-form" onSubmit={submit}>
          <label htmlFor="account-email">Adresse courriel</label>
          <input
            id="account-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="account-password">Mot de passe</label>
          <input
            id="account-password"
            type="password"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className="error" role="alert">{error}</p>}
          {message && <p className="account-message" role="status">{message}</p>}
          <Button type="submit" disabled={busy}>
            {busy
              ? "Veuillez patienter…"
              : mode === "signIn"
                ? "Se connecter"
                : "Créer mon compte"}
          </Button>
        </form>
        <button
          className="text-link account-toggle"
          type="button"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError("");
            setMessage("");
          }}
        >
          {mode === "signIn"
            ? "Pas encore de compte ? Créez-en un"
            : "Vous avez déjà un compte ? Connectez-vous"}
        </button>
      </Card>
    </main>
  );
}

export function AccountGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!supabaseConfigured) {
    return (
      <main className="account-screen">
        <Card className="account-card">
          <div className="account-brand">
            <span className="brand-icon"><Route size={23} strokeWidth={2.5} /></span>
            <strong>virage<span className="brand-dot">.</span></strong>
          </div>
          <h1>Configuration Supabase requise</h1>
          <p>
            Créez votre projet Supabase puis renseignez{" "}
            <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code>
            {" "}dans le fichier <code>front end/.env.local</code>. Suivez{" "}
            <code>front end/README.md</code> pour configurer la base et le
            stockage privé avant de démarrer l’application.
          </p>
        </Card>
      </main>
    );
  }
  if (!ready) return <main className="account-screen">Chargement…</main>;
  if (authError) {
    return <main className="account-screen"><p className="error">{authError}</p></main>;
  }
  if (!user) return <SignInScreen />;

  return (
    <AccountContext.Provider
      value={{
        user,
        signOut: async () => {
          if (!supabase) return;
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        },
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
