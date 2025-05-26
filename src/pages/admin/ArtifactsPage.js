import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSupabase } from "../../supabase";

const ArtifactsPage = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = getSupabase();

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("You must be logged in to view artifacts.");
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


        // Then fetch artifacts for that museum
        const { data: artifactsData, error: artifactsError } = await supabase
          .from('artifacts')
          .select('*')
          .eq('museum_id', museumData.id)
          .order('created_at', { ascending: false });

        if (artifactsError) throw artifactsError;

        setArtifacts(artifactsData || []);
      } catch (err) {
        console.error("Error fetching artifacts:", err);
        setError(err.message || "Failed to load artifacts");
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, [supabase]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this artifact?")) {
      try {
        const { error } = await supabase
          .from('artifacts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Remove the deleted artifact from state
        setArtifacts(artifacts.filter(artifact => artifact.id !== id));
      } catch (err) {
        console.error("Error deleting artifact:", err);
        alert("Failed to delete artifact. Please try again.");
      }
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Artifacts</h2>
        <Link to="/admin/artifacts/new">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold shadow flex items-center gap-2">
            + Add Artifact
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
              <th className="py-2">Name</th>
              <th>Period</th>
              <th>Description</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.length > 0 ? (
              artifacts.map((artifact) => (
                <tr key={artifact.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 font-medium">{artifact.name}</td>
                  <td>{artifact.period}</td>
                  <td className="truncate max-w-xs">{artifact.description}</td>
                  <td className="text-right space-x-2">
                    <Link to={`/admin/artifacts/edit/${artifact.id}`} className="inline-block">
                      <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">Edit</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(artifact.id)}
                      className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    No artifacts found. Click "Add Artifact" to create one.
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

export default ArtifactsPage;

