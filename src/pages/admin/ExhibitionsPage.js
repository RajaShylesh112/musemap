import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSupabase } from "../../supabase";

const ExhibitionsPage = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = getSupabase();

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("You must be logged in to view exhibitions.");
          return;
        }

        // First get the museum ID for the current user
        const { data: museumData, error: museumError } = await supabase
          .from('museums')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (museumError || !museumData) {
          throw new Error("Museum not found for current user");
        }

        // Then fetch exhibitions for that museum
        const { data: exhibitionsData, error: exhibitionsError } = await supabase
          .from('exhibitions')
          .select('*')
          .eq('museum_id', museumData.id)
          .order('start_date', { ascending: false });

        if (exhibitionsError) throw exhibitionsError;

        setExhibitions(exhibitionsData || []);
      } catch (err) {
        console.error("Error fetching exhibitions:", err);
        setError(err.message || "Failed to load exhibitions");
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [supabase]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getExhibitionStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today < start) return 'Upcoming';
    if (today > end) return 'Completed';
    return 'Ongoing';
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this exhibition?")) {
      try {
        const { error } = await supabase
          .from('exhibitions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Remove the deleted exhibition from state
        setExhibitions(exhibitions.filter(exhibition => exhibition.id !== id));
      } catch (err) {
        console.error("Error deleting exhibition:", err);
        alert("Failed to delete exhibition. Please try again.");
      }
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Exhibitions</h2>
        <Link to="/admin/exhibitions/new">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold shadow flex items-center gap-2">
            + Add Exhibition
          </button>
        </Link>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">
          Error: {error}
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}
      <div className="rounded-lg bg-white shadow p-6 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2">Title</th>
              <th>Dates</th>
              <th>Description</th>
              <th className="text-right">Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exhibitions.length > 0 ? (
              exhibitions.map((exhibition) => (
                <tr key={exhibition.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 font-medium">{exhibition.title}</td>
                  <td>
                    {formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}
                  </td>
                  <td className="truncate max-w-xs">{exhibition.description}</td>
                  <td className="text-right space-x-2">
                    <Link to={`/admin/exhibitions/edit/${exhibition.id}`} className="inline-block">
                      <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(exhibition.id)}
                      className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getExhibitionStatus(exhibition.start_date, exhibition.end_date) === 'Ongoing' 
                        ? 'bg-green-100 text-green-800' 
                        : getExhibitionStatus(exhibition.start_date, exhibition.end_date) === 'Upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getExhibitionStatus(exhibition.start_date, exhibition.end_date)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No exhibitions found. Click "Add Exhibition" to create one.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExhibitionsPage;
