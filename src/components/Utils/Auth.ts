import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { JwtPayload } from "jsonwebtoken";
import { IUserRole } from "../Pages/IInterfaces";
import { Roles } from "@prisma/client";
import { useMemo } from "react";
import { useUser } from "./UserContext";

const secretKey = new TextEncoder().encode(
  process.env.APP_AUTH_KEY || "secretcode"
);

export async function encrypt(payload: JwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);
}

export async function decrypt(params: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(params, secretKey, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function signIn(user: IUserRole) {
  const expires = new Date(Date.now() + 3600 * 1000);
  const session = await encrypt({ user, expires });

  (await cookies()).set("session", session, { expires });
}

export async function signOut() {
  (await cookies()).set("session", "", { expires: new Date(0) });
}
export async function getSession(): Promise<JwtPayload | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  const result: JwtPayload = await decrypt(session);
  return result;
}

export async function refreshToken(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.redirect(new URL("/", request.url));
  const payload = await getSession();
  if (!payload) return NextResponse.redirect(new URL("/", request.url));

  const pathname = request.nextUrl.pathname;
  const access = hasAccess(payload.user.Roles, pathname, "read");
  if (!access) return NextResponse.redirect(new URL("/dashboard", request.url));

  const parsed = await decrypt(session);
  // parsed.expires = new Date(Date.now() + 3600 * 1000 * 5); // Versi Perjam (5 Jam)
  // parsed.expires = new Date(Date.now() + 5 * 60 * 1000); // Versi Permenit (5 Menit)
  // Ambil durasi dan threshold dari env
  const refreshMinutes = Number(process.env.SESSION_REFRESH_MINUTES) || 60;
  const thresholdSeconds =
    Number(process.env.SESSION_THRESHOLD_SECONDS) || 60 * 60 * 30;

  // Hitung sisa waktu
  const timeRemaining = new Date(parsed.expires).getTime() - Date.now();

  // Kalau sisa < threshold → perpanjang refreshMinutes menit
  let shouldRefresh = false;
  if (timeRemaining < thresholdSeconds * 1000) {
    parsed.expires = new Date(Date.now() + refreshMinutes * 60 * 1000);
    shouldRefresh = true;
  }

  let res: NextResponse;
  // Jika di halaman root "/" dan ada session → redirect ke /dashboard
  if (request.nextUrl.pathname === "/") {
    res = NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    res = NextResponse.next();
  }
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    expires: new Date(parsed.expires),
  });
  return res;
}

// export async function logActivity(
//   req: NextRequest,
//   name: string,
//   method: string,
//   table: string,
//   sendData: string,
//   returnStatus: string,
//   detail: string,
//   userId?: number
// ) {
//   try {
//     const ip = req.headers.get("x-forwarded-for") || "unknown";
//     const userAgent = req.headers.get("user-agent") || "unknown";
//     const session = await getSession();

//     await prisma.logs.create({
//       data: {
//         name,
//         method,
//         table,
//         path: req.nextUrl.pathname,
//         serverIP: ip,
//         userAgent: userAgent,
//         sendData,
//         returnStatus,
//         detail,
//         userId: userId ? userId : session ? session.user.id : null,
//       },
//     });
//   } catch (error) {
//     console.error("Failed to log activity:", error);
//   }
// }

export function getUserAccess(role: Roles, path: string): string[] {
  try {
    const permissions: { path: string; access: string[] }[] = JSON.parse(
      role.permissions || "[]"
    );

    const found = permissions.find((p) => p.path === path);
    return found ? found.access : [];
  } catch {
    return [];
  }
}
export function hasAccess(role: Roles, path: string, action: string): boolean {
  return getUserAccess(role, path).includes(action);
}

export function useAccess(path: string) {
  const user = useUser();
  // if (!user) return { access: [], hasAccess: (action: string) => false };
  const role = user?.Roles ?? null;

  const access = useMemo(() => {
    if (!role) return [];
    return getUserAccess(role, path);
  }, [role, path]);

  const hasAccess = useMemo(
    () => (action: string) => access.includes(action),
    [access]
  );

  return { user, access, hasAccess };
}
