import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase"; 

const dummyArtifactData = {
  name: "Dummy Artifact Name",
  museum_id: "", 
  period: "Ancient Dummy Era",
  description: "A fascinating dummy artifact with a rich (though fabricated) history. Used in ceremonial dummy rituals.",
  image_url: "https://via.placeholder.com/300x200.png?text=Dummy+Artifact",
  origin: "Dummytopia" 
};

const ArtifactEditPage = () => {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const supabase = getSupabase();

  const initialFormState = artifactId ? 
    { name: "", museum_id: "", period: "", description: "", image_url: "", origin: "" } : 
    dummyArtifactData;

  const [artifact, setArtifact] = useState(initialFormState);
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(!!artifactId); 
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false); 
  const [formMessage, setFormMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false); 


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

      if (!artifactId) { 
        if (artifact.museum_id === "" && museumList.length > 0) {
            // setArtifact(prev => ({...prev, museum_id: museumList[0].id })); // Optional
        }
        setLoading(false);
        return;
      }

      setLoading(true); 
      setError(null);
      setNotFound(false);

      try {
        const { data: artifactDataResult, error: artifactFetchError } = await supabase
          .from("artifacts")
          .select("*")
          .eq("id", artifactId)
          .maybeSingle(); 

        if (artifactFetchError) {
          console.error('Error fetching artifact:', artifactFetchError);
          setError(`Failed to fetch artifact: ${artifactFetchError.message}`);
          setArtifact(dummyArtifactData); 
        } else if (!artifactDataResult) {
          setNotFound(true);
          setArtifact(dummyArtifactData); 
        } else {
          setArtifact(artifactDataResult); 
        }
      } catch (err) { 
        console.error("Unexpected error fetching artifact data:", err);
        setError(err.message || "An unexpected error occurred.");
        setArtifact(dummyArtifactData); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artifactId, supabase, navigate]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtifact(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setFormMessage({ type: "error", text: "Supabase client not available." });
      return;
    }
    if (!artifactId && artifact.name === dummyArtifactData.name) {
        setFormMessage({ type: "error", text: "This is dummy data. Please modify it or use a create page to make a new artifact."});
        return;
    }
    if (notFound && artifactId) { 
        setFormMessage({type: "error", text: "Cannot save, artifact record not found."});
        return;
    }

    setIsSaving(true); 
    setFormMessage(null);

    if (!artifact.name.trim()) {
      setFormMessage({ type: "error", text: "Artifact name cannot be empty." });
      setIsSaving(false);
      return;
    }
    if (!artifact.museum_id) {
      setFormMessage({ type: "error", text: "Please select a museum." });
      setIsSaving(false);
      return;
    }
    
    if (!artifactId) {
        console.warn("Attempting to save without an artifactId. This should be an insert operation.");
        setFormMessage({type: "error", text: "Saving new artifacts from this page is not fully implemented. Please use a dedicated create page."});
        setIsSaving(false);
        return;
    }

    try {
      const updateData = {
        name: artifact.name,
        museum_id: artifact.museum_id,
        period: artifact.period,
        description: artifact.description,
        image_url: artifact.image_url,
        origin: artifact.origin, 
      };

      const { data, error } = await supabase
        .from("artifacts")
        .update(updateData)
        .eq("id", artifactId)
        .select();

      if (error) throw error;

      setFormMessage({ type: "success", text: "Artifact updated successfully!" });
      if (data && data.length > 0) {
        setArtifact(data[0]);
      }
      setTimeout(() => navigate("/admin/dashboard/artifacts"), 2000); 
    } catch (err) {
      console.error("Error updating artifact:", err);
      setFormMessage({ type: "error", text: err.message || "Failed to update artifact." });
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
            {artifactId ? "Edit Artifact" : "Artifact Details (Preview with Dummy Data)"}
        </h2>
        {error && <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">Error: {error}</div>}
        {notFound && artifactId && <div className="mb-4 p-3 rounded-md text-sm bg-yellow-100 text-yellow-700">Artifact with ID '{artifactId}' not found. Displaying dummy data for reference.</div>}
        {!artifactId && <div className="mb-4 p-3 rounded-md text-sm bg-blue-100 text-blue-700">Displaying dummy data for UI development. No actual record is being edited.</div>}
        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : formMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
         <fieldset disabled={isSaving || (notFound && !!artifactId) || (!artifactId && artifact.name === dummyArtifactData.name)}>
            <div>
              <label htmlFor="name" className="block mb-1 font-semibold text-gray-700">Artifact Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={artifact.name || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="museum_id" className="block mb-1 font-semibold text-gray-700">Museum</label>
              <select
                id="museum_id"
                name="museum_id"
                value={artifact.museum_id || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                required
              >
                <option value="">Select a Museum</option>
                {museums.map(museum => (
                  <option key={museum.id} value={museum.id}>{museum.name}</option>
                ))}
              </select>
            </div>

            <div>
                <label htmlFor="origin" className="block mb-1 font-semibold text-gray-700">Origin</label>
                <input
                id="origin"
                name="origin"
                type="text"
                value={artifact.origin || ""}
                onChange={handleChange}
                placeholder="e.g., Harappa, Mughal Empire"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                />
            </div>

            <div>
              <label htmlFor="period" className="block mb-1 font-semibold text-gray-700">Period</label>
              <input
                id="period"
                name="period"
                type="text"
                value={artifact.period || ""}
                onChange={handleChange}
                placeholder="e.g., Indus Valley Civilization, Mughal Era"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-1 font-semibold text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={artifact.description || ""}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              />
            </div>
            
            <div>
              <label htmlFor="image_url" className="block mb-1 font-semibold text-gray-700">Image URL</label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={artifact.image_url || ""}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <button
                type="button"
                className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold transition-colors duration-150"
                onClick={() => navigate(artifactId ? -1 : "/admin/dashboard/artifacts")} 
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-50"
                disabled={isSaving || (notFound && !!artifactId) || (!artifactId && artifact.name === dummyArtifactData.name)}
              >
                {isSaving ? "Saving..." : (artifactId ? "Save Changes" : "Create (Dummy - Not Savable)")}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default ArtifactEditPage;
