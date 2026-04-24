import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  // Daftar halaman yang butuh login
  const protectedPaths = ['/history', '/payment', '/checkout'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (!token && isProtected) {
    // Redirect ke home sambil bawa pesan bahwa kita butuh login
    const url = new URL('/', request.url);
    url.searchParams.set('auth', 'true'); 
    return NextResponse.redirect(url);
  }
}