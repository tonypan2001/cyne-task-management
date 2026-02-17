import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // ✨ แก้ไขโดยการระบุค่าให้ชัดเจน ไม่ใช้ shorthand ที่มีปัญหาค่ะ
                    request.cookies.set({ name: name, value: value, ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name: name, value: value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    // ✨ สำหรับ remove เราจะตั้งค่า value เป็นค่าว่างค่ะ
                    request.cookies.set({ name: name, value: '', ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name: name, value: '', ...options })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // 1. ถ้ายังไม่ได้ Login และกำลังจะเข้าหน้าอื่นที่ไม่ใช่ /auth -> ส่งไป /auth
    if (!session && !request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. ถ้า Login แล้ว แต่ดันจะเข้าหน้า /auth -> ส่งกลับหน้าหลัก
    if (session && request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}