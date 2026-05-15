import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Share URLs encode PII (name, lat/lon, birth time) in `?c=base64`. We don't
// want search engines to index them, and we don't want the path leaking to
// outbound links via Referer. This wraps any response to a URL carrying `c=`
// with the strictest possible metadata + referrer policy. The page itself
// stays public for whoever has the link.
function hardenShareUrls(req: NextRequest, res: NextResponse): NextResponse {
  if (req.nextUrl.searchParams.has("c")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Referrer-Policy", "no-referrer");
  }
  return res;
}

export async function middleware(request: NextRequest) {
  let response: NextResponse;
  // Skip Supabase session refresh if env vars are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    response = NextResponse.next();
  } else {
    response = await updateSession(request);
  }
  return hardenShareUrls(request, response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
