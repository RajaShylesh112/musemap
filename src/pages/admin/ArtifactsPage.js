import React, { useState } from "react";

const initialArtifacts = [
  { name: "Dancing Girl", period: "c. 2500 BCE", description: "Bronze statue from Mohenjo-daro." },
  { name: "Ashoka Pillar", period: "c. 250 BCE", description: "Stone pillar with lion capital." },
  { name: "Chola Bronze", period: "c. 11th century CE", description: "Bronze sculpture from Tamil Nadu." },
];

const ArtifactsPage = () => {
  const [artifacts, setArtifacts] = useState(initialArtifacts);

  const handleDelete = (idx) => {
    if (window.confirm("Are you sure you want to delete this artifact?")) {
      setArtifacts(artifacts.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Artifacts</h2>
        <a href="/admin/artifacts/new">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold shadow flex items-center gap-2">
            + Add Artifact
          </button>
        </a>
      </div>
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
            {artifacts.map((artifact, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 font-medium">{artifact.name}</td>
                <td>{artifact.period}</td>
                <td>{artifact.description}</td>
                <td className="text-right space-x-2">
                  <a href={`/admin/artifacts/edit/${idx}`} className="inline-block">
                    <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">Edit</button>
                  </a>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArtifactsPage;

