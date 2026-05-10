import { api } from "./client";
import type { AuthSessionResponse, Career7HealthResponse, Career7UserProfile } from "./types";

const SESSION_PATH = "/api/auth/session";
const CSRF_PATH = "/api/auth/csrf";
const SIGN_IN_PATH = "/api/auth/callback/credentials?json=true";
const SIGN_OUT_PATH = "/api/auth/signout?json=true";
const REGISTER_PATH = "/api/register";
const CAREER7_HEALTH_PATH = "/api/career7/health";

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = LoginInput & {
  name: string;
};

type CsrfResponse = {
  csrfToken: string;
};

type NextAuthActionResponse = {
  url?: string | null;
  ok?: boolean;
  error?: string | null;
  status?: number;
};

type RegisterResponse = {
  user: Career7UserProfile;
};

async function getCsrfToken() {
  const response = await api.get<CsrfResponse>(CSRF_PATH);
  return response.csrfToken;
}

function credentialsBody({
  csrfToken,
  email,
  password,
  callbackUrl,
}: LoginInput & { csrfToken: string; callbackUrl: string }) {
  return new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: "false",
    json: "true",
    callbackUrl,
  });
}

async function assertCareer7Session() {
  return api.get<Career7HealthResponse>(CAREER7_HEALTH_PATH);
}

export const sessionApi = {
  getSession: () => api.get<AuthSessionResponse>(SESSION_PATH),
  safeGetSession: () => api.safeGet<AuthSessionResponse>(SESSION_PATH),
  getCsrfToken,
  login: async ({ email, password }: LoginInput, callbackUrl = "/dashboard") => {
    const csrfToken = await getCsrfToken();
    const response = await api.formPost<NextAuthActionResponse>(
      SIGN_IN_PATH,
      credentialsBody({ csrfToken, email, password, callbackUrl }),
    );

    if (response.error) {
      throw new Error("Incorrect email or password. Please try again.");
    }

    await assertCareer7Session();
    return response;
  },
  signup: async ({ name, email, password }: SignupInput) => {
    await api.post<RegisterResponse>(REGISTER_PATH, {
      name,
      email,
      password,
      businessModel: "career7",
    });

    return sessionApi.login({ email, password }, "/onboarding");
  },
  logout: async () => {
    const csrfToken = await getCsrfToken();
    return api.formPost<NextAuthActionResponse>(
      SIGN_OUT_PATH,
      new URLSearchParams({
        csrfToken,
        redirect: "false",
        json: "true",
        callbackUrl: "/login",
      }),
    );
  },
};
