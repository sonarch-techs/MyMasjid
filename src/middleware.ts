import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 1. Guard protected dashboards from unauthenticated users
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/staff/dashboard') || pathname.startsWith('/admin/dashboard'))) {
    const loginTarget = pathname.startsWith('/staff') ? '/staff-login' : '/login';
    const redirectUrl = new URL(loginTarget, request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Resolve Role (Check JWT app_metadata/user_metadata first, fallback to DB)
  if (user) {
    let role: string = 
      (user.app_metadata?.role as string) || 
      (user.user_metadata?.role as string) || 
      '';

    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      role = profile?.role || 'user';
    }

    // Disallow non-admins from admin dashboard
    if (pathname.startsWith('/admin/dashboard') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Disallow non-staff from staff dashboard
    if (pathname.startsWith('/staff/dashboard') && role !== 'staff' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If an Admin hits the generic user dashboard root, forward them to the Admin command center
    if (pathname === '/dashboard' && role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // If Staff hits the generic user dashboard root, forward them to the Staff hub
    if (pathname === '/dashboard' && role === 'staff') {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/staff/dashboard/:path*', '/admin/dashboard/:path*'],
};