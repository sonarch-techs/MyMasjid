import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') || '/dashboard';

  // Log explicit OAuth errors from Supabase GoTrue if present
  if (error) {
    console.error('Supabase Auth Callback Error:', {
      error,
      errorDescription,
    });
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role || 'user';
      let destination = `${origin}/dashboard`;

      if (role === 'admin') {
        destination = `${origin}/admin/dashboard`;
      } else if (role === 'staff') {
        destination = `${origin}/staff/dashboard`;
      }

      response.headers.set('Location', destination);
      return response;
    } else if (exchangeError) {
      console.error('Code exchange failed:', exchangeError.message);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}