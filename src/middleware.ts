import type { NextRequest } from "next/server";
import { refreshToken } from "./components/Utils/Auth";

export async function middleware(request: NextRequest) {
  return await refreshToken(request);
}

export const config = {
  matcher: ["/dashboard", "/users", "/roles", "/guestBook"],
};
