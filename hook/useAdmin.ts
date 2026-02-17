'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export const useAdmin = () => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            try {
                // ✨ ดึง User จาก Session ปัจจุบัน
                const { data: { user } } = await supabase.auth.getUser()

                // ✨ ดึง Email จาก .env (ตรวจสอบว่าชื่อตัวแปรตรงกับใน .env.local นะค๊ะ)
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

                if (user && user.email === adminEmail) {
                    setIsAdmin(true)
                } else {
                    setIsAdmin(false)
                }
            } catch (error) {
                console.error('Error checking admin status:', error)
            } finally {
                setLoading(false)
            }
        }

        checkUser()

        // 💡 เพิ่ม supabase.auth เข้าไปใน dependency array ตามที่มันแจ้งเตือนค่ะ
        // การใส่เข้าไปจะช่วยให้ถ้าสถานะการ Login เปลี่ยน (เช่น Logout แล้ว Login ใหม่ด้วยเมลอื่น) 
        // ตัว Hook นี้จะทำงานใหม่ทันทีเพื่อให้สิทธิ์ถูกต้องเสมอค๊ะ
    }, [supabase.auth])

    return { isAdmin, loading }
}