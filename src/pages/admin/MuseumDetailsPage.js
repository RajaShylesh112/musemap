/**
 * MuseumDetailsPage - Admin interface for managing museum information
 * 
 * This component provides a form for creating and editing museum details including:
 * - Basic information (name, description, contact details)
 * - Opening hours management with an interactive time picker
 * - Ticket pricing configuration
 * 
 * The component handles both creation of new museum entries and editing of existing ones.
 * It includes form validation, loading states, and error handling.
 * 
 * @module MuseumDetailsPage
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase";

/**
 * Custom TimePicker Component
 * 
 * A reusable time picker that provides:
 * - Dropdown selection of times in 15-minute intervals
 * - 12/24 hour format support
 * - Current time as placeholder
 * - Keyboard accessibility
 */
const TimePicker = ({ value, onChange, disabled, className = '' }) => {
  // State for managing the current time and dropdown visibility
  const [currentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  /**
   * Cleans time string by removing AM/PM and extra spaces
   * @param {string} timeStr - The time string to clean
   * @returns {string} Cleaned time string
   */
  const cleanTimeValue = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.replace(/\s*[AP]M\s*/i, '').trim();
  };
  
  /**
   * Converts time string to 24-hour format for consistent storage
   * @param {string} timeStr - Time string to convert
   * @returns {string} Time in 24-hour format (HH:MM)
   */
  const formatTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    
    const cleaned = cleanTimeValue(timeStr);
    // If already in 24-hour format (HH:MM), return as is
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleaned)) {
      return cleaned;
    }
    
    // Handle 12-hour format with AM/PM
    const timeMatch = cleaned.match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
    if (timeMatch) {
      let [_, hours, minutes, period] = timeMatch;
      hours = parseInt(hours, 10);
      
      if (period) {
        period = period.toUpperCase();
        if (period === 'PM' && hours < 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
      }
      
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
    
    return cleaned;
  };
  
  /**
   * Generates an array of time options in 15-minute intervals (24-hour format)
   * @returns {Array} Array of time strings in HH:MM format
   */
  const timeOptions = (() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      ['00', '15', '30', '45'].forEach(minute => {
        options.push(`${String(hour).padStart(2, '0')}:${minute}`);
      });
    }
    return options;
  })();

  /**
   * Formats a time string for display in 12-hour format with AM/PM
   * @param {string} timeStr - Time string to format
   * @returns {string} Formatted time string (e.g., '2:30 PM')
   */
  const formatForDisplay = (timeStr) => {
    if (timeStr === 'Closed') return 'Closed';
    
    const timeToFormat = timeStr || currentTime;
    const formatted24h = formatTo24Hour(timeToFormat);
    
    if (!formatted24h) {
      const now = new Date();
      const fallbackTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return formatTimeTo12Hour(fallbackTime);
    }
    
    return formatTimeTo12Hour(formatted24h);
  };
  
  /**
   * Converts 24-hour time to 12-hour format with AM/PM
   * @param {string} time24 - Time string in 24-hour format (HH:MM)
   * @returns {string} Formatted time in 12-hour format with AM/PM
   */
  const formatTimeTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 or 24 to 12
    return `${displayHour}:${minutes} ${ampm}`;
  };

  /**
   * Handles clicks outside the dropdown to close it
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Auto-scroll to the selected time when dropdown opens
      if (value && value !== 'Closed') {
        const selectedElement = document.getElementById(`time-${formatTo24Hour(value)}`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, value]);

  /**
   * Handles time selection from the dropdown
   * @param {string} time - The selected time string
   */
  const handleTimeSelect = (time) => {
    onChange(formatTo24Hour(time));
    setIsOpen(false);
  };

  /**
   * Gets the current time in HH:MM format
   * @returns {string} Current time string
   */
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };
  
  // Determine the value to display in the input
  const displayValue = (value === '' || value === undefined) ? getCurrentTime() : value;
  // Check if we're showing a placeholder (no value selected yet)
  const isPlaceholder = (value === '' || value === undefined);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer ${disabled ? 'bg-gray-100' : 'bg-white hover:border-orange-400'} ${isOpen ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`${isPlaceholder ? 'text-gray-400' : ''}`}>
          {formatForDisplay(displayValue)}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {timeOptions.map((time) => {
              const displayTime = formatForDisplay(time);
              return (
                <div
                  key={time}
                  id={`time-${time}`}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-orange-50 ${formatTo24Hour(value) === time ? 'bg-orange-100 text-orange-700' : 'text-gray-700'}`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {displayTime}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tab configuration for the museum details form
 * Defines the main sections of the form
 */
const TAB_LIST = [
  { label: "Basic Info" },    // Basic museum information
  { label: "Opening Hours" }, // Weekly schedule and hours
  { label: "Ticket Prices" }, // Pricing for different visitor categories
  { label: "Content" },       // Museum content and exhibits
];

/**
 * Converts the database opening hours format to the form format
 * @param {Object} dbHours - Opening hours in database format
 * @returns {Array} Opening hours in form format
 */
const convertDbHoursToFormFormat = (dbHours) => {
  if (!dbHours) return [];
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days.map(day => {
    const hours = dbHours[day] || "Closed";
    if (hours === "Closed") {
      return { day, open: "Closed", close: "" };
    }
    
    // Handle formats like "9:15 AM - 6:00 PM"
    const [openStr, closeStr] = hours.split(" - ");
    return {
      day,
      open: openStr || "",
      close: closeStr || ""
    };
  });
};

const initialMuseumState = {
  name: "",
  location: "",
  description: "",
  contact_phone: "",
  contact_email: "",
  facilities: "",
  opening_hours: {}, // Will be populated from database
  ticket_price: { Adult: 0, Child: 0, Student: 0, Senior: 0, Foreigner: 0 },
  about: "",
  interesting_facts: "",
  image_url: "",
  user_id: null,
};

// This page now serves as "Manage My Museum" (Create or Edit)
/**
 * Main component for managing museum details
 * Handles both creation of new museums and editing of existing ones
 */
const MuseumDetailsPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);           // Currently active tab index
  const [form, setForm] = useState(initialMuseumState);    // Form data state
  const [isLoading, setIsLoading] = useState(true);        // Loading state for initial data
  const [isSaving, setIsSaving] = useState(false);         // Loading state for save operations
  const [formMessage, setFormMessage] = useState(null);    // Form status/error messages
  const [currentUserMuseumId, setCurrentUserMuseumId] = useState(null); // Currently loaded museum ID
  const [pageMode, setPageMode] = useState("Create");      // Operation mode: "Create" or "Edit"
  const [userId, setUserId] = useState(null);              // Current authenticated user ID

  const navigate = useNavigate();
  const supabase = getSupabase();

  useEffect(() => {
    const loadUserDataAndMuseum = async () => {
      if (!supabase) {
        setFormMessage({ type: 'error', text: 'Supabase client not available.' });
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setFormMessage(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setFormMessage({ type: 'error', text: 'You must be logged in to manage a museum.' });
        setIsLoading(false);
        if (!user) navigate('/login'); // Redirect if not logged in
        return;
      }
      setUserId(user.id); // Store user ID

      // Attempt to fetch a museum for this user
      const { data: museumData, error: museumError } = await supabase
        .from('museums')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (museumError) {
        console.error('Error fetching museum:', museumError);
        setFormMessage({ type: 'error', text: `Error fetching museum data: ${museumError.message}` });
        setIsLoading(false);
        return;
      }

      if (museumData) { // User has a museum - Edit Mode
        console.log('Raw opening_hours from DB:', museumData.opening_hours);
        
        // Initialize with default empty opening hours
        let openingHours = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        try {
          // Handle different formats of opening_hours
          if (museumData.opening_hours && typeof museumData.opening_hours === 'object' && 
              !Array.isArray(museumData.opening_hours)) {
            // If it's already an object with day keys, use it directly
            openingHours = { ...museumData.opening_hours };
            console.log('Using object format from DB');
          } else if (typeof museumData.opening_hours === 'string') {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(museumData.opening_hours);
              if (parsed && typeof parsed === 'object') {
                openingHours = parsed;
                console.log('Parsed JSON object from string');
              }
            } catch (e) {
              console.warn('Failed to parse opening_hours as JSON, using default', e);
            }
          } else if (Array.isArray(museumData.opening_hours)) {
            // Convert from array format to object format
            museumData.opening_hours.forEach(dayData => {
              if (dayData && dayData.day) {
                if (dayData.open === 'Closed' || !dayData.open || !dayData.close) {
                  openingHours[dayData.day] = 'Closed';
                } else {
                  openingHours[dayData.day] = `${dayData.open} - ${dayData.close}`;
                }
              }
            });
            console.log('Converted array to object format');
          }
          
          // Ensure all days are present
          days.forEach(day => {
            if (!openingHours[day]) {
              openingHours[day] = 'Closed';
            }
          });
          
          console.log('Processed opening hours:', openingHours);
          
        } catch (error) {
          console.error('Error processing opening hours, using default:', error);
          // Initialize with all days closed
          days.forEach(day => {
            openingHours[day] = 'Closed';
          });
        }

        // Prepare form data
        const formData = {
          ...museumData,
          opening_hours: openingHours,
          facilities: Array.isArray(museumData.facilities) ? museumData.facilities.join(', ') : (museumData.facilities || ''),
          interesting_facts: Array.isArray(museumData.interesting_facts) ? museumData.interesting_facts.join(', ') : (museumData.interesting_facts || ''),
        };
        console.log('Loaded form data:', formData);
        setForm(formData);
        setCurrentUserMuseumId(museumData.id);
        setPageMode("Edit");
      } else { // User has no museum - Create Mode
        setForm({...initialMuseumState, user_id: user.id }); // Set user_id for new museum
        setCurrentUserMuseumId(null);
        setPageMode("Create");
      }
      setIsLoading(false);
    };

    loadUserDataAndMuseum();
  }, [supabase, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  /**
   * Handles changes to opening/closing hours
   * @param {string} day - The day of the week (e.g., "Monday")
   * @param {string} field - Either 'open' or 'close'
   * @param {string} value - The new time value
   */
  const handleHourChange = (day, field, value) => {
    setForm(prevForm => {
      const currentHours = prevForm.opening_hours || {};
      const currentDayHours = currentHours[day] || "";
      
      // Helper to clean and format time values
      const cleanTimeValue = (timeStr) => {
        if (!timeStr || timeStr === "Closed") return "";
        // Remove AM/PM and extra spaces, ensure 4-digit time
        return timeStr.replace(/\s*[AP]M\s*/i, '').trim();
      };

      // Handle setting to 'Closed'
      if (field === 'open' && value === 'Closed') {
        return {
          ...prevForm,
          opening_hours: {
            ...currentHours,
            [day]: "Closed"
          }
        };
      }
      
      // Handle time changes
      if (currentDayHours === "Closed") {
        // If day was closed, initialize with new time
        const newTime = field === 'open' 
          ? `${value} - ` 
          : ` - ${value}`;
        
        return {
          ...prevForm,
          opening_hours: {
            ...currentHours,
            [day]: newTime.trim()
          }
        };
      }
      
      // Handle existing time range
      const [currentOpen = "", currentClose = ""] = currentDayHours.split(" - ");
      let newOpen = field === 'open' ? value : cleanTimeValue(currentOpen);
      let newClose = field === 'close' ? value : cleanTimeValue(currentClose);
      
      // Validate times
      if (newOpen && newClose) {
        try {
          const openTime = new Date(`2000-01-01T${newOpen}`);
          const closeTime = new Date(`2000-01-01T${newClose}`);
          
          if (openTime >= closeTime) {
            // If opening time is after or equal to closing time, adjust closing time
            openTime.setHours(openTime.getHours() + 1);
            newClose = `${String(openTime.getHours()).padStart(2, '0')}:${String(openTime.getMinutes()).padStart(2, '0')}`;
          }
        } catch (e) {
          console.error('Error parsing time:', e);
        }
      }
      
      // Format the new hours string
      const newHours = newOpen || newClose 
        ? `${newOpen || ""} - ${newClose || ""}`.trim()
        : "";
      
      return {
        ...prevForm,
        opening_hours: {
          ...currentHours,
          [day]: newHours || "Closed"
        }
      };
    });
  };
  
  // Generate time options for the time input
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      ['00', '15', '30', '45'].forEach(minute => {
        const timeString = `${String(hour).padStart(2, '0')}:${minute}`;
        times.push(timeString);
      });
    }
    return times;
  };
  
  const timeOptions = generateTimeOptions();

  /**
   * Renders a row for a single day's opening hours
   * @param {string} day - The day of the week (e.g., "Monday")
   * @param {number} index - The index of the day in the week
   * @returns {JSX.Element} The rendered day row component
   */
  /**
   * Renders a row for a single day's opening hours
   * @param {string} day - The day of the week (e.g., "Monday")
   * @returns {JSX.Element} The rendered day row component
   */
  const renderDayRow = (day) => {
    const dayHours = form.opening_hours?.[day] || "";
    const [openTime = "", closeTime = ""] = dayHours === "Closed" 
      ? ["Closed", ""] 
      : dayHours.split(" - ").map(s => s.trim());
    
    const isClosed = openTime === "Closed";
    
    return (
      <div key={day} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
        <div className="font-medium text-gray-700 dark:text-gray-200">{day}</div>
        
        {/* Open Time Input */}
        <div className="flex items-center">
          <label htmlFor={`open-${day}`} className="text-sm text-gray-600 dark:text-gray-300 mr-2 whitespace-nowrap">
            Open:
          </label>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <TimePicker
                value={isClosed ? "" : openTime}
                onChange={(value) => handleHourChange(day, 'open', value)}
                className="flex-1"
                disabled={isClosed}
              />
              <button
                type="button"
                onClick={() => handleHourChange(day, 'open', isClosed ? '09:00' : 'Closed')}
                className={`px-3 py-1.5 text-xs rounded-md border ${
                  isClosed 
                    ? 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200' 
                    : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {isClosed ? 'Closed' : 'Set Closed'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Close Time Input */}
        <div className="flex items-center">
          <label htmlFor={`close-${day}`} className="text-sm text-gray-600 dark:text-gray-300 mr-2 whitespace-nowrap">
            Close:
          </label>
          <div className="flex-1">
            <TimePicker
              value={isClosed ? "" : closeTime}
              onChange={(value) => handleHourChange(day, 'close', value)}
              disabled={isClosed || !openTime}
              className={isClosed || !openTime ? 'opacity-50' : ''}
            />
          </div>
        </div>
      </div>
    );
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
    console.log('Form submission started');
    
    if (!supabase || !userId) {
      const errorMsg = 'User not identified or Supabase client not available.';
      console.error(errorMsg);
      setFormMessage({ type: 'error', text: errorMsg });
      return;
    }

    if (!form.name.trim()) {
      const errorMsg = 'Museum name is required.';
      console.error(errorMsg);
      setFormMessage({ type: 'error', text: errorMsg });
      setActiveTab(0);
      return;
    }

    setIsSaving(true);
    setFormMessage(null);

    try {
      console.log('Preparing museum data...');
      
      console.log('Preparing to save opening hours:', form.opening_hours);
      
      /**
       * Formats a time string to 12-hour format with AM/PM
       * @param {string} timeStr - Time string in 24-hour format (HH:MM)
       * @returns {string} Formatted time (e.g., '2:30 PM')
       */
      const formatTime = (timeStr) => {
        if (!timeStr || String(timeStr).toLowerCase() === 'closed') return 'Closed';
        
        // If time already has AM/PM, clean it first
        const cleanTime = String(timeStr).replace(/\s*[AP]M\s*/i, '').trim();
        
        // Handle 24-hour format (HH:MM)
        const [hours, minutes = '00'] = cleanTime.split(':');
        const hour = parseInt(hours, 10);
        if (isNaN(hour) || hour < 0 || hour > 23) {
          console.warn('Invalid hour value:', timeStr);
          return 'Invalid time';
        }
        
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12; // Convert 0 or 24 to 12
        return `${displayHour}:${minutes.padEnd(2, '0')} ${ampm}`;
      };

      // Prepare the opening hours in the required format
      const formattedOpeningHours = {};
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      // Process each day's opening hours
      days.forEach(day => {
        const dayHours = form.opening_hours?.[day] || '';
        
        if (dayHours === 'Closed' || !dayHours) {
          formattedOpeningHours[day] = 'Closed';
          return;
        }
        
        // Handle format like "9:00 AM - 5:00 PM"
        const [openTime, closeTime] = dayHours.split(' - ').map(s => s.trim());
        
        if (!openTime || !closeTime) {
          formattedOpeningHours[day] = 'Closed';
          return;
        }
        
        // Format the time range
        formattedOpeningHours[day] = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
      });
      
      console.log('Formatted opening hours for save:', formattedOpeningHours);

      // Prepare the museum payload
      const museumData = {
        ...form,
        user_id: userId,
        // Process array fields
        facilities: form.facilities.split(',').map(s => s.trim()).filter(s => s),
        interesting_facts: form.interesting_facts.split(',').map(s => s.trim()).filter(s => s),
        // Format opening hours
        opening_hours: formattedOpeningHours,
        // Add the ID for updates
        ...(currentUserMuseumId && { id: currentUserMuseumId })
      };
      
      console.log('Formatted opening hours:', formattedOpeningHours);

      console.log('Museum data prepared:', museumData);

      // Ensure we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found. Please log in again.');
      }

      console.log('Sending data to Supabase...');
      
      // Make sure we're using the authenticated user's ID
      museumData.user_id = session.user.id;
      
      // Use upsert which will handle both insert and update
      const { data, error } = await supabase
        .from('museums')
        .upsert({
          ...museumData,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id',
          returning: 'representation'
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Supabase response:', data);

      if (!data || data.length === 0) {
        throw new Error('No data returned from server');
      }

      const savedMuseum = data[0];
      console.log('Saved museum data:', savedMuseum);

      // Update the form with the saved data
      const updatedFormData = {
        ...savedMuseum,
        facilities: Array.isArray(savedMuseum.facilities) ? savedMuseum.facilities.join(', ') : '',
        interesting_facts: Array.isArray(savedMuseum.interesting_facts) ? savedMuseum.interesting_facts.join(', ') : '',
      };

      setForm(updatedFormData);
      
      if (currentUserMuseumId) {
        setFormMessage({ type: 'success', text: 'Museum updated successfully!' });
      } else {
        setCurrentUserMuseumId(savedMuseum.id);
        setPageMode('Edit');
        setFormMessage({ type: 'success', text: 'Museum created successfully!' });
      }
      
      console.log('Form updated with saved data');
    } catch (error) {
      console.error(`Error ${currentUserMuseumId ? 'updating' : 'creating'} museum:`, error);
      setFormMessage({ 
        type: 'error', 
        text: `Failed to ${currentUserMuseumId ? 'update' : 'create'} museum: ${error.message}` 
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading museum data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-600">
            {pageMode === "Create" ? "Create Your Museum" : "Edit Your Museum"}
          </h2>
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
            disabled={isLoading || (formMessage?.type === 'error' && !userId)} // Disable tabs if not logged in
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
        {/* Disable form fields if not logged in or during initial load */}
        <fieldset className="m-0 p-0 border-0" disabled={isLoading || (formMessage?.type === 'error' && !userId) || isSaving}>
          {activeTab === 0 && ( // Basic Info
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Museum Name</label>
                <input id="name" name="name" value={form.name || ""} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" required />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input id="location" name="location" value={form.location || ""} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" name="description" value={form.description || ""} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input id="contact_phone" name="contact_phone" value={form.contact_phone || ""} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" />
                </div>
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input id="contact_email" name="contact_email" type="email" value={form.contact_email || ""} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" />
                </div>
              </div>
              <div>
                <label htmlFor="facilities" className="block text-sm font-medium text-gray-700 mb-1">Facilities (comma-separated)</label>
                <input id="facilities" name="facilities" value={form.facilities || ""} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" placeholder="e.g., Wheelchair access, Guided tours" />
              </div>
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input id="image_url" name="image_url" type="url" value={form.image_url || ""} onChange={handleChange} className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" placeholder="https://example.com/image.jpg" />
              </div>
            </div>
          )}
          {activeTab === 1 && ( // Opening Hours
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Opening Hours</h3>
              {(() => {
                try {
                  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                  
                  // If no opening hours exist, initialize with empty object
                  if (!form || !form.opening_hours || typeof form.opening_hours !== 'object') {
                    console.log('Initializing empty opening hours');
                    return days.map(day => renderDayRow(day));
                  }
                  
                  // Render each day with its opening hours
                  return days.map(day => renderDayRow(day));
                } catch (error) {
                  console.error('Error rendering opening hours:', error);
                  return (
                    <div className="text-red-500 text-sm">
                      Error loading opening hours. Please refresh the page or contact support.
                    </div>
                  );
                }
              })()}
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
                  value={form.about || ""}
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
                  value={form.interesting_facts || ""}
                  onChange={handleChange}
                  className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                  rows={4}
                  placeholder="e.g., Fact one, Fact two, Fact three"
                />
              </div>
            </div>
          )}
        </fieldset>
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-70"
            disabled={isLoading || (formMessage?.type === 'error' && !userId) || isSaving}
          >
            {isSaving ? (pageMode === "Create" ? "Creating..." : "Saving...") : (pageMode === "Create" ? "Create Museum" : "Save Changes")}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default MuseumDetailsPage;

