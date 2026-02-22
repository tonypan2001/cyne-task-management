import { CheckCircle2, LayoutDashboard, PlusSquare, User } from "lucide-react";

export const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Task', path: '/create', icon: PlusSquare },
    { name: 'Completed Task', path: '/completed', icon: CheckCircle2 },
    { name: 'Team', path: '/team', icon: User},
]