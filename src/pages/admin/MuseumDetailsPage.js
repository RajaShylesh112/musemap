import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TAB_LIST = [
  { label: "Basic Info" },
  { label: "Opening Hours" },
  { label: "Ticket Prices" },
  { label: "Content" },
];

const defaultState = {
  name: "National Museum of India",
  location: "Janpath, New Delhi, India",
  description: "The National Museum of India houses a vast collection of art, artifacts, and historical items spanning over 5,000 years of Indian cultural heritage.",
  phone: "+91-11-23019272",
  email: "info@nationalmuseum.gov.in",
  facilities: "Wheelchair access, Guided tours, Audio guides, Cafeteria, Gift shop, Locker room",
  openingHours: [
    { day: "Monday", open: "10:00", close: "18:00" },
    { day: "Tuesday", open: "10:00", close: "18:00" },
    { day: "Wednesday", open: "10:00", close: "18:00" },
    { day: "Thursday", open: "10:00", close: "18:00" },
    { day: "Friday", open: "10:00", close: "18:00" },
    { day: "Saturday", open: "10:00", close: "18:00" },
    { day: "Sunday", open: "10:00", close: "18:00" },
  ],
  ticketPrices: {
    Adult: 20,
    Child: 10,
    Student: 15,
    Senior: 15,
    Foreigner: 650,
  },
  about: "The National Museum, New Delhi is one of the largest museums in India. It holds a variety of articles ranging from pre-historic era to modern works of art. It was established in 1949 and houses over 200,000 works of art, both of Indian and foreign origin, covering over 5,000 years.",
  facts: "The museum houses the famous Dancing Girl artifact from Mohenjo-daro, which is a 4,500-year-old bronze statue. It also contains the sacred relics of Buddha from the 3rd-4th centuries BCE.",
};

const MuseumDetailsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(defaultState);

  // Handlers for form fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleHourChange = (idx, field, value) => {
    const updated = [...form.openingHours];
    updated[idx][field] = value;
    setForm({ ...form, openingHours: updated });
  };
  const handlePriceChange = (type, value) => {
    setForm({ ...form, ticketPrices: { ...form.ticketPrices, [type]: value } });
  };
  const handleContentChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Saved! (not implemented)"); // Replace with real save logic
  };

  const navigate = useNavigate();
  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Museum Details</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow"
            onClick={() => navigate("/admin/quizzes/new")}
          >
            Add Quiz
          </button>
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold shadow"
            onClick={() => navigate("/admin/exhibitions/new")}
          >
            Add Exhibition
          </button>
          <button
            type="button"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold shadow"
            onClick={() => navigate("/admin/artifacts/new")}
          >
            Add Artifact
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {TAB_LIST.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 rounded-t bg-gray-100 text-gray-900 border-b-2 ${activeTab === idx ? "border-orange-500 font-bold bg-white" : "border-transparent"}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-3xl border border-gray-200 shadow">
        {/* Tab Content */}
        {activeTab === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Museum Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Contact Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Contact Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100" />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Facilities</label>
              <input name="facilities" value={form.facilities} onChange={handleChange} className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100" />
            </div>
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
            <div className="grid grid-cols-1 gap-4">
              {form.openingHours.map((oh, idx) => (
                <div key={oh.day} className="flex items-center gap-4">
                  <div className="w-32 font-semibold">{oh.day}</div>
                  <div>
                    <label className="mr-2">Open</label>
                    <input
                      type="time"
                      value={oh.open}
                      onChange={e => handleHourChange(idx, "open", e.target.value)}
                      className="rounded px-2 py-1 bg-zinc-800 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="mr-2">Close</label>
                    <input
                      type="time"
                      value={oh.close}
                      onChange={e => handleHourChange(idx, "close", e.target.value)}
                      className="rounded px-2 py-1 bg-zinc-800 text-gray-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Ticket Prices</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(form.ticketPrices).map(([type, price]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-24 font-semibold">{type}</div>
                  <span className="text-orange-500">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={e => handlePriceChange(type, e.target.value)}
                    className="rounded px-2 py-1 bg-zinc-800 text-gray-100 w-24"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Museum Content</h3>
            <div className="mb-4">
              <label className="block font-semibold mb-1">About the Museum</label>
              <textarea
                value={form.about}
                onChange={e => handleContentChange("about", e.target.value)}
                className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100"
                rows={4}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Interesting Facts</label>
              <textarea
                value={form.facts}
                onChange={e => handleContentChange("facts", e.target.value)}
                className="w-full rounded px-3 py-2 bg-zinc-800 text-gray-100"
                rows={3}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};


export default MuseumDetailsPage;

