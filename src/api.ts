export type WorkPreferences = {
  education: string;
  remote: string;
  team: number;
  office: number;
  technical: number;
  relational: number;
  management: boolean;
  travel: boolean;
  autonomy: boolean;
};

export type ProfileAnalysisResponse = {
  technicalSkills: string[];
  softSkills: string[];
  transferableSkills: string[];
  profileSummary: string;
};

export type JobSuggestion = {
  name: string;
  score: number;
  description: string;
  reason: string;
};

export type JobMatchResponse = {
  jobs: JobSuggestion[];
};

export type RoadmapStep = {
  month: number;
  objectives: string[];
};

export type Training = {
  title: string;
  organization: string;
  duration: string;
  level: string;
  url: string;
};

export type JobAnalysisResponse = {
  compatibility: number;
  existingSkills: string[];
  missingSkills: string[];
  estimatedDuration: string;
  roadmap: RoadmapStep[];
  trainings: Training[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}${path}`, init);
  } catch {
    throw new Error("Impossible de joindre le backend. Vérifiez qu’il est démarré.");
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `Le backend a renvoyé une erreur (${response.status}).`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function analyzeProfile(
  cv: File,
  profile: {
    currentJob: string;
    region: string;
    hobbies: string[];
    preferences: WorkPreferences;
  },
) {
  const form = new FormData();
  form.append("cv", cv);
  form.append("currentJob", profile.currentJob);
  form.append("region", profile.region);
  profile.hobbies.forEach((hobby) => form.append("hobbies[]", hobby));
  Object.entries(profile.preferences).forEach(([key, value]) => {
    form.append(`preferences.${key}`, String(value));
  });

  return request<ProfileAnalysisResponse>("/api/profile/analyze", {
    method: "POST",
    body: form,
  });
}

export function matchJobs(profile: ProfileAnalysisResponse) {
  return request<JobMatchResponse>("/api/jobs/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}

export function analyzeJob(jobId: string, profile: ProfileAnalysisResponse) {
  return request<JobAnalysisResponse>(
    `/api/jobs/${encodeURIComponent(jobId)}/analysis`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    },
  );
}
