import React, { useState } from "react";

const ExhibitionCreatePage = () => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Upcoming");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Exhibition created! (not implemented)");
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Add New Exhibition</h2>
      <form onSubmit={handleSubmit} className="flex gap-8 max-w-4xl">
        {/* Exhibition Details */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 shadow">
          <h3 className="font-semibold text-lg mb-2">Exhibition Details</h3>
          <label className="block font-semibold mb-1 mt-2">Exhibition Title</label>
          <input className="w-full rounded px-3 py-2 bg-gray-100 text-gray-900" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Start Date</label>
              <input type="date" className="w-full rounded px-3 py-2 bg-gray-100 text-gray-900" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">End Date</label>
              <input type="date" className="w-full rounded px-3 py-2 bg-gray-100 text-gray-900" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <label className="block font-semibold mb-1 mt-2">Status</label>
          <select className="w-full rounded px-3 py-2 bg-gray-100 text-gray-900" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Upcoming</option>
            <option>Active</option>
            <option>Past</option>
          </select>
          <label className="block font-semibold mb-1 mt-2">Description</label>
          <textarea className="w-full rounded px-3 py-2 bg-gray-100 text-gray-900" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        {/* Exhibition Image */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 shadow flex flex-col justify-between">
          <h3 className="font-semibold text-lg mb-2">Exhibition Image</h3>
          <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded p-4 mb-4">
            <span className="mb-2 text-gray-500">Drag and drop an image or click to browse</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
            {image && <span className="text-green-600">{image.name}</span>}
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold" onClick={() => window.history.back()}>Cancel</button>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow">Create Exhibition</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExhibitionCreatePage;
