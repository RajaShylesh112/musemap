import React, { useState } from "react";
import { Link } from "react-router-dom";

const initialExhibitions = [
  { title: "Indus Valley Civilization", dates: "01-01-2023 to 31-03-2023", description: "Artifacts from the Indus Valley.", status: "Upcoming" },
  { title: "Mughal Miniatures", dates: "15-04-2023 to 30-06-2023", description: "Paintings from the Mughal era.", status: "Ongoing" },
  { title: "Modern Indian Art", dates: "01-07-2023 to 31-08-2023", description: "Exhibition of modern Indian artists.", status: "Completed" },
];

const ExhibitionsPage = () => {
  const [exhibitions, setExhibitions] = useState(initialExhibitions);

  const handleDelete = (idx) => {
    if (window.confirm("Are you sure you want to delete this exhibition?")) {
      setExhibitions(exhibitions.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Exhibitions</h2>
        <a href="/admin/exhibitions/new">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold shadow flex items-center gap-2">
            + Add Exhibition
          </button>
        </a>
      </div>
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
            {exhibitions.map((ex, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 font-medium">{ex.title}</td>
                <td>{ex.dates}</td>
                <td>{ex.description}</td>
                <td className="text-right space-x-2">
                  <Link to={`/admin/exhibitions/edit/${idx}`} className="inline-block">
                    <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                  >
                    Delete
                  </button>
                </td>
                <td>{ex.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExhibitionsPage;
