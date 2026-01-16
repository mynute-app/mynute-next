// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./auth";

const LOGIN_ROUTES = new Set(["/auth/employee", "/auth/login"]);

export const middleware = auth((req) => {
  if (req.auth && LOGIN_ROUTES.has(req.nextUrl.pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
