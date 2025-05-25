import React, { useState, useEffect } from "react";
import { Building, BookOpen, Archive, CalendarRange } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { getSupabase } from "../../supabase";

export const AdminDashboardPage = () => {
  const [userMuseum, setUserMuseum] = useState(null);
  const [museumStats, setMuseumStats] = useState({ exhibitions: 0, artifacts: 0, quizzes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // For redirecting if not logged in

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Supabase client not available.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please log in to view your dashboard.");
        setIsLoading(false);
        if (!user) navigate('/login'); // Redirect to login if no user
        return;
      }

      try {
        const { data: museum, error: museumError } = await supabase
          .from('museums')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (museumError) {
          console.error("Error fetching museum:", museumError);
          setError(`Failed to fetch museum data: ${museumError.message}`);
          setIsLoading(false);
          return;
        }

        setUserMuseum(museum); // Can be null if no museum

        if (museum) {
          // Fetch Aggregates
          let exhibitions = 0, artifacts = 0, quizzes = 0;

          const { count: exhibitionsCount, error: exError } = await supabase.from('exhibitions').select('id', { count: 'exact' }).eq('museum_id', museum.id);
          if (exError) console.error("Error fetching exhibitions count:", exError); else exhibitions = exhibitionsCount;

          const { count: artifactsCount, error: artError } = await supabase.from('artifacts').select('id', { count: 'exact' }).eq('museum_id', museum.id);
          if (artError) console.error("Error fetching artifacts count:", artError); else artifacts = artifactsCount;
          
          const { count: quizzesCount, error: qError } = await supabase.from('quizzes').select('id', { count: 'exact' }).eq('museum_id', museum.id);
          if (qError) console.error("Error fetching quizzes count:", qError); else quizzes = quizzesCount;

          setMuseumStats({ exhibitions, artifacts, quizzes });
        }
      } catch (e) { // Catch any unexpected error during the process
        console.error("Dashboard data fetching error:", e);
        setError("An unexpected error occurred while loading dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]); // Added navigate to dependency array

  const statCards = [
    {
      title: "Exhibitions",
      count: museumStats.exhibitions,
      desc: "Active and upcoming",
      icon: <CalendarRange className="w-4 h-4 text-gray-500" />,
      link: "/admin/exhibitions",
    },
    {
      title: "Artifacts",
      count: museumStats.artifacts,
      desc: "Total artifacts",
      icon: <Archive className="w-4 h-4 text-gray-500" />,
      link: "/admin/artifacts",
    },
    {
      title: "Quizzes",
      count: museumStats.quizzes,
      desc: "Active quizzes",
      icon: <BookOpen className="w-4 h-4 text-gray-500" />,
      link: "/admin/quizzes",
    },
    // {
    //   title: "Visits", // Example, can be removed or fetched if data exists
    //   count: 0, 
    //   desc: "This month",
    //   icon: <Building className="w-4 h-4 text-gray-500" />,
    //   link: null, 
    // },
  ];

  // Dummy activities, can be removed or replaced with real data later
  const activities = [
    { title: "New exhibition added: Ancient Civilizations", time: "2 hours ago" },
    { title: "Quiz updated: Indian Heritage Quiz", time: "5 hours ago" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
        <Building size={48} className="mb-4"/>
        <h2 className="text-2xl font-semibold">Error</h2>
        <p>{error}</p>
        {error.includes("log in") && 
            <Link to="/login" className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                Go to Login
            </Link>
        }
      </div>
    );
  }

  if (!userMuseum) {
    return (
      <div className="p-6 space-y-6 min-h-screen flex flex-col items-center justify-center text-center bg-gray-50">
        <Building size={48} className="mb-4 text-orange-500"/>
        <h1 className="text-3xl font-bold text-gray-800">Welcome, Museum Administrator!</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-md">
          You haven't set up your museum yet. Please create your museum to manage its details, exhibitions, artifacts, and quizzes.
        </p>
        <Link
          to="/admin/museum-details"
          className="mt-8 px-6 py-3 bg-orange-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-150"
        >
          Create Your Museum
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen"> {/* Standardized page padding */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-6 md:p-8 shadow-sm"> {/* Standardized container padding */}
        <div className="text-2xl font-semibold text-orange-600">{userMuseum.name}</div>
        <div className="text-gray-500 mb-3">{userMuseum.location}</div>
        <p className="text-sm text-gray-600 mb-4">
          Welcome to your museum dashboard. Manage your museum details,
          exhibitions, artifacts, and quizzes.
        </p>
        <div className="mt-4">
          <Link to="/admin/museum-details">
            <button className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Edit Museum Details
            </button>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid to 3 for main stats */}
          {statCards.map((item, idx) => (
            <div
              key={idx}
              className="border rounded-lg bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">{item.title}</span>
                {item.icon}
              </div>
              <div className="mt-3">
                <div className="text-3xl font-bold text-gray-800">{item.count}</div>
                <div className="flex justify-between items-center mt-1">
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
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Recent Activity - Can be kept as dummy or removed */}
          <div className="border rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4">
              <span className="text-lg font-semibold text-gray-800">Recent Activity</span>
              <div className="text-sm text-gray-500">
                Latest actions in your museum (dummy data)
              </div>
            </div>
            {activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
             {activities.length === 0 && <p className="text-sm text-gray-500">No recent activity.</p>}
          </div>

          <div className="border rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4">
              <span className="text-lg font-semibold text-gray-800">Quick Actions</span>
              <div className="text-sm text-gray-500">
                Common tasks for museum management
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin/exhibitions/new" className="block">
                <button className="w-full border rounded-md px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <CalendarRange className="h-4 w-4 text-orange-500" />Add Exhibition
                </button>
              </Link>
              <Link to="/admin/artifacts/new" className="block">
                <button className="w-full border rounded-md px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <Archive className="h-4 w-4 text-orange-500" />Add Artifact
                </button>
              </Link>
              <Link to="/admin/quizzes/new" className="block">
                <button className="w-full border rounded-md px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <BookOpen className="h-4 w-4 text-orange-500" />Create Quiz
                </button>
              </Link>
              <Link to="/admin/museum-details" className="block">
                <button className="w-full border rounded-md px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <Building className="h-4 w-4 text-orange-500" />Update Museum
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};