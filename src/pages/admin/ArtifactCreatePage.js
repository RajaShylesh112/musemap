import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase";

const initialArtifactState = {
  name: "",
  description: "",
  image_url: "", // Changed from image file to URL
  origin: "", // Assuming 'origin' is part of your schema
  period: "",
  museum_id: null,
};

const ArtifactCreatePage = () => {
  const [artifactData, setArtifactData] = useState(initialArtifactState);
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
        setFormError("You must be logged in to create an artifact.");
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
        setFormError("Please set up your museum details before creating artifacts. You can manage your museum under 'Manage My Museum'.");
        setUserMuseumId(null);
      } else {
        setUserMuseumId(museumData.id);
        setArtifactData(prev => ({ ...prev, museum_id: museumData.id }));
      }
      setIsLoadingUserMuseum(false);
    };

    fetchUserMuseum();
  }, [supabase, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArtifactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMuseumId) {
      setFormMessage({ type: "error", text: formError || "Cannot create artifact without a museum." });
      return;
    }
     if (!artifactData.name.trim()) {
      setFormMessage({ type: "error", text: "Artifact name is required." });
      return;
    }

    setIsSaving(true);
    setFormMessage(null);

    const payload = {
      ...artifactData,
      museum_id: userMuseumId,
    };

    try {
      const { error } = await supabase.from('artifacts').insert([payload]);
      if (error) throw error;
      setFormMessage({ type: "success", text: "Artifact created successfully!" });
      setArtifactData(initialArtifactState); // Reset form
      setTimeout(() => navigate('/admin/dashboard/artifacts'), 1500);
    } catch (error) {
      console.error("Error creating artifact:", error);
      setFormMessage({ type: "error", text: `Failed to create artifact: ${error.message}` });
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
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-orange-600">Add New Artifact</h2>
        
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

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 md:p-8"> {/* Removed space-y-6 from form, will add to fieldset */}
          <fieldset className="space-y-6" disabled={isSaving || !!formError || isLoadingUserMuseum}> {/* Added space-y-6 to fieldset */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                id="name"
                name="name"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={artifactData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
              <input 
                id="origin"
                name="origin"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={artifactData.origin} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input 
                id="period"
                name="period"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={artifactData.period} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                id="description"
                name="description"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={artifactData.description} 
                onChange={handleInputChange} 
                rows={3} 
              />
            </div>
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input 
                id="image_url"
                name="image_url"
                type="url"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={artifactData.image_url} 
                onChange={handleInputChange} 
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3 justify-end pt-6 mt-6 border-t border-gray-200"> {/* Standardized actions div styling */}
              <button 
                type="button" 
                className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-semibold transition-colors duration-150"  // Standardized button padding
                onClick={() => navigate(-1)} 
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-70" // Standardized button padding
                disabled={isSaving || !!formError || isLoadingUserMuseum}
              >
                {isSaving ? "Creating..." : "Create Artifact"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default ArtifactCreatePage;
