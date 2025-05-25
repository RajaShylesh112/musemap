import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase"; 

const dummyExhibitionData = {
  title: "Dummy Exhibition Title",
  museum_id: "", // This might be pre-filled if context allows, or selected
  start_date: "2024-01-01",
  end_date: "2024-03-31",
  description: "This is a detailed description for the dummy exhibition. It highlights the key aspects and themes that will be explored, inviting visitors to delve into a rich historical or artistic narrative.",
  status: "upcoming",
  image_url: "https://via.placeholder.com/300x200.png?text=Dummy+Exhibition"
};

const ExhibitionEditPage = () => {
  const { exhibitionId } = useParams();
  const navigate = useNavigate();
  const [museums, setMuseums] = useState([]); 
  
  const initialFormState = exhibitionId ? 
    { title: "", museum_id: "", start_date: "", end_date: "", description: "", status: "upcoming", image_url:"" } : 
    dummyExhibitionData;
  
  const [exhibition, setExhibition] = useState(initialFormState);
  const [loading, setLoading] = useState(!!exhibitionId); 
  const [error, setError] = useState(null); 
  const [notFound, setNotFound] = useState(false); 
  const [formMessage, setFormMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = getSupabase();

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase client not available.");
        setLoading(false);
        return;
      }
      
      let museumList = [];
      try {
        const { data: museumsData, error: museumsError } = await supabase
          .from("museums")
          .select("id, name");
        if (museumsError) {
            console.error("Error fetching museums:", museumsError);
        }
        museumList = museumsData || [];
        setMuseums(museumList);
      } catch (museumFetchErr) {
        console.error("Critical error fetching museums:", museumFetchErr);
        setError(`Failed to load essential museum data: ${museumFetchErr.message}`);
      }

      if (!exhibitionId) {
        // If no exhibitionId, we are using dummy data.
        // If dummy data needs a museum_id, try to pick one from the fetched list.
        if (exhibition.museum_id === "" && museumList.length > 0) {
            // setExhibition(prev => ({...prev, museum_id: museumList[0].id })); // Example
        }
        setLoading(false);
        return;
      }

      // If exhibitionId is present, proceed to fetch it.
      // setLoading(true) was handled by initial state if exhibitionId was present.
      setError(null);
      setNotFound(false);

      try {
        const { data: exhibitionDataResult, error: exhibitionFetchError } = await supabase
          .from("exhibitions")
          .select("*")
          .eq("id", exhibitionId)
          .maybeSingle(); 

        if (exhibitionFetchError) {
          console.error('Error fetching exhibition:', exhibitionFetchError);
          setError(`Failed to fetch exhibition: ${exhibitionFetchError.message}`);
          setExhibition(dummyExhibitionData); 
        } else if (!exhibitionDataResult) {
          setNotFound(true);
          setExhibition(dummyExhibitionData); 
        } else {
          setExhibition({
            ...exhibitionDataResult,
            start_date: exhibitionDataResult.start_date || "",
            end_date: exhibitionDataResult.end_date || "",
            image_url: exhibitionDataResult.image_url || "",
          });
        }
      } catch (err) { 
        console.error("Unexpected error fetching exhibition data:", err);
        setError(err.message || "An unexpected error occurred while fetching exhibition data.");
        setExhibition(dummyExhibitionData); 
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, [exhibitionId, supabase, navigate]); // navigate was missing

  const handleChange = (field, value) => {
    setExhibition(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setFormMessage({ type: "error", text: "Supabase client not available." });
      return;
    }
    
    if (!exhibitionId && exhibition.title === dummyExhibitionData.title) {
        setFormMessage({ type: "error", text: "This is dummy data. Please modify it or use a create page to make a new exhibition."});
        return;
    }
    if (notFound && exhibitionId) { 
        setFormMessage({type: "error", text: "Cannot save, exhibition record not found."});
        return;
    }

    setIsSaving(true); 
    setFormMessage(null);

    if (!exhibition.title || !exhibition.museum_id || !exhibition.start_date || !exhibition.end_date || !exhibition.status) {
        setFormMessage({ type: "error", text: "Please fill in all required fields." });
        setIsSaving(false);
        return;
    }

    // This page is for editing existing exhibitions.
    // If exhibitionId is not present, it implies a logic error or misuse of this page for creation.
    if (!exhibitionId) {
        console.error("Attempting to update without an exhibitionId.");
        setFormMessage({ type: "error", text: "Cannot update: Exhibition ID is missing. Please use the create page for new exhibitions." });
        setIsSaving(false);
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
          image_url: exhibition.image_url, 
        })
        .eq("id", exhibitionId)
        .select();

      if (error) throw error;
      
      setFormMessage({ type: "success", text: "Exhibition updated successfully!" });
      setTimeout(() => navigate("/admin/dashboard/exhibitions"), 2000);

    } catch (err) {
      console.error("Error updating exhibition:", err);
      setFormMessage({ type: "error", text: err.message || "Failed to update exhibition." });
    } finally {
      setIsSaving(false); 
    }
  };

  if (loading) return (
    <div className="p-8 text-center min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading...</p>
    </div>
  );
  
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-600">
            {exhibitionId ? "Edit Exhibition" : "Exhibition Details (Preview with Dummy Data)"}
        </h2>
        
        {error && <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">Error: {error}</div>}
        {notFound && exhibitionId && <div className="mb-4 p-3 rounded-md text-sm bg-yellow-100 text-yellow-700">Exhibition with ID '{exhibitionId}' not found. Displaying dummy data for reference. Fields will be read-only.</div>}
        {!exhibitionId && <div className="mb-4 p-3 rounded-md text-sm bg-blue-100 text-blue-700">Displaying dummy data for UI development. No actual record is being edited.</div>}


        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
         <fieldset disabled={isSaving || (notFound && !!exhibitionId) || !exhibitionId && exhibition.title === dummyExhibitionData.title}>
            <div>
              <label htmlFor="title" className="block mb-1 font-semibold text-gray-700">Exhibition Title</label>
              <input
                id="title"
                type="text"
                value={exhibition.title || ""}
                onChange={e => handleChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="museum_id" className="block mb-1 font-semibold text-gray-700">Museum</label>
              <select
                id="museum_id"
                value={exhibition.museum_id || ""}
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
                  value={exhibition.start_date || ""}
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
                  value={exhibition.end_date || ""}
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
                value={exhibition.description || ""}
                onChange={e => handleChange("description", e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="image_url" className="block mb-1 font-semibold text-gray-700">Image URL</label>
              <input
                id="image_url"
                name="image_url" // Ensure name attribute is present for handleChange
                type="url"
                value={exhibition.image_url || ""}
                onChange={e => handleChange("image_url", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label htmlFor="status" className="block mb-1 font-semibold text-gray-700">Status</label>
              <select
                id="status"
                value={exhibition.status || "upcoming"}
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
                onClick={() => navigate(exhibitionId ? -1 : "/admin/dashboard/exhibitions")} 
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-50"
                disabled={isSaving || (notFound && !!exhibitionId) || (!exhibitionId && exhibition.title === dummyExhibitionData.title) }
              >
                {isSaving ? "Saving..." : (exhibitionId ? "Save Changes" : "Create (Dummy - Not Savable)")}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default ExhibitionEditPage;
