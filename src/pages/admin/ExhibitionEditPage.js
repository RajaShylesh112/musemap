import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase"; 

const ExhibitionEditPage = () => {
  const { exhibitionId } = useParams();
  const navigate = useNavigate();
  const [museums, setMuseums] = useState([]); // State for museums
  const [exhibition, setExhibition] = useState({
    title: "",
    museum_id: "",
    start_date: "",
    end_date: "",
    description: "",
    status: "upcoming", // Default status
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Combined error state for fetching
  const [formMessage, setFormMessage] = useState(null);

  const supabase = getSupabase();

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      setLoading(true);
      setError(null);

      try {
        // Fetch museums
        const { data: museumsData, error: museumsError } = await supabase
          .from("museums")
          .select("id, name");
        
        if (museumsError) throw museumsError;
        setMuseums(museumsData || []);

        // Fetch exhibition (only if exhibitionId is present)
        if (exhibitionId) {
          const { data: exhibitionData, error: exhibitionError } = await supabase
            .from("exhibitions")
            .select("*")
            .eq("id", exhibitionId)
            .single();

          if (exhibitionError) throw exhibitionError;
          
          if (exhibitionData) {
            setExhibition({
              ...exhibitionData,
              start_date: exhibitionData.start_date || "",
              end_date: exhibitionData.end_date || "",
            });
          } else {
            setError("Exhibition not found."); // Specific error for exhibition
          }
        } else {
           // This case should ideally not happen if routing is correct for an edit page
          setError("Exhibition ID is missing.");
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exhibitionId, supabase]);

  const handleChange = (field, value) => {
    setExhibition({ ...exhibition, [field]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setFormMessage({ type: "error", text: "Supabase client not available." });
      return;
    }
    setLoading(true);
    setFormMessage(null);

    // Basic validation (can be expanded)
    if (!exhibition.title || !exhibition.museum_id || !exhibition.start_date || !exhibition.end_date || !exhibition.status) {
        setFormMessage({ type: "error", text: "Please fill in all required fields." });
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase
        .from("exhibitions")
        .update({
          museum_id: exhibition.museum_id,
          title: exhibition.title,
          start_date: exhibition.start_date,
          end_date: exhibition.end_date,
          description: exhibition.description,
          status: exhibition.status,
        })
        .eq("id", exhibitionId)
        .select(); // select() to get the updated row back

      if (error) throw error;
      
      setFormMessage({ type: "success", text: "Exhibition updated successfully!" });
      // Optionally, navigate away after a delay
      setTimeout(() => navigate("/admin/dashboard/exhibitions"), 2000);

    } catch (err) {
      console.error("Error updating exhibition:", err);
      setFormMessage({ type: "error", text: err.message || "Failed to update exhibition." });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !exhibition.title) return <div className="p-8 text-center">Loading exhibition details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!exhibition && !loading) return <div className="p-8 text-center">Exhibition not found or could not be loaded.</div>;


  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-600">Edit Exhibition</h2>
        
        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label htmlFor="title" className="block mb-1 font-semibold text-gray-700">Exhibition Title</label>
            <input
              id="title"
              type="text"
              value={exhibition.title}
              onChange={e => handleChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              required
            />
          </div>

          <div>
            <label htmlFor="museum_id" className="block mb-1 font-semibold text-gray-700">Museum</label>
            <select
              id="museum_id"
              value={exhibition.museum_id}
              onChange={e => handleChange("museum_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              required
            >
              <option value="">Select a Museum</option>
              {museums.map(museum => (
                <option key={museum.id} value={museum.id}>{museum.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_date" className="block mb-1 font-semibold text-gray-700">Start Date</label>
              <input
                id="start_date"
                type="date"
                value={exhibition.start_date}
                onChange={e => handleChange("start_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                required
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block mb-1 font-semibold text-gray-700">End Date</label>
              <input
                id="end_date"
                type="date"
                value={exhibition.end_date}
                onChange={e => handleChange("end_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-semibold text-gray-700">Description</label>
            <textarea
              id="description"
              value={exhibition.description}
              onChange={e => handleChange("description", e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="status" className="block mb-1 font-semibold text-gray-700">Status</label>
            <select
              id="status"
              value={exhibition.status}
              onChange={e => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              required
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <button 
              type="button" 
              className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold transition-colors duration-150" 
              onClick={() => navigate(-1)} // Go back to previous page
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExhibitionEditPage;
