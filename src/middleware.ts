import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get("userRole")?.value

  const { pathname } = request.nextUrl

  const protectedPaths = ['/history', '/payment', '/checkout']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  
  if (!token && isProtected) {
    const url = new URL('/', request.url)
    url.searchParams.set('auth', 'true') 
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'ADMIN') {
      const url = new URL('/', request.url)
      url.searchParams.set('auth', 'true') 
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/history', '/payment', '/checkout', '/admin/:path*'],
}