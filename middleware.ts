import { next } from "@vercel/functions";
import { readAdminSessionFromToken, SESSION_COOKIE_NAME } from "./api/_lib/auth.js";

function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const tokenPair = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!tokenPair) {
    return null;
  }

  const value = tokenPair.slice(SESSION_COOKIE_NAME.length + 1).trim();
  return value || null;
}

function isAuthenticated(request: Request): boolean {
  const token = readSessionCookie(request.headers.get("cookie"));
  if (!token) {
    return false;
  }

  return Boolean(readAdminSessionFromToken(token));
}

function browserRedirect(request: Request): Response {
  const url = new URL(request.url);
  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("redirect", `${url.pathname}${url.search}${url.hash}`);
  return Response.redirect(loginUrl, 302);
}

function apiUnauthorized(): Response {
  return new Response(JSON.stringify({ error: "Authentication required" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export default function middleware(request: Request): Response {
  const url = new URL(request.url);
  const { pathname } = url;

  if (!isAuthenticated(request)) {
    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/") ||
      pathname === "/gravity" ||
      pathname.startsWith("/gravity/") ||
      pathname === "/record" ||
      pathname.startsWith("/record/") ||
      pathname === "/agent-trainer/runtime" ||
      pathname.startsWith("/agent-trainer/runtime/") ||
      pathname === "/agent-trainer/control-plane" ||
      pathname.startsWith("/agent-trainer/control-plane/")
    ) {
      return browserRedirect(request);
    }

    if (
      pathname === "/api/session/dashboard" ||
      pathname === "/api/session/memory" ||
      pathname.startsWith("/api/trainer") ||
      pathname.startsWith("/api/workbook") ||
      pathname.startsWith("/api/agents") ||
      pathname.startsWith("/api/collaborators")
    ) {
      return apiUnauthorized();
    }
  }

  return next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/gravity",
    "/gravity/:path*",
    "/record",
    "/record/:path*",
    "/agent-trainer/runtime",
    "/agent-trainer/runtime/:path*",
    "/agent-trainer/control-plane",
    "/agent-trainer/control-plane/:path*",
    "/api/session/dashboard",
    "/api/session/dashboard/:path*",
    "/api/session/memory",
    "/api/session/memory/:path*",
    "/api/trainer",
    "/api/trainer/:path*",
    "/api/workbook",
    "/api/workbook/:path*",
    "/api/agents",
    "/api/agents/:path*",
    "/api/collaborators",
    "/api/collaborators/:path*",
  ],
};
