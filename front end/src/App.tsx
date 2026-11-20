import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCheck,
  UploadCloud,
  FileText,
  X,
  ShieldCheck,
  Clock3,
  Sparkles,
  Target,
  Route,
  GraduationCap,
  Compass,
  BriefcaseBusiness,
  Users,
  Monitor,
  Heart,
  Wrench,
  Gamepad2,
  Megaphone,
  ChartNoAxesCombined,
  Wallet,
  ShoppingBag,
  Truck,
  Building2,
  Stethoscope,
  BookOpen,
  Settings2,
  CircleHelp,
  Download,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  LockKeyhole,
  Menu,
  Flag,
  TrendingUp,
} from "lucide-react";
import { Badge, Button, Card, Progress } from "./components/ui";
import { interests, steps } from "./data";
import { initial, useVirage } from "./store";
import type { Profile } from "./store";
import { analyzeJob, analyzeProfile, matchJobs } from "./api";
import type { Training } from "./api";
import { useAccount } from "./account";
import {
  deleteCv,
  downloadCv,
  loadProfile,
  saveProfile,
  uploadCv,
} from "./persistence";

type SelectedJob = {
  id: string;
  title: string;
  score: number;
  description: string;
  reason: string;
  skills: string[];
  existingSkills: string[];
  duration: string;
  roadmap: { month: number; objectives: string[] }[];
  trainings: Training[];
};

