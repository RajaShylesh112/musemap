import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase"; // Assuming this path is correct

const ArtifactEditPage = () => {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const supabase = getSupabase();

  const [artifact, setArtifact] = useState({
    name: "",
    museum_id: "",
    period: "",
    description: "",
    image_url: "",
  });
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase client not available.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch museums
        const { data: museumsData, error: museumsError } = await supabase
          .from("museums")
          .select("id, name");
        if (museumsError) throw museumsError;
        setMuseums(museumsData || []);

        // Fetch artifact details
        if (artifactId) {
          const { data: artifactData, error: artifactError } = await supabase
            .from("artifacts")
            .select("*")
            .eq("id", artifactId)
            .single();

          if (artifactError) throw artifactError;
          
          if (artifactData) {
            setArtifact(artifactData);
          } else {
            setError("Artifact not found.");
          }
        } else {
          setError("Artifact ID is missing."); 
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artifactId, supabase]);

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
    setLoading(true);
    setFormMessage(null);

    // Validation
    if (!artifact.name.trim()) {
      setFormMessage({ type: "error", text: "Artifact name cannot be empty." });
      setLoading(false);
      return;
    }
    if (!artifact.museum_id) {
      setFormMessage({ type: "error", text: "Please select a museum." });
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: artifact.name,
        museum_id: artifact.museum_id,
        period: artifact.period,
        description: artifact.description,
        image_url: artifact.image_url,
        // updated_at: new Date().toISOString(), // Ensure your table handles this or remove
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
      setLoading(false);
    }
  };

  if (loading && !artifact.name) return <div className="p-8 text-center">Loading artifact details...</div>; 
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!artifactId && !loading) return <div className="p-8 text-center">Artifact ID missing.</div>; 
  if (!artifact && !loading && artifactId) return <div className="p-8 text-center">Artifact not found or could not be loaded.</div>;


  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-600">Edit Artifact</h2>

        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : formMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
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
              onClick={() => navigate(-1)} 
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

export default ArtifactEditPage;
