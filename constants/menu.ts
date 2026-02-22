import { CheckCircle2, LayoutDashboard, PlusSquare, Users } from "lucide-react";

export const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Task', path: '/create', icon: PlusSquare },
    { name: 'Completed', path: '/completed', icon: CheckCircle2 }, // หรือคงไว้เป็น 'Completed Task' ก็ได้
    { name: 'Team', path: '/team', icon: Users }, // ✨ เปลี่ยนไอคอนเป็น Users 
]