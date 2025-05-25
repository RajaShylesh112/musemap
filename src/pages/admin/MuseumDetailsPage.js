import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase"; // Corrected import path

const TAB_LIST = [
  { label: "Basic Info" },
  { label: "Opening Hours" },
  { label: "Ticket Prices" },
  { label: "Content" },
];

const initialMuseumState = {
  name: "",
  location: "",
  description: "",
  contact_phone: "", 
  contact_email: "", 
  facilities: "", 
  opening_hours: [ 
    { day: "Monday", open: "10:00", close: "18:00" },
    { day: "Tuesday", open: "10:00", close: "18:00" },
    { day: "Wednesday", open: "10:00", close: "18:00" },
    { day: "Thursday", open: "10:00", close: "18:00" },
    { day: "Friday", open: "10:00", close: "18:00" },
    { day: "Saturday", open: "10:00", close: "18:00" },
    { day: "Sunday", open: "Closed", close: "" },
  ],
  ticket_price: { Adult: 0, Child: 0, Student: 0, Senior: 0, Foreigner: 0 }, 
  about: "",
  interesting_facts: "", 
  image_url: "",
};

const MuseumDetailsPage = () => { // Renaming component to MuseumCreatePage would be better.
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(initialMuseumState);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const navigate = useNavigate();
  const supabase = getSupabase();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleHourChange = (idx, field, value) => {
    const updatedHours = form.opening_hours.map((hourDetail, index) => 
      index === idx ? { ...hourDetail, [field]: value } : hourDetail
    );
    setForm(prevForm => ({ ...prevForm, opening_hours: updatedHours }));
  };

  const handlePriceChange = (type, value) => {
    const newPrice = parseFloat(value);
    setForm(prevForm => ({ 
      ...prevForm, 
      ticket_price: { ...prevForm.ticket_price, [type]: isNaN(newPrice) ? 0 : newPrice } 
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
        setFormMessage({ type: 'error', text: 'Supabase client not available.' });
        return;
    }
    if (!form.name.trim()) {
        setFormMessage({ type: 'error', text: 'Museum name is required.' });
        setActiveTab(0); // Switch to basic info tab
        return;
    }

    setIsSaving(true);
    setFormMessage(null);

    const newMuseumData = {
      ...form,
      facilities: form.facilities.split(',').map(s => s.trim()).filter(s => s),
      interesting_facts: form.interesting_facts.split(',').map(s => s.trim()).filter(s => s),
    };

    try {
      const { data, error } = await supabase
        .from('museums')
        .insert([newMuseumData])
        .select();

      if (error) throw error;

      setFormMessage({ type: 'success', text: 'Museum created successfully!' });
      setForm(initialMuseumState); 
      // setTimeout(() => navigate('/admin/dashboard/museums'), 2000); // Optional navigation
    } catch (error) {
      console.error('Error creating museum:', error);
      setFormMessage({ type: 'error', text: `Failed to create museum: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-4xl mx-auto"> {/* Increased max-width for better layout */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-600">Create New Museum</h2>
          {/* Removed action buttons for adding quiz/exhibition/artifact */}
        </div>
      
      <div className="flex border-b border-gray-300 mb-6">
        {TAB_LIST.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-3 -mb-px border-b-2 text-sm font-medium transition-colors duration-150
                        ${activeTab === idx 
                          ? "border-orange-500 text-orange-600" 
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 md:p-8">
        {formMessage && (
          <div className={`mb-6 p-4 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {formMessage.text}
          </div>
        )}
        {activeTab === 0 && ( // Basic Info
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Museum Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" required />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input id="location" name="location" value={form.location} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input id="contact_phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input id="contact_email" name="contact_email" type="email" value={form.contact_email} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" />
              </div>
            </div>
            <div>
              <label htmlFor="facilities" className="block text-sm font-medium text-gray-700 mb-1">Facilities (comma-separated)</label>
              <input id="facilities" name="facilities" value={form.facilities} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" placeholder="e.g., Wheelchair access, Guided tours" />
            </div>
             <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input id="image_url" name="image_url" type="url" value={form.image_url} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" placeholder="https://example.com/image.jpg" />
            </div>
          </div>
        )}
        {activeTab === 1 && ( // Opening Hours
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Opening Hours</h3>
            {form.opening_hours.map((oh, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-3 border rounded-md bg-gray-50">
                <input 
                    name={`day-${idx}`}
                    value={oh.day} 
                    readOnly 
                    className="w-full rounded-md px-3 py-2 bg-gray-200 text-gray-700 border border-gray-300 text-sm" 
                />
                <div className="flex items-center">
                  <label htmlFor={`open-${idx}`} className="text-sm text-gray-600 mr-2">Open:</label>
                  <input
                    id={`open-${idx}`}
                    type="time"
                    aria-label={`${oh.day} open time`}
                    value={oh.open}
                    onChange={e => handleHourChange(idx, "open", e.target.value)}
                    className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor={`close-${idx}`} className="text-sm text-gray-600 mr-2">Close:</label>
                  <input
                    id={`close-${idx}`}
                    type="time"
                    aria-label={`${oh.day} close time`}
                    value={oh.close}
                    onChange={e => handleHourChange(idx, "close", e.target.value)}
                    className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 2 && ( // Ticket Prices
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Ticket Prices</h3>
            {Object.entries(form.ticket_price).map(([type, price]) => (
              <div key={type} className="grid grid-cols-2 gap-4 items-center">
                <label htmlFor={`price-${type}`} className="text-sm font-medium text-gray-700">{type}</label>
                <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                        id={`price-${type}`}
                        type="number"
                        min="0"
                        value={price}
                        onChange={e => handlePriceChange(type, e.target.value)}
                        className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                    />
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 3 && ( // Content
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Museum Content</h3>
            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">About the Museum</label>
              <textarea
                id="about"
                name="about"
                value={form.about}
                onChange={handleChange}
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                rows={5}
              />
            </div>
            <div>
              <label htmlFor="interesting_facts" className="block text-sm font-medium text-gray-700 mb-1">Interesting Facts (comma-separated)</label>
              <textarea
                id="interesting_facts"
                name="interesting_facts"
                value={form.interesting_facts}
                onChange={handleChange}
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                rows={4}
                placeholder="e.g., Fact one, Fact two, Fact three"
              />
            </div>
          </div>
        )}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-70"
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Museum"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default MuseumDetailsPage;

