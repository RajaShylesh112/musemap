import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase";

const initialExhibitionState = {
  title: "",
  start_date: "",
  end_date: "",
  status: "upcoming", // Default status matching schema
  description: "",
  // image_url: "", // Removed image_url
  museum_id: null,
};

const ExhibitionCreatePage = () => {
  const [exhibitionData, setExhibitionData] = useState(initialExhibitionState);
  const [userMuseumId, setUserMuseumId] = useState(null);
  const [isLoadingUserMuseum, setIsLoadingUserMuseum] = useState(true);
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const navigate = useNavigate();
  const supabase = getSupabase();

  useEffect(() => {
    const fetchUserMuseum = async () => {
      if (!supabase) {
        setFormError("Supabase client not available.");
        setIsLoadingUserMuseum(false);
        return;
      }
      setIsLoadingUserMuseum(true);
      setFormError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setFormError("You must be logged in to create an exhibition.");
        setIsLoadingUserMuseum(false);
        if (!user) navigate('/login');
        return;
      }

      const { data: museumData, error: museumError } = await supabase
        .from('museums')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (museumError || !museumData) {
        setFormError("Please set up your museum details before creating exhibitions. You can manage your museum under 'Manage My Museum'.");
        setUserMuseumId(null);
      } else {
        setUserMuseumId(museumData.id);
        setExhibitionData(prev => ({ ...prev, museum_id: museumData.id }));
      }
      setIsLoadingUserMuseum(false);
    };

    fetchUserMuseum();
  }, [supabase, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExhibitionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMuseumId) {
      setFormMessage({ type: "error", text: formError || "Cannot create exhibition without a museum." });
      return;
    }
    if (!exhibitionData.title.trim() || !exhibitionData.start_date || !exhibitionData.end_date) {
        setFormMessage({ type: "error", text: "Title, start date, and end date are required."});
        return;
    }


    setIsSaving(true);
    setFormMessage(null);

    const payload = {
      ...exhibitionData,
      museum_id: userMuseumId,
    };

    try {
      const { error } = await supabase.from('exhibitions').insert([payload]);
      if (error) throw error;
      setFormMessage({ type: "success", text: "Exhibition created successfully!" });
      setExhibitionData(initialExhibitionState); // Reset form
      setTimeout(() => navigate('/admin/dashboard/exhibitions'), 1500);
    } catch (error) {
      console.error("Error creating exhibition:", error);
      setFormMessage({ type: "error", text: `Failed to create exhibition: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUserMuseum) {
    return <div className="p-8 text-center">Loading user and museum information...</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-orange-600">Add New Exhibition</h2>
        
        {formError && (
          <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">
            {formError} Visit the <a href="/admin/museum-details" className="font-semibold underline hover:text-red-800">Manage My Museum</a> page to set up your museum.
          </div>
        )}

        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 md:p-8 space-y-6">
         <fieldset disabled={isSaving || !!formError || isLoadingUserMuseum}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Exhibition Title</label>
              <input 
                id="title"
                name="title"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={exhibitionData.title} 
                onChange={handleInputChange} 
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  id="start_date"
                  name="start_date"
                  type="date" 
                  className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                  value={exhibitionData.start_date} 
                  onChange={handleInputChange} 
                  required
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  id="end_date"
                  name="end_date"
                  type="date" 
                  className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                  value={exhibitionData.end_date} 
                  onChange={handleInputChange} 
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                id="status"
                name="status"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={exhibitionData.status} 
                onChange={handleInputChange}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option> {/* Changed from Active to Ongoing */}
                <option value="past">Past</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                id="description"
                name="description"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={exhibitionData.description} 
                onChange={handleInputChange} 
                rows={3} 
              />
            </div>
            {/* Image URL field removed from UI */}
            <div className="flex gap-3 justify-end pt-4 border-t">
               <button 
                type="button" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold transition-colors" 
                onClick={() => navigate(-1)} // Or specific path
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-70"
                disabled={isSaving || !!formError || isLoadingUserMuseum}
              >
                {isSaving ? "Creating..." : "Create Exhibition"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default ExhibitionCreatePage;