const interestIcons = [
  Monitor,
  Gamepad2,
  Wrench,
  Settings2,
  BookOpen,
  Megaphone,
  ChartNoAxesCombined,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Users,
  Stethoscope,
  Truck,
  Building2,
  Heart,
  GraduationCap,
];
function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Virage, accueil">
      <span className="brand-icon">
        <Route size={23} strokeWidth={2.5} />
      </span>
      virage<span className="brand-dot">.</span>
    </button>
  );
}
function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export default function App() {
  const { state, update, replace, reset, cvFile, setCvFile } = useVirage();
  const { user, signOut } = useAccount();
  const [profileReady, setProfileReady] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [help, setHelp] = useState(false);
  const [restart, setRestart] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [apiError, setApiError] = useState("");
  const [jobLoading, setJobLoading] = useState(false);
  const focusRef = useRef<HTMLElement>(null);
  const suggestion =
    state.jobs.find((candidate) => candidate.name === state.selected) ??
    state.jobs[0];
  const job: SelectedJob = suggestion
    ? {
        id: suggestion.name,
        title: suggestion.name,
        score: state.jobAnalysis?.compatibility ?? suggestion.score,
        description: suggestion.description,
        reason: suggestion.reason,
        skills: state.jobAnalysis?.missingSkills ?? [],
        existingSkills: state.jobAnalysis?.existingSkills ?? [],
        duration: state.jobAnalysis?.estimatedDuration ?? "À estimer",
        roadmap: state.jobAnalysis?.roadmap ?? [],
        trainings: state.jobAnalysis?.trainings ?? [],
      }
    : {
        id: "",
        title: "",
        score: 0,
        description: "",
        reason: "",
        skills: [],
        existingSkills: [],
        duration: "À estimer",
        roadmap: [],
        trainings: [],
      };
  useEffect(() => {
    let active = true;
    setProfileReady(false);
    setProfileLoadError("");
    setSyncError("");
    const restore = async () => {
      try {
        const saved = await loadProfile(user.id);
        const profile = saved?.app_state
          ? { ...initial, ...saved.app_state }
          : { ...initial };
        if (profile.view === "loading") profile.view = "wizard";
        if (saved?.cv_path) {
          const blob = await downloadCv(saved.cv_path);
          profile.cvStoragePath = saved.cv_path;
          if (active) {
            setCvFile(
              new File([blob], profile.cv || "cv.pdf", {
                type: blob.type || "application/pdf",
              }),
            );
          }
        } else if (active) {
          setCvFile(null);
          profile.cvStoragePath = "";
        }
        if (active) {
          replace(profile);
          setProfileReady(true);
        }
      } catch (error) {
        if (active) {
          setProfileLoadError(
            error instanceof Error
              ? error.message
              : "Impossible de charger votre espace personnel.",
          );
          setProfileReady(true);
        }
      }
    };
    void restore();
    return () => {
      active = false;
    };
  }, [user.id, replace, setCvFile]);
  useEffect(() => {
    if (!profileReady || profileLoadError) return;
    setSyncing(true);
    const timeout = window.setTimeout(() => {
      void saveProfile(user.id, state).then(
        () => {
          setSyncError("");
          setSyncing(false);
        },
        (error: unknown) => {
          setSyncError(
            error instanceof Error
              ? error.message
              : "La sauvegarde de votre espace a échoué.",
          );
          setSyncing(false);
        },
      );
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [profileReady, profileLoadError, state, user.id]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    focusRef.current?.focus();
    const activeStep = document.querySelector<HTMLElement>(".step.current");
    const stepper = activeStep?.parentElement;
    if (activeStep && stepper) {
      stepper.scrollLeft +=
        activeStep.getBoundingClientRect().left -
        stepper.getBoundingClientRect().left -
        4;
    }
  }, [state.step, state.view]);
  if (!profileReady) {
    return <main className="account-screen">Chargement de votre espace personnel…</main>;
  }
  if (profileLoadError) {
    return (
      <main className="account-screen">
        <p className="error" role="alert">
          Impossible de charger vos données : {profileLoadError}
        </p>
        <p>Vérifiez la configuration Supabase et les règles de sécurité de la base et du stockage.</p>
      </main>
    );
  }
  const go = (step: number) =>
    update({ step, view: "wizard", maxStep: Math.max(state.maxStep, step) });
  const startAnalysis = async () => {
    setApiError("");
    update({ view: "loading", profileAnalysis: null, jobs: [], jobAnalysis: null });
    try {
      const profile = await analyzeProfile(cvFile, {
        currentJob: state.job,
        region: state.region,
        hobbies: state.interests,
        preferences: {
          education: state.education,
          remote: state.remote,
          team: state.team,
          office: state.office,
          technical: state.technical,
          relational: state.relational,
          management: state.management,
          travel: state.travel,
          autonomy: state.autonomy,
        },
      });
      const matches = await matchJobs(profile);
      const sortedJobs = [...matches.jobs].sort((first, second) => second.score - first.score);
      update({
        profileAnalysis: profile,
        jobs: sortedJobs,
        selected: sortedJobs[0]?.name ?? "",
        step: 3,
        maxStep: Math.max(state.maxStep, 3),
        view: "wizard",
      });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "L’analyse du profil a échoué.",
      );
      update({ view: "wizard" });
    }
  };
  const selectJob = async (name: string) => {
    if (!state.profileAnalysis) {
      setApiError("Relancez l’analyse de votre profil avant de choisir un métier.");
      return;
    }
    setApiError("");
    setJobLoading(true);
    update({ selected: name, jobAnalysis: null });
    try {
      const analysis = await analyzeJob(name, state.profileAnalysis);
      update({
        jobAnalysis: analysis,
        step: 4,
        maxStep: Math.max(state.maxStep, 4),
        view: "wizard",
      });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "L’analyse du métier a échoué.",
      );
    } finally {
      setJobLoading(false);
    }
  };
  const restartProject = async () => {
    try {
      if (state.cvStoragePath) await deleteCv(state.cvStoragePath);
      reset();
      setRestart(false);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? `Le CV enregistré n’a pas pu être supprimé : ${error.message}`
          : "Le CV enregistré n’a pas pu être supprimé.",
      );
    }
  };
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Brand onClick={() => update({ view: "home" })} />
          <nav
            className={mobile ? "top-nav open" : "top-nav"}
            aria-label="Navigation principale"
          >
            <button
              className={state.view === "home" ? "active" : ""}
              onClick={() => {
                update({ view: "home" });
                setMobile(false);
              }}
            >
              Découvrir Virage
            </button>
            <button
              className={state.view !== "home" ? "active" : ""}
              onClick={() => {
                update({
                  view: state.view === "dashboard" ? "dashboard" : "wizard",
                });
                setMobile(false);
              }}
            >
              Mon parcours
            </button>
          </nav>
          <div className="header-actions">
            <button className="help-button" onClick={() => setHelp(true)}>
              <CircleHelp size={17} />
              <span>Besoin d’aide ?</span>
            </button>
            <span className="header-divider" />
            <span className="user-avatar" aria-label="Espace personnel">
              ME
            </span>
            <button
              className="text-link"
              onClick={() => {
                void signOut().catch((error: unknown) =>
                  setApiError(
                    error instanceof Error ? error.message : "La déconnexion a échoué.",
                  ),
                );
              }}
            >
              Déconnexion
            </button>
            <button
              className="mobile-menu"
              onClick={() => setMobile(!mobile)}
              aria-label="Ouvrir la navigation"
              aria-expanded={mobile}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      {state.view === "home" ? (
        <Landing
          start={() => update({ view: "wizard" })}
          resume={state.maxStep > 0}
        />
      ) : (
        <>
          <div className="journey-header">
            <div className="journey-inner">
              <div className="journey-label">
                <span>
                  <Compass size={17} /> MON PARCOURS DE RECONVERSION
                </span>
                <span className="saved">
                  <CheckCheck size={15} />
                  {syncing ? "Enregistrement…" : "Progression sauvegardée"}
                </span>
              </div>
              <nav className="stepper" aria-label="Étapes du parcours">
                {steps.map((step, i) => (
                  <button
                    key={step}
                    disabled={i > state.maxStep || state.view === "loading"}
                    className={`step ${i === state.step && state.view !== "dashboard" ? "current" : ""} ${i < state.step || state.view === "dashboard" ? "completed" : ""}`}
                    onClick={() => go(i)}
                    aria-current={i === state.step ? "step" : undefined}
                  >
                    <span className="step-number">
                      {i < state.step || state.view === "dashboard" ? (
                        <Check size={15} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span>{step}</span>
                    {i < 6 && <span className="step-line" />}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <main
            ref={focusRef}
            tabIndex={-1}
            className={`main-content ${state.view === "loading" ? "loading-main" : ""}`}
          >
            {apiError && (
              <p className="error" role="alert">
                {apiError}
              </p>
            )}
            {syncError && (
              <p className="error" role="alert">
                Vos modifications ne sont pas synchronisées : {syncError}
              </p>
            )}
            {state.view === "loading" ? (
              <AnalysisLoading />
            ) : state.view === "dashboard" ? (
              state.jobAnalysis ? (
                <Dashboard
                  state={state}
                  job={job}
                  edit={go}
                  restart={() => setRestart(true)}
                />
              ) : (
                <p className="error" role="alert">
                  Analysez un métier pour afficher votre parcours.
                </p>
              )
            ) : (
              <div key={state.step} className="step-content enter">
                {state.step === 0 && <ProfileStep />}
                {state.step === 1 && (
                  <>
                    <Heading
                      eyebrow="ÉTAPE 02 · VOS MOTIVATIONS"
                      title="Parlez-nous de ce qui vous motive"
                      description="Vos centres d’intérêt ouvrent de nouvelles perspectives. Sélectionnez ce qui vous ressemble."
                    />
                    <div className="content-grid">
                      <Card className="form-card">
                        <div className="section-title">
                          <h2>Vos centres d’intérêt</h2>
                          <Badge>
                            {state.interests.length} sélectionné
                            {state.interests.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <p className="muted small">
                          Plusieurs choix possibles, même en dehors de votre
                          métier actuel.
                        </p>
                        <div className="interests-grid">
                          {interests.map((name, i) => {
                            const Icon = interestIcons[i];
                            const checked = state.interests.includes(name);
                            return (
                              <button
                                key={name}
                                className={`interest ${checked ? "selected" : ""}`}
                                aria-pressed={checked}
                                onClick={() =>
                                  update({
                                    interests: checked
                                      ? state.interests.filter(
                                          (x) => x !== name,
                                        )
                                      : [...state.interests, name],
                                  })
                                }
                              >
                                <Icon size={20} />
                                <span>{name}</span>
                                <span className="checkbox">
                                  {checked && <Check size={12} />}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </Card>
                      <Advice
                        title="Il n’y a pas de mauvaise réponse"
                        description="Un loisir ou une passion peut révéler des aptitudes précieuses pour votre futur métier."
                        items={[
                          "Élargissez vos possibilités",
                          "Pensez aussi à vos activités personnelles",
                          "Vous pourrez modifier vos choix",
                        ]}
                      />
                    </div>
                    <BottomNav
                      back={() => go(0)}
                      next={() => go(2)}
                      disabled={!state.interests.length}
                      note="Sélectionnez au moins un centre d’intérêt."
                    />
                  </>
                )}
                {state.step === 2 && (
                  <>
                    <Heading
                      eyebrow="ÉTAPE 03 · VOTRE ENVIRONNEMENT"
                      title="Quel environnement de travail vous correspond ?"
                      description="Un métier épanouissant, c’est aussi une façon de travailler qui vous ressemble."
                    />
                    <div className="content-grid">
                      <Card className="form-card">
                        <h2>Votre quotidien idéal</h2>
                        <div className="sliders">
                          {(
                            [
                              {
                                key: "team",
                                title: "Mode de collaboration",
                                left: "Travail individuel",
                                right: "Travail en équipe",
                              },
                              {
                                key: "office",
                                title: "Lieu de travail",
                                left: "Travail terrain",
                                right: "Bureau",
                              },
                              {
                                key: "technical",
                                title: "Orientation technique",
                                left: "Peu importante",
                                right: "Très importante",
                              },
                              {
                                key: "relational",
                                title: "Orientation relationnelle",
                                left: "Peu importante",
                                right: "Très importante",
                              },
                            ] as const
                          ).map((s) => (
                            <div className="slider-field" key={s.key}>
                              <label htmlFor={s.key}>
                                {s.title}
                                <span>{state[s.key]} %</span>
                              </label>
                              <input
                                id={s.key}
                                type="range"
                                min="0"
                                max="100"
                                value={state[s.key]}
                                onChange={(e) =>
                                  update({ [s.key]: +e.target.value })
                                }
                                style={{
                                  background: `linear-gradient(to right, #2563eb ${state[s.key]}%, #e8edf4 ${state[s.key]}%)`,
                                }}
                              />
                              <div>
                                <span>{s.left}</span>
                                <span>{s.right}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="switches">
                          {(
                            [
                              {
                                key: "management",
                                title: "Management d’équipe",
                                desc: "Encadrer et accompagner des collaborateurs",
                              },
                              {
                                key: "travel",
                                title: "Déplacements fréquents",
                                desc: "Un quotidien mobile, sur différents sites",
                              },
                              {
                                key: "autonomy",
                                title: "Autonomie importante",
                                desc: "Organiser librement mon travail",
                              },
                            ] as const
                          ).map((s) => (
                            <div className="switch-row" key={s.key}>
                              <div>
                                <label id={`${s.key}-label`}>{s.title}</label>
                                <p>{s.desc}</p>
                              </div>
                              <button
                                role="switch"
                                aria-checked={state[s.key]}
                                aria-labelledby={`${s.key}-label`}
                                className={`switch ${state[s.key] ? "on" : ""}`}
                                onClick={() =>
                                  update({ [s.key]: !state[s.key] })
                                }
                              >
                                <span />
                              </button>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Advice
                        title="À votre image"
                        description="Projetez-vous dans une journée de travail idéale. Ces préférences font partie de votre réflexion professionnelle."
                        items={[
                          "Des préférences qui peuvent évoluer",
                          "Un projet adapté à votre quotidien",
                          "Une vision globale de votre profil",
                        ]}
                      />
                    </div>
                    <BottomNav
                      back={() => go(1)}
                      next={startAnalysis}
                      label="Découvrir mes métiers"
                      icon={<Sparkles size={17} />}
                    />
                  </>
                )}
                {state.step === 3 && (
                  <>
                    <Heading
                      eyebrow="ÉTAPE 04 · VOS PERSPECTIVES"
                      title="Les métiers qui vous correspondent"
                      description="De nouvelles pistes à explorer, à partir de vos compétences et de vos aspirations."
                    />
                    <div className="results-banner">
                      <div className="soft-icon">
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <strong>Votre expérience a de l’avenir.</strong>
                        <p>
                          {state.jobs.length} piste
                          {state.jobs.length > 1 ? "s" : ""} pour valoriser vos
                          compétences et donner un nouvel élan à votre carrière.
                        </p>
                      </div>
                      <Badge>Profil analysé</Badge>
                    </div>
                    <div className="results-heading">
                      <h2>
                        Vos recommandations{" "}
                        <span>{state.jobs.length} métiers</span>
                      </h2>
                      <span className="muted small">
                        Triés par compatibilité
                      </span>
                    </div>
                    <div className="jobs-grid">
                      {state.jobs.map((j, i) => (
                        <Card
                          className={`job-card ${i === 0 ? "best-match" : ""}`}
                          key={j.name}
                          style={{ animationDelay: `${i * 65}ms` }}
                        >
                          {i === 0 && (
                            <div className="match-ribbon">
                              <Sparkles size={13} /> Votre meilleure
                              correspondance
                            </div>
                          )}
                          <div className="job-top">
                            <span className="job-icon">
                              {i === 1 ? (
                                <GraduationCap />
                              ) : i === 4 ? (
                                <Users />
                              ) : (
                                <Monitor />
                              )}
                            </span>
                            <span className="score">
                              {j.score}
                              <small>%</small>
                              <span>de compatibilité</span>
                            </span>
                          </div>
                          <h2>{j.name}</h2>
                          <p>{j.description}</p>
                          <div className="why">
                            <strong>
                              <Lightbulb size={14} /> Pourquoi ce métier ?
                            </strong>
                            <p>{j.reason}</p>
                          </div>
                          <div className="job-meta">
                            <span>
                              <Clock3 size={14} />
                              Durée à estimer après analyse
                            </span>
                          </div>
                          <Button
                            variant={i === 0 ? "default" : "outline"}
                            disabled={jobLoading}
                            onClick={() => void selectJob(j.name)}
                          >
                            Voir le parcours
                            <ArrowRight size={16} />
                          </Button>
                        </Card>
                      ))}
                    </div>
                    {!state.jobs.length && (
                      <p className="muted">
                        Aucun métier compatible n’a été retourné. Modifiez
                        votre profil et relancez l’analyse.
                      </p>
                    )}
                    <div className="info-banner">
                      <Lightbulb size={20} />
                      <p>{state.profileAnalysis?.profileSummary}</p>
                    </div>
                    <BottomNav
                      back={() => go(2)}
                      next={() => suggestion && void selectJob(suggestion.name)}
                      disabled={!suggestion || jobLoading}
                      label="Explorer le métier sélectionné"
                    />
                  </>
                )}
                {state.step === 4 && (
                  <>
                    <Heading
                      eyebrow="ÉTAPE 05 · VOTRE POTENTIEL"
                      title="Analyse de compatibilité"
                      description={`Vos atouts et les prochaines compétences à développer pour devenir ${job.title.toLowerCase()}.`}
                    />
                    <div className="analysis-overview">
                      <Card className="score-card">
                        <div
                          className="score-ring"
                          style={
                            {
                              "--score": `${job.score}%`,
                            } as React.CSSProperties
                          }
                        >
                          <span>
                            {job.score}
                            <small>%</small>
                          </span>
                        </div>
                        <div>
                          <Badge className="badge-green">
                            Une piste prometteuse
                          </Badge>
                          <h2>{job.title}</h2>
                          <p>{job.reason}</p>
                        </div>
                      </Card>
                      <Card className="duration-card">
                        <Clock3 size={25} />
                        <span>Temps de progression estimé</span>
                        <strong>{job.duration}</strong>
                        <p>Un rythme à adapter à vos disponibilités.</p>
                      </Card>
                    </div>
                    <div className="skills-grid">
                      <Card className="form-card">
                        <span className="skill-heading green">
                          <CheckCircle2 size={21} />
                          <h2>Compétences acquises</h2>
                        </span>
                        <p className="muted small">
                          Un socle solide sur lequel vous appuyer.
                        </p>
                        {job.existingSkills.map((s) => (
                          <div className="skill-line" key={s}>
                            <Check size={17} />
                            {s}
                          </div>
                        ))}
                      </Card>
                      <Card className="form-card">
                        <span className="skill-heading orange">
                          <TrendingUp size={21} />
                          <h2>Compétences à acquérir</h2>
                        </span>
                        <p className="muted small">
                          Des apprentissages accessibles, étape par étape.
                        </p>
                        {job.skills.map((s) => (
                          <div className="skill-line learn" key={s}>
                            <span className="small-circle" />
                            {s}
                            <Badge>À développer</Badge>
                          </div>
                        ))}
                      </Card>
                    </div>
                    <div className="info-banner">
                      <Lightbulb size={20} />
                      <p>
                        <strong>Vous ne repartez pas de zéro.</strong> Votre
                        expérience est votre premier atout. Le parcours proposé
                        vous aide à construire la suite.
                      </p>
                    </div>
                    <BottomNav
                      back={() => go(3)}
                      next={() => go(5)}
                      label="Construire ma feuille de route"
                    />
                  </>
                )}
                {state.step === 5 && (
                  <>
                    <Heading
                      eyebrow="ÉTAPE 06 · VOTRE PLAN D’ACTION"
                      title="Votre feuille de route"
                      description="Un objectif clair, des étapes concrètes. Avancez à votre rythme vers votre nouveau métier."
                    />
                    <div className="content-grid">
                      <Card className="form-card roadmap-card">
                        <div className="section-title">
                          <h2>De votre expérience à {job.title}</h2>
                          <Badge>{job.duration}</Badge>
                        </div>
                        <div className="timeline">
                          {job.roadmap.map((step) => (
                            <div className="timeline-item" key={step.month}>
                              <span className="timeline-dot">
                                {step.month === job.roadmap.length ? (
                                  <Flag size={17} />
                                ) : (
                                  String(step.month).padStart(2, "0")
                                )}
                              </span>
                              <div>
                                <span className="eyebrow">MOIS {step.month}</span>
                                <h3>{step.objectives[0] ?? `Étape ${step.month}`}</h3>
                                <div className="timeline-tags">
                                  {step.objectives.map((item) => (
                                    <Badge key={item}>
                                      <Check size={12} />
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <div>
                        <Advice
                          title="Un parcours qui s’adapte à vous"
                          description="Cette feuille de route est un point de départ. Ajustez le rythme avec un conseiller selon votre situation."
                          items={[
                            "Des objectifs progressifs",
                            "La pratique au cœur du parcours",
                            "Une préparation à l’emploi",
                          ]}
                        />
                        <Card className="next-card">
                          <GraduationCap size={27} />
                          <h3>Et pour vous former ?</h3>
                          <p>
                            Découvrez des formations pour concrétiser cette
                            prochaine étape.
                          </p>
                          <button className="text-link" onClick={() => go(6)}>
                            Explorer les formations
                            <ArrowRight size={15} />
                          </button>
                        </Card>
                      </div>
                    </div>
                    <BottomNav
                      back={() => go(4)}
                      next={() => go(6)}
                      label="Trouver une formation"
                    />
                  </>
                )}
                {state.step === 6 && (
                  <>
                    <Heading
                      eyebrow="ÉTAPE 07 · PASSER À L’ACTION"
                      title="Formations recommandées"
                      description="Des pistes de formation pour transformer votre projet en compétences concrètes."
                    />
                    <div className="courses-grid">
                      {job.trainings.map((training) => (
                        <CourseCard
                          key={`${training.title}-${training.organization}`}
                          course={training}
                        />
                      ))}
                    </div>
                    {!job.trainings.length && (
                      <p className="muted">
                        Aucune formation n’a été recommandée pour ce métier.
                      </p>
                    )}
                    <div className="info-banner">
                      <Lightbulb size={20} />
                      <p>
                        <strong>Pensez au financement.</strong> Votre CPF,
                        France Travail ou votre région peuvent vous accompagner.
                        Vérifiez les conditions auprès des organismes.
                      </p>
                    </div>
                    <Card className="finish-card">
                      <span className="soft-icon">
                        <CheckCheck size={27} />
                      </span>
                      <div>
                        <h2>Votre nouvelle voie prend forme.</h2>
                        <p>
                          Retrouvez votre profil, votre métier cible et votre
                          plan d’action au même endroit.
                        </p>
                      </div>
                      <Button onClick={() => update({ view: "dashboard" })}>
                        Voir mon projet professionnel
                        <ArrowRight size={17} />
                      </Button>
                    </Card>
                    <BottomNav back={() => go(5)} />
                  </>
                )}
              </div>
            )}
          </main>
        </>
      )}
      <footer className="site-footer">
        <div>
          <Brand onClick={() => update({ view: "home" })} />
          <span>Trouvez votre prochaine voie professionnelle.</span>
        </div>
        <p>
          <ShieldCheck size={14} /> Votre CV est facultatif et transmis uniquement si vous le joignez
          <span className="footer-separator">·</span>
          <span>Pivot AI · 2026</span>
        </p>
      </footer>
      {help && (
        <Modal
          title="Un premier pas, en toute simplicité"
          close={() => setHelp(false)}
        >
          <p>
            Complétez votre profil, choisissez vos centres d’intérêt et explorez
            les métiers proposés. Vous pouvez revenir à chaque étape pour
            modifier vos réponses.
          </p>
          <p>
            Vous pouvez joindre un CV (PDF ou DOCX) pour enrichir l’analyse, ou
            continuer sans CV à partir des informations de votre profil. Le
            fichier est transmis au backend puis au workflow d’analyse n8n ;
            seul son nom et les résultats sont conservés dans ce navigateur.
          </p>
          <a
            className="text-link"
            href="https://www.francetravail.fr/"
            target="_blank"
            rel="noreferrer"
          >
            Être accompagné par France Travail
            <ExternalLink size={15} />
          </a>
        </Modal>
      )}
      {restart && (
        <Modal
          title="Commencer un nouveau projet ?"
          close={() => setRestart(false)}
        >
          <p>
            Vos réponses, résultats et CV enregistrés seront supprimés de votre
            espace. Vous pouvez télécharger votre rapport avant de recommencer.
          </p>
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setRestart(false)}>
              Conserver mon projet
            </Button>
            <Button onClick={() => void restartProject()}>
              Recommencer
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Landing({ start, resume }: { start: () => void; resume: boolean }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <Badge className="hero-badge">
              <span /> UN NOUVEAU DÉPART, À VOTRE RYTHME
            </Badge>
            <h1>
              Votre reconversion
              <br />
              commence{" "}
              <span>
                ici
                <svg viewBox="0 0 120 12" aria-hidden="true">
                  <path d="M3 9Q55 -2 117 6" />
                </svg>
                .
              </span>
            </h1>
            <p>
              Découvrez les métiers qui correspondent réellement à votre profil
              et construisez votre futur professionnel.
            </p>
            <div className="hero-buttons">
              <Button onClick={start}>
                {resume ? "Reprendre mon analyse" : "Commencer mon analyse"}
                <ArrowRight size={18} />
              </Button>
              <span>
                <Clock3 size={15} /> 5 minutes pour faire le premier pas
              </span>
            </div>
            <div className="hero-trust">
              <span>
                <CheckCircle2 size={16} /> Gratuit et sans engagement
              </span>
              <span>
                <LockKeyhole size={15} /> Vos données restent privées
              </span>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Aperçu d’un projet de reconversion"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="visual-star star-one">✦</span>
            <span className="visual-star star-two">✧</span>
            <div className="floating-label label-top">
              <span className="mini-icon">
                <Sparkles size={16} />
              </span>
              Votre expérience a de la valeur
            </div>
            <Card className="preview-card">
              <div className="preview-header">
                <span className="preview-avatar">
                  <BriefcaseBusiness size={23} />
                </span>
                <div>
                  <span className="eyebrow">VOTRE PROCHAIN CHAPITRE</span>
                  <h3>Un avenir qui vous ressemble</h3>
                </div>
                <span className="preview-dots">···</span>
              </div>
              <div className="preview-route">
                <div>
                  <span className="route-node" />
                  <p>
                    Aujourd’hui<strong>Votre expérience</strong>
                  </p>
                </div>
                <div className="route-middle">
                  <span />
                  <Badge>Vos compétences font le lien</Badge>
                </div>
                <div>
                  <span className="route-node target-node">
                    <Flag size={12} />
                  </span>
                  <p>
                    Demain<strong>De nouvelles possibilités</strong>
                  </p>
                </div>
              </div>
              <div className="preview-match">
                <span className="job-icon">
                  <Monitor size={21} />
                </span>
                <div>
                  <strong>Technicien Support IT</strong>
                  <span>Une piste à explorer</span>
                </div>
                <span className="preview-score">
                  89<small>%</small>
                </span>
              </div>
              <Progress value={89} label="Exemple de compatibilité" />
              <div className="preview-bottom">
                <span>
                  <CheckCircle2 size={13} /> Des compétences transférables
                </span>
                <ArrowUpRight size={17} />
              </div>
            </Card>
            <div className="floating-label label-bottom">
              <span className="mini-icon green">
                <TrendingUp size={18} />
              </span>
              <div>
                <strong>Un cap. Un plan. Votre avenir.</strong>
                <small>Chaque étape vous rapproche de votre projet.</small>
              </div>
            </div>
            <span className="visual-caption">
              Illustration d’un parcours · résultats simulés
            </span>
          </div>
        </div>
      </section>
      <section className="stats-strip" aria-label="Chiffres de démonstration">
        <div>
          <strong>
            8 000<span>+</span>
          </strong>
          <p>profils analysés</p>
        </div>
        <span className="stat-divider" />
        <div>
          <strong>
            250<span>+</span>
          </strong>
          <p>métiers référencés</p>
        </div>
        <span className="stat-divider" />
        <div>
          <strong>
            1 500<span>+</span>
          </strong>
          <p>formations recommandées</p>
        </div>
        <span className="stats-note">
          Chiffres illustratifs
          <br />
          de démonstration
        </span>
      </section>
      <section className="how-section" id="comment-ca-marche">
        <div className="section-intro">
          <span className="eyebrow">AVANCER, EN CONFIANCE</span>
          <h2>
            Un changement de voie.
            <br />
            Des étapes pour y voir clair.
          </h2>
          <p>
            Vous n’avez pas besoin d’avoir toutes les réponses.
            <br />
            Nous vous aidons à poser les bonnes questions.
          </p>
        </div>
        <div className="how-grid">
          {[
            {
              icon: Compass,
              n: "01",
              title: "Faites le point sur vous",
              text: "Votre parcours, vos envies et vos compétences : tout commence par ce qui vous rend unique.",
            },
            {
              icon: Target,
              n: "02",
              title: "Explorez vos possibilités",
              text: "Découvrez des métiers et comprenez les compétences qui vous en rapprochent.",
            },
            {
              icon: Route,
              n: "03",
              title: "Tracez votre chemin",
              text: "Une feuille de route concrète et des formations pour avancer vers votre objectif.",
            },
          ].map((item) => (
            <Card className="how-card" key={item.n}>
              <div>
                <span className="soft-icon">
                  <item.icon size={24} />
                </span>
                <span className="how-number">{item.n}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="reassurance">
        <div className="reassurance-icon">
          <Heart size={25} />
        </div>
        <div>
          <h2>Changer de voie, sans avancer seul.</h2>
          <p>
            Virage vous aide à préparer votre réflexion. Un conseiller peut vous
            accompagner pour la concrétiser.
          </p>
        </div>
        <Button variant="outline" onClick={start}>
          Trouver ma prochaine voie
          <ArrowRight size={16} />
        </Button>
      </section>
    </main>
  );
}

function ProfileStep() {
  const { state, update, cvFile, setCvFile } = useVirage();
  const { user } = useAccount();
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const acceptFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setError("Choisissez un fichier PDF ou DOCX.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier doit faire moins de 10 Mo.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const path = await uploadCv(user.id, file);
      setCvFile(file);
      update({ cv: file.name, cvStoragePath: path });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `Le CV n’a pas pu être enregistré : ${caught.message}`
          : "Le CV n’a pas pu être enregistré.",
      );
    } finally {
      setUploading(false);
    }
  };
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    acceptFile(e.dataTransfer.files[0]);
  };
  const valid = Boolean(
    state.job.trim() && state.region && state.education && !uploading,
  );
  return (
    <>
      <Heading
        eyebrow="ÉTAPE 01 · FAISONS CONNAISSANCE"
        title="Parlons de votre parcours"
        description="Chaque expérience compte. Commençons par la vôtre pour explorer de nouvelles possibilités."
      />
      <div className="content-grid">
        <form
          id="profile-form"
          className="card form-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) update({ step: 1, maxStep: Math.max(state.maxStep, 1) });
          }}
        >
          <div className="section-title">
            <h2>Votre profil professionnel</h2>
            <span className="muted small">* Champs obligatoires</span>
          </div>
          <label className="field-label" htmlFor="cv">
            Votre CV <span className="muted small">(facultatif)</span>
          </label>
          <div
            className={`upload-zone ${drag ? "dragging" : ""} ${state.cv ? "has-file" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={drop}
          >
            <input
              ref={input}
              id="cv"
              type="file"
              accept=".pdf,.docx"
              disabled={uploading}
              onChange={(e) => acceptFile(e.target.files?.[0])}
              className="sr-only"
            />
            <span className="upload-icon">
              {state.cv ? <FileText size={24} /> : <UploadCloud size={26} />}
            </span>
            {state.cv ? (
              <>
                <strong className="file-name">{state.cv}</strong>
                <span>
                  {uploading
                    ? "Enregistrement sécurisé…"
                    : cvFile
                      ? "Enregistré dans votre espace privé"
                      : "Récupération du CV enregistré…"}
                </span>
                <button
                  type="button"
                  className="text-link"
                  onClick={async () => {
                    if (state.cvStoragePath) {
                      try {
                        await deleteCv(state.cvStoragePath);
                      } catch (caught) {
                        setError(
                          caught instanceof Error
                            ? `Le CV n’a pas pu être supprimé : ${caught.message}`
                            : "Le CV n’a pas pu être supprimé.",
                        );
                        return;
                      }
                    }
                    update({ cv: "", cvStoragePath: "" });
                    setCvFile(null);
                    if (input.current) input.current.value = "";
                  }}
                >
                  Supprimer mon CV
                  <X size={13} />
                </button>
              </>
            ) : (
              <>
                <strong>
                  Glissez votre CV ici, ou{" "}
                  <button type="button" onClick={() => input.current?.click()}>
                    parcourir les fichiers
                  </button>
                </strong>
                <span>PDF ou DOCX · 10 Mo maximum</span>
              </>
            )}
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <p className="upload-note">
            <LockKeyhole size={12} /> Sans CV, l’analyse s’appuie sur les
            informations de votre profil. Si vous le joignez, il est conservé
            dans votre espace privé jusqu’à sa suppression par vos soins.
          </p>
          <div className="form-fields">
            <div className="field full">
              <label htmlFor="job">
                Métier actuel ou dernier métier exercé *
              </label>
              <div className="input-icon">
                <BriefcaseBusiness size={17} />
                <input
                  id="job"
                  required
                  maxLength={100}
                  value={state.job}
                  onChange={(e) => update({ job: e.target.value })}
                  placeholder="Ex. : Conseiller Assurance"
                  autoComplete="organization-title"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="region">Région recherchée *</label>
              <select
                required
                id="region"
                value={state.region}
                onChange={(e) => update({ region: e.target.value })}
              >
                <option value="">Sélectionner une région</option>
                {[
                  "Auvergne-Rhône-Alpes",
                  "Bourgogne-Franche-Comté",
                  "Bretagne",
                  "Centre-Val de Loire",
                  "Corse",
                  "Grand Est",
                  "Hauts-de-France",
                  "Île-de-France",
                  "Normandie",
                  "Nouvelle-Aquitaine",
                  "Occitanie",
                  "Pays de la Loire",
                  "Provence-Alpes-Côte d’Azur",
                  "Guadeloupe",
                  "Martinique",
                  "Guyane",
                  "La Réunion",
                  "Mayotte",
                  "Toute la France",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="education">Niveau d’études *</label>
              <select
                required
                id="education"
                value={state.education}
                onChange={(e) => update({ education: e.target.value })}
              >
                <option value="">Sélectionner un niveau</option>
                {[
                  "Sans diplôme",
                  "CAP / BEP",
                  "Baccalauréat",
                  "Bac +2",
                  "Bac +3",
                  "Bac +5 et plus",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <fieldset className="full remote">
              <legend>Télétravail recherché</legend>
              <div>
                {["Oui", "Non", "Sans importance"].map((v) => (
                  <label
                    className={
                      state.remote === v
                        ? "radio-option checked"
                        : "radio-option"
                    }
                    key={v}
                  >
                    <input
                      type="radio"
                      name="remote"
                      value={v}
                      checked={state.remote === v}
                      onChange={() => update({ remote: v })}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </form>
        <div>
          <Advice
            title="Votre prochain chapitre commence par vous."
            description="Vous avez déjà des compétences précieuses. Notre rôle : vous aider à voir où elles peuvent vous mener."
            items={[
              "Identifiez vos compétences transférables",
              "Découvrez des métiers qui vous ressemblent",
              "Construisez un projet concret",
            ]}
          />
          <div className="privacy-card">
            <ShieldCheck size={22} />
            <div>
              <strong>Votre confiance est essentielle</strong>
              <p>
                Vos réponses, résultats et CV sont associés à votre compte et
                accessibles depuis vos appareils.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bottom-nav">
        <span className="muted small">
          <Clock3 size={15} /> Environ 5 minutes pour explorer vos possibilités
        </span>
        <Button form="profile-form" type="submit" disabled={uploading}>
          {uploading ? "Enregistrement du CV…" : "Continuer"}
          <ArrowRight size={17} />
        </Button>
      </div>
    </>
  );
}

function Advice({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <Card className="advice-card">
      <span className="advice-symbol">
        <Compass size={28} />
      </span>
      <span className="eyebrow">UN NOUVEAU REGARD SUR VOTRE AVENIR</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="advice-divider" />
      <ul>
        {items.map((item) => (
          <li key={item}>
            <CheckCircle2 size={17} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="advice-foot">
        <span className="little-avatars">
          <i>AM</i>
          <i>JL</i>
          <i>SC</i>
        </span>
        <span>
          Chaque parcours est unique.
          <br />
          <strong>Le vôtre aussi.</strong>
        </span>
      </div>
    </Card>
  );
}
function BottomNav({
  back,
  next,
  label = "Continuer",
  disabled = false,
  note,
  icon,
}: {
  back: () => void;
  next?: () => void;
  label?: string;
  disabled?: boolean;
  note?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bottom-nav">
      <Button variant="ghost" onClick={back}>
        <ArrowLeft size={16} /> Étape précédente
      </Button>
      <div className="next-action">
        {disabled && note && <span className="small muted">{note}</span>}
        {next && (
          <Button disabled={disabled} onClick={next}>
            {label}
            {icon || <ArrowRight size={17} />}
          </Button>
        )}
      </div>
    </div>
  );
}
const loadingMessages = [
  "Analyse du CV…",
  "Identification des compétences…",
  "Analyse des expériences professionnelles…",
  "Détection des aptitudes transférables…",
  "Identification des centres d’intérêt…",
  "Recherche des métiers compatibles…",
  "Calcul des scores de compatibilité…",
  "Génération de recommandations…",
];
function AnalysisLoading() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setProgress((p) => Math.min(90, p + 1)),
      120,
    );
    return () => clearInterval(timer);
  }, []);
  const index = Math.min(7, Math.floor(progress / 12.6));
  return (
    <Card className="loading-card">
      <div className="loading-orbit">
        <Sparkles size={35} />
      </div>
      <Badge>VOTRE AVENIR PREND FORME</Badge>
      <h1>
        Relions vos talents
        <br />à de nouvelles possibilités.
      </h1>
      <p>Nous préparons vos recommandations personnalisées.</p>
      <div className="loading-status" role="status" aria-live="polite">
        <span>{loadingMessages[index]}</span>
        <strong>{progress}%</strong>
      </div>
      <Progress value={progress} label="Progression de l’analyse" />
      <div className="loading-checks">
        {loadingMessages
          .slice(0, index)
          .slice(-3)
          .map((m) => (
            <span key={m}>
              <CheckCircle2 size={14} />
              {m.replace("…", "")}
            </span>
          ))}
      </div>
      <span className="muted small">
        <ShieldCheck size={14} /> Analyse en cours via le backend et n8n.
      </span>
    </Card>
  );
}
function CourseCard({ course }: { course: Training }) {
  return (
    <Card className="course-card">
      <div className="course-provider">
        <span className="provider-logo purple">
          {course.organization.slice(0, 3).toUpperCase()}
        </span>
        <Badge>Formation</Badge>
      </div>
      <h2>{course.title}</h2>
      <p className="provider-name">{course.organization}</p>
      <div className="course-meta">
        <span>
          <Clock3 size={15} />
          {course.duration}
        </span>
        <span>
          <GraduationCap size={16} />
          {course.level}
        </span>
      </div>
      {course.url && (
        <Button asChild variant="outline">
          <a href={course.url} target="_blank" rel="noreferrer">
            Consulter
            <ExternalLink size={15} />
          </a>
        </Button>
      )}
    </Card>
  );
}

async function downloadReport(state: Profile, job: SelectedJob) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 25;
  const text = (value: string, size = 11) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(
      value.replace(/[œ]/g, "oe").replace(/[’]/g, "'"),
      172,
    );
    for (const line of lines) {
      if (y > 275) {
        doc.addPage();
        y = 22;
      }
      doc.text(line, 19, y);
      y += size * 0.5 + 2;
    }
    y += 3;
  };
  doc.setTextColor(37, 99, 235);
  text("virage. — Votre projet professionnel", 23);
  doc.setTextColor(55, 65, 81);
  text(`Rapport Pivot AI · ${new Date().toLocaleDateString("fr-FR")}`);
  text("PROFIL", 14);
  text(`${state.job} | ${state.region} | ${state.education}`);
  text(`Teletravail : ${state.remote} | CV : ${state.cv || "Non fourni"}`);
  text(`Centres d'interet : ${state.interests.join(", ")}`);
  text(
    `Preferences : equipe ${state.team}%, bureau ${state.office}%, technique ${state.technical}%, relationnel ${state.relational}%.`,
  );
  text(
    `Management : ${state.management ? "oui" : "non"} | Deplacements : ${state.travel ? "oui" : "non"} | Autonomie : ${state.autonomy ? "oui" : "non"}`,
  );
  text("METIER CIBLE", 14);
  text(`${job.title} — Compatibilite : ${job.score}%`);
  text(job.reason);
  text(`Forces : ${job.existingSkills.join(", ")}`);
  text(`Competences a acquerir : ${job.skills.join(", ")}`);
  text(`PLAN D'ACTION — ${job.duration}`, 14);
  job.roadmap.forEach((step) =>
    text(`Mois ${step.month} : ${step.objectives.join(", ")}`),
  );
  text("FORMATIONS A EXPLORER", 14);
  job.trainings.forEach((training) => {
    text(
      `${training.title} — ${training.organization} | ${training.duration} | ${training.level}`,
    );
    if (training.url) text(training.url, 9);
  });
  text(
    "Ces recommandations sont indicatives et ne constituent pas un bilan de competences. Verifiez les formations, conditions et financements avec un conseiller.",
    9,
  );
  doc.save("Virage-mon-projet-professionnel.pdf");
}
function Dashboard({
  state,
  job,
  edit,
  restart,
}: {
  state: Profile;
  job: SelectedJob;
  edit: (step: number) => void;
  restart: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const preferences = state.profileAnalysis?.preferences;
  return (
    <div className="enter">
      <Heading
        eyebrow="VOTRE NOUVEAU CHAPITRE"
        title="Votre projet professionnel"
        description="Vous avez fait le premier pas. Voici les repères pour donner vie à votre nouvelle voie."
      />
      <Card className="dashboard-hero">
        <div>
          <Badge>
            <CheckCircle2 size={13} /> Projet prêt à explorer
          </Badge>
          <h2>{job.title}</h2>
          <p>
            {job.duration} pour construire les compétences de votre prochain métier.
          </p>
        </div>
        <div className="dashboard-score">
          <strong>
            {job.score}
            <small>%</small>
          </strong>
          <span>de compatibilité</span>
        </div>
      </Card>
      <div className="dashboard-grid">
        <Card className="form-card">
          <div className="section-title">
            <h2>
              <BriefcaseBusiness size={19} /> Profil analysé
            </h2>
            <button className="text-link" onClick={() => edit(0)}>
              Modifier
            </button>
          </div>
          <dl className="profile-summary">
            <div>
              <dt>Métier actuel</dt>
              <dd>{state.job}</dd>
            </div>
            <div>
              <dt>Région</dt>
              <dd>{state.profileAnalysis?.region || state.region}</dd>
            </div>
            <div>
              <dt>Niveau d’études</dt>
              <dd>{state.education}</dd>
            </div>
            <div>
              <dt>Télétravail</dt>
              <dd>{state.remote}</dd>
            </div>
            <div>
              <dt>CV</dt>
              <dd>{state.cv || "Non fourni"}</dd>
            </div>
          </dl>
          {state.profileAnalysis && (
            <p className="muted small">{state.profileAnalysis.profileSummary}</p>
          )}
          <div className="section-title">
            <h3>Centres d’intérêt</h3>
            <button className="text-link" onClick={() => edit(1)}>
              Modifier
            </button>
          </div>
          <div className="job-tags">
            {(state.profileAnalysis?.hobbies ?? state.interests).map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
          <div className="section-title">
            <h3>Environnement de travail souhaité</h3>
            <button className="text-link" onClick={() => edit(2)}>
              Modifier
            </button>
          </div>
          <dl className="profile-summary">
            <div>
              <dt>Mode de collaboration</dt>
              <dd>
                {preferences?.team ?? state.team}% équipe ·{" "}
                {100 - (preferences?.team ?? state.team)}% individuel
              </dd>
            </div>
            <div>
              <dt>Lieu de travail</dt>
              <dd>
                {preferences?.office ?? state.office}% bureau ·{" "}
                {100 - (preferences?.office ?? state.office)}% terrain
              </dd>
            </div>
            <div>
              <dt>Orientation technique</dt>
              <dd>{preferences?.technical ?? state.technical}%</dd>
            </div>
            <div>
              <dt>Orientation relationnelle</dt>
              <dd>{preferences?.relational ?? state.relational}%</dd>
            </div>
            <div>
              <dt>Management d’équipe</dt>
              <dd>
                {(preferences?.management ?? state.management) ? "Oui" : "Non"}
              </dd>
            </div>
            <div>
              <dt>Déplacements fréquents</dt>
              <dd>{(preferences?.travel ?? state.travel) ? "Oui" : "Non"}</dd>
            </div>
            <div>
              <dt>Autonomie importante</dt>
              <dd>{(preferences?.autonomy ?? state.autonomy) ? "Oui" : "Non"}</dd>
            </div>
          </dl>
        </Card>
        <Card className="form-card">
          <h2>
            <Target size={19} /> Vos atouts pour ce métier
          </h2>
          <p className="muted small">{job.reason}</p>
          <h3 className="green">Forces</h3>
          <div className="job-tags">
            {job.existingSkills.map((s) => (
              <Badge className="badge-green" key={s}>
                <Check size={12} />
                {s}
              </Badge>
            ))}
          </div>
          <h3 className="orange">Compétences à acquérir</h3>
          <div className="job-tags">
            {job.skills.map((s) => (
              <Badge className="badge-orange" key={s}>
                {s}
              </Badge>
            ))}
          </div>
        </Card>
        <Card className="form-card">
          <div className="section-title">
            <h2>
              <Route size={19} /> Plan d’action
            </h2>
            <button className="text-link" onClick={() => edit(5)}>
              Voir le parcours
            </button>
          </div>
          {job.roadmap.map((step) => (
            <div className="summary-month" key={step.month}>
              <span>M{step.month}</span>
              <p>{step.objectives.join(" · ")}</p>
            </div>
          ))}
        </Card>
        <Card className="form-card">
          <div className="section-title">
            <h2>
              <GraduationCap size={19} /> Formations à explorer
            </h2>
            <button className="text-link" onClick={() => edit(6)}>
              Tout voir
            </button>
          </div>
          {job.trainings.map((training) => (
            <a
              className="summary-course"
              key={`${training.title}-${training.organization}`}
              href={training.url || undefined}
              target="_blank"
              rel="noreferrer"
            >
              <span className="provider-logo purple">
                {training.organization.slice(0, 3).toUpperCase()}
              </span>
              <div>
                <strong>{training.title}</strong>
                <span>
                  {training.organization} · {training.duration}
                </span>
              </div>
              {training.url && <ExternalLink size={15} />}
            </a>
          ))}
        </Card>
      </div>
      <div className="dashboard-actions">
        <Button
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            setError("");
            try {
              await downloadReport(state, job);
            } catch {
              setError("Le téléchargement a échoué. Veuillez réessayer.");
            } finally {
              setExporting(false);
            }
          }}
        >
          <Download size={17} />
          {exporting
            ? "Préparation du rapport…"
            : "Télécharger mon rapport PDF"}
        </Button>
        <Button variant="outline" onClick={restart}>
          <RotateCcw size={16} /> Recommencer une analyse
        </Button>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="demo-note">
        <ShieldCheck size={16} /> Ces recommandations sont indicatives.
        Échangez avec un conseiller en évolution professionnelle pour
        concrétiser votre projet.
      </div>
    </div>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [close]);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="modal card"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button className="modal-close" aria-label="Fermer" onClick={close}>
          <X size={20} />
        </button>
        <span className="soft-icon">
          <Compass size={25} />
        </span>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
