import React from "react";
import { Building, BookOpen, Archive, CalendarRange } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminDashboardPage = () => {
  const museum = {
    name: "National Museum of India",
    location: "New Delhi",
    exhibitionsCount: 5,
    artifactsCount: 120,
    quizzesCount: 8,
    visitsThisMonth: 1245,
  };

  const statCards = [
    {
      title: "Exhibitions",
      count: museum.exhibitionsCount,
      desc: "Active and upcoming",
      icon: <CalendarRange className="w-4 h-4 text-gray-500" />,
      link: "/admin/exhibitions",
    },
    {
      title: "Artifacts",
      count: museum.artifactsCount,
      desc: "Total artifacts",
      icon: <Archive className="w-4 h-4 text-gray-500" />,
      link: "/admin/artifacts",
    },
    {
      title: "Quizzes",
      count: museum.quizzesCount,
      desc: "Active quizzes",
      icon: <BookOpen className="w-4 h-4 text-gray-500" />,
      link: "/admin/quizzes",
    },
    {
      title: "Visits",
      count: museum.visitsThisMonth,
      desc: "This month",
      icon: <Building className="w-4 h-4 text-gray-500" />,
      link: null,
    },
  ];

  const activities = [
    { title: "New exhibition added: Ancient Civilizations", time: "2 hours ago" },
    { title: "Quiz updated: Indian Heritage Quiz", time: "5 hours ago" },
    { title: "New artifact added: Indus Valley Seal", time: "Yesterday" },
    { title: "Museum details updated", time: "2 days ago" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="border border-orange-500/20 rounded-lg bg-white p-6 mb-6">
        <div className="text-xl font-semibold">{museum.name}</div>
        <div className="text-gray-500 mb-2">{museum.location}</div>
        <p className="text-sm mb-4">
          Welcome to your museum dashboard. Manage your museum details,
          exhibitions, artifacts, and quizzes.
        </p>
        <div className="mt-4">
          <Link to="/admin/museum-details">
            <button className="border border-gray-300 rounded px-4 py-2 text-sm hover:bg-orange-100">
              Edit Museum Details
            </button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item, idx) => (
            <div
              key={idx}
              className="border rounded-lg bg-white p-6 flex flex-col justify-between"
            >
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium">{item.title}</span>
                {item.icon}
              </div>
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">{item.desc}</p>
                {item.link && (
                  <Link to={item.link}>
                    <button className="text-orange-500 text-xs font-medium hover:underline">
                      Manage
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg bg-white p-6">
            <div className="mb-4">
              <span className="text-lg font-semibold">Recent Activity</span>
              <div className="text-sm text-gray-500">
                Latest actions in your museum
              </div>
            </div>
            {activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 mb-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border rounded-lg bg-white p-6">
            <div className="mb-4">
              <span className="text-lg font-semibold">Quick Actions</span>
              <div className="text-sm text-gray-500">
                Common tasks for museum management
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/exhibitions/new">
                <button className="border rounded px-4 py-2 w-full flex items-center gap-2 hover:bg-orange-100">
                  <CalendarRange className="mr-2 h-4 w-4" />Add Exhibition
                </button>
              </Link>
              <Link to="/admin/artifacts/new">
                <button className="border rounded px-4 py-2 w-full flex items-center gap-2 hover:bg-orange-100">
                  <Archive className="mr-2 h-4 w-4" />Add Artifact
                </button>
              </Link>
              <Link to="/admin/quizzes/new">
                <button className="border rounded px-4 py-2 w-full flex items-center gap-2 hover:bg-orange-100">
                  <BookOpen className="mr-2 h-4 w-4" />Create Quiz
                </button>
              </Link>
              <Link to="/admin/museum-details">
                <button className="border rounded px-4 py-2 w-full flex items-center gap-2 hover:bg-orange-100">
                  <Building className="mr-2 h-4 w-4" />Update Museum
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};