import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Gift, Users, FileText, MessageSquare } from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/admin", icon: LayoutGrid },
    { name: "Donations", path: "/admin/donations", icon: Gift, activeColor: "text-emerald-600" },
    { name: "Users", path: "/admin/users", icon: Users, activeColor: "text-blue-600" },
    { name: "Reports", path: "/admin/reports", icon: FileText, activeColor: "text-purple-600" },
    { name: "Feedbacks", path: "/admin/feedbacks", icon: MessageSquare, activeColor: "text-purple-600" },
  ];

  return (
    <div className="flex gap-2 bg-slate-200 p-1.5 rounded-xl border border-slate-300 w-full md:w-auto overflow-x-auto shadow-sm">
      {menus.map((menu) => {
        const Icon = menu.icon;
        const isActive = location.pathname === menu.path;

        return (
          <Link
            key={menu.path}
            to={menu.path}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              isActive
                ? "bg-slate-800 text-white"
                : "text-slate-700 hover:bg-white/60 font-medium"
            }`}
          >
            <Icon size={16} className={!isActive && menu.activeColor ? menu.activeColor : ""} />
            <span>{menu.name}</span>
          </Link>
        );
      })}
    </div>
  );
}