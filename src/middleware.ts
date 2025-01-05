import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Extract IP address from the request
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split("ffff:")[1] || "Unknown IP";

  console.log({ ipAddress });

  // Get the current timestamp

  // Log details

  const redirectUrl = new URL("/api/log", request.url);

  redirectUrl.searchParams.set("ip", ipAddress);
  redirectUrl.searchParams.set("route", request.nextUrl.pathname);

  try {
    console.log({ redirectUrl: redirectUrl.toString() });
    await axios.get(redirectUrl.toString());
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);
  }

  // Proceed with the request
  return NextResponse.next();
}

// Define the routes this middleware applies to
export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"], // Adjust paths as necessary
};