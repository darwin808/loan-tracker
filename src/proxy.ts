import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session");
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/((?!auth/).*)"],
};
