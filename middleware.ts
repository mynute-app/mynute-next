import { auth } from "./auth";

export default auth(req => {
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    console.log("Redirecting to login");
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});
