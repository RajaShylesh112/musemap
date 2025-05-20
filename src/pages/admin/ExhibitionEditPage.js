import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const initialExhibitions = [
  { title: "Indus Valley Civilization", dates: "01-01-2023 to 31-03-2023", description: "Artifacts from the Indus Valley.", status: "Upcoming" },
  { title: "Mughal Miniatures", dates: "15-04-2023 to 30-06-2023", description: "Paintings from the Mughal era.", status: "Ongoing" },
  { title: "Modern Indian Art", dates: "01-07-2023 to 31-08-2023", description: "Exhibition of modern Indian artists.", status: "Completed" },
];

const ExhibitionEditPage = () => {
  const { idx } = useParams();
  const [exhibition, setExhibition] = useState(null);

  useEffect(() => {
    setExhibition(initialExhibitions[idx]);
  }, [idx]);

  const handleChange = (field, value) => {
    setExhibition({ ...exhibition, [field]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Exhibition updated! (not implemented)");
  };

  if (!exhibition) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Edit Exhibition</h2>
      <form onSubmit={handleSave} className="flex gap-8 max-w-4xl">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Exhibition Title</label>
            <input
              value={exhibition.title}
              onChange={e => handleChange("title", e.target.value)}
              className="rounded px-2 py-1 bg-gray-100 text-gray-900 border border-gray-200 w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Dates</label>
            <input
              value={exhibition.dates}
              onChange={e => handleChange("dates", e.target.value)}
              className="rounded px-2 py-1 bg-gray-100 text-gray-900 border border-gray-200 w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Description</label>
            <textarea
              value={exhibition.description}
              onChange={e => handleChange("description", e.target.value)}
              className="rounded px-2 py-1 bg-gray-100 text-gray-900 border border-gray-200 w-full"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Status</label>
            <select
              value={exhibition.status}
              onChange={e => handleChange("status", e.target.value)}
              className="rounded px-2 py-1 bg-gray-100 text-gray-900 border border-gray-200 w-full"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          {/* Image upload logic can be added here if needed */}
        </div>
        <div className="flex gap-2 mt-4 justify-end w-full">
          <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold" onClick={() => window.history.back()}>Cancel</button>
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default ExhibitionEditPage;
