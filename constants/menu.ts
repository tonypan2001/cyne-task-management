import { CheckCircle2, LayoutDashboard, PlusSquare } from "lucide-react";

export const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'สร้างงานใหม่', path: '/create', icon: PlusSquare },
    { name: 'งานที่เสร็จแล้ว', path: '/completed', icon: CheckCircle2 },
]