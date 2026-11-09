import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (middleware) proteksi:
 * - /admin (kecuali /admin/login) → wajib login, kalau tidak → redirect ke login
 * - /admin/login kalau sudah login → redirect ke /admin
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya proses route /admin (sudah difilter oleh matcher)
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Cek apakah user sudah login (validasi token dari cookie)
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const isLoginPage = pathname === "/admin/login";

  // Belum login & buka /admin → lempar ke halaman utama (menu)
  // (bukan ke halaman login — supaya tombol "kembali" pelanggan tidak nyangkut)
  if (!isLoggedIn && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Sudah login tapi buka halaman login → lempar ke dashboard admin
  if (isLoggedIn && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
