import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/admin/museum-details", icon: "apartment", label: "Museum Details" },
  { to: "/admin/exhibitions", icon: "event", label: "Exhibitions" },
  { to: "/admin/artifacts", icon: "inventory_2", label: "Artifacts" },
  { to: "/admin/quizzes", icon: "menu_book", label: "Quizzes" },
];

export default function AdminSidebar() {
  const location = useLocation();
  return (
    <aside className="bg-white border-r border-gray-200 min-h-screen w-60 flex flex-col">
      <div className="h-16 flex items-center px-6 text-xl font-bold text-orange-600">
        MuseMap <span className="text-xs text-gray-600 ml-1">Admin</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-4 py-2 rounded font-medium transition hover:bg-orange-50 text-gray-900 ${location.pathname === link.to ? 'bg-orange-50' : ''}`}
          >
            <span className="material-icons text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-8 flex flex-col gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 text-sm px-0 mt-2"
        >
          <span className="material-icons text-base">home</span>
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
