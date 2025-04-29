import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faIndianRupeeSign, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

// Simple Error Boundary (keep as is or remove if not needed)
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("Caught error: ", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return <div className="p-4 text-red-600">Something went wrong displaying this part.</div>;
        }
        return this.props.children;
    }
}


export function MuseumDetailsPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [museumData, setMuseumData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchMuseumData();
    }, [id]);

    const fetchMuseumData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: museum, error: museumError } = await supabase
                .from('museums')
                .select(`
                    *,
                    opening_hours,
                    image_url,
                    facilities,
                    ticket_price,
                    artifacts (*),
                    exhibitions (*)
                `)
                .eq('id', id)
                .single();

            if (museumError) throw museumError;
            if (!museum) throw new Error("Museum not found");

            console.log("Fetched Museum Data:", museum); // Keep for debugging

            setMuseumData({
                ...museum,
                artifacts: museum.artifacts || [],
                exhibitions: museum.exhibitions || [],
                facilities: museum.facilities || [],
                openingHours: museum.opening_hours || {},
                imageUrl: museum.image_url,
                about: museum.description || '', // Keep using description as 'about'
                interestingFacts: museum.interesting_facts || [], // Keep fetching
                ticketPrice: museum.ticket_price || {},
                rating: museum.rating || 4.2,
                visitorCount: museum.visitor_count || 1256
            });

        } catch (error) {
            console.error('Error fetching museum data:', error);
            setError(`Failed to load museum information: ${error.message}. Please try again later.`);
        } finally {
            setLoading(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Museum</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/museums')}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Back to Museums
                    </button>
                </div>
            </div>
        );
    }

    // Star Rendering Function (Simplified)
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesomeIcon
                    key={i}
                    icon={i <= Math.round(rating) ? faStarSolid : faStarRegular}
                    className={i <= Math.round(rating) ? "text-yellow-500" : "text-gray-300"}
                />
            );
        }
        return stars;
    };


    return (
        <ErrorBoundary>
            {/* Increased bottom padding */}
            <div className="museum-details-container bg-gray-100 min-h-screen pb-24">
                {/* Hero Section - Increased height and padding */}
                <div className="relative h-[350px] md:h-[450px] w-full bg-gray-400">
                    <img
                        src={museumData?.imageUrl || "https://via.placeholder.com/1920x400"}
                        alt={museumData?.name}
                        className="object-cover w-full h-full absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {/* Increased padding */}
                    <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
                        {/* Increased font size */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{museumData?.name}</h1>
                        {museumData?.location && (
                            // Increased font size and margin
                            <div className="text-gray-200 flex items-center text-base mb-3">
                                {/* Location Icon (optional) */}
                                {museumData.location}
                            </div>
                        )}
                        <div className="flex items-center mt-2">
                            {renderStars(museumData?.rating || 0)}
                            {/* Increased font size */}
                            <span className="text-gray-200 ml-3 text-sm md:text-base">
                                ({museumData?.rating?.toFixed(1)}/5 from {museumData?.visitorCount?.toLocaleString()} visitors)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Increased margin-top and padding */}
                <div className="max-w-7xl mx-auto mt-10 px-4 md:px-6">
                    {/* Increased gap */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                        {/* Left Column - Increased padding */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 md:p-8">
                            {/* Tabs - Increased margin-bottom and spacing */}
                            <div className="tabs mb-6 border-b border-gray-200">
                                {/* Increased spacing */}
                                <div className="flex space-x-6 md:space-x-8">
                                    {['overview', 'key Artifacts', 'exhibitions'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            // Increased padding and font size
                                            className={`pb-3 px-1 capitalize font-medium text-base ${activeTab === tab
                                                ? 'border-b-2 border-orange-500 text-orange-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab.replace(/([A-Z])/g, ' $1')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content Area - Increased margin-top */}
                            <div className="content mt-8">
                                {activeTab === 'overview' && (
                                    // Increased spacing
                                    <div className="space-y-6">
                                        {/* Increased font size and margin */}
                                        <h2 className="text-xl md:text-2xl font-semibold mb-3">Overview</h2>
                                        {museumData?.about ? (
                                            // Increased font size and line height
                                            <p className="text-gray-700 text-base leading-relaxed">{museumData.about}</p>
                                        ) : (
                                            <p className="text-gray-500 text-base">Overview information not available.</p>
                                        )}
                                        {museumData?.interestingFacts && museumData.interestingFacts.length > 0 && (
                                            // Increased margin-top
                                            <div className="mt-4">
                                                {/* Increased font size and margin */}
                                                <h3 className="font-semibold text-lg mb-2">Interesting Facts:</h3>
                                                {/* Increased font size and spacing */}
                                                <ul className="list-disc list-inside text-base text-gray-600 space-y-1.5">
                                                    {museumData.interestingFacts.map((fact, i) => <li key={i}>{fact}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                         {museumData?.facilities && museumData.facilities.length > 0 && (
                                            // Increased margin-top
                                            <div className="mt-4">
                                                {/* Increased font size and margin */}
                                                <h3 className="font-semibold text-lg mb-2">Facilities:</h3>
                                                {/* Increased font size and spacing */}
                                                <ul className="list-disc list-inside text-base text-gray-600 space-y-1.5">
                                                    {museumData.facilities.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'key Artifacts' && (
                                    // Apply grid layout and gap from example
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {museumData?.artifacts && museumData.artifacts.length > 0 ? (
                                            museumData.artifacts.map((artifact) => (
                                                // Apply card styling from example (using div for consistency)
                                                <div
                                                    key={artifact.id} // Use artifact ID as key
                                                    className="group relative h-80 overflow-hidden rounded-xl transition-all duration-500 hover:scale-[1.02]"
                                                >
                                                    {/* Overlay */}
                                                    <div className="absolute inset-0 bg-black/20 transition-all duration-500 group-hover:bg-black/40" />
                                                    {/* Image */}
                                                    <img
                                                        src={artifact.image_url || "https://via.placeholder.com/800x500"} // Use image_url from schema, provide fallback
                                                        alt={artifact.name} // Use name from schema
                                                        // Apply image styling from example (using img tag)
                                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                                    />
                                                    {/* Text Content Container */}
                                                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                                                        {/* Text Animation Container */}
                                                        <div className="transform transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                            {/* Period */}
                                                            {artifact.period && ( // Check if period exists
                                                                <p className="text-orange-400 font-medium text-sm mb-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                                    {artifact.period} {/* Use period from schema */}
                                                                </p>
                                                            )}
                                                            {/* Name */}
                                                            <h3 className="text-white text-xl font-bold mb-2">
                                                                {artifact.name} {/* Use name from schema */}
                                                            </h3>
                                                            {/* Description */}
                                                            {artifact.description && ( // Check if description exists
                                                                <p className="text-white/80 text-sm max-h-0 overflow-hidden transition-all duration-500 group-hover:max-h-20">
                                                                    {artifact.description} {/* Use description from schema */}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            // Fallback message, ensure it spans columns
                                            <p className="text-gray-500 text-base md:col-span-2">No key artifacts listed.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'exhibitions' && (
                                    // Use space-y-6 for spacing between cards
                                    <div className="space-y-6">
                                        {museumData?.exhibitions && museumData.exhibitions.length > 0 ? (
                                            museumData.exhibitions.map((exhibition) => {
                                                // Function to format date nicely (e.g., "April 29, 2025")
                                                const formatDate = (dateString) => {
                                                    if (!dateString) return '';
                                                    return new Date(dateString).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    });
                                                };

                                                // --- Add this log ---
                                                console.log("Checking exhibition status:", exhibition.status);
                                                // --------------------

                                                // Determine badge color based on status
                                                let badgeClass = 'bg-gray-500'; // Default/Past
                                                if (exhibition.status?.toLowerCase() === 'current') {
                                                    badgeClass = 'bg-green-500'; // Green for Current
                                                } else if (exhibition.status?.toLowerCase() === 'upcoming') {
                                                    badgeClass = 'bg-blue-500'; // Blue for Upcoming
                                                }

                                                return (
                                                    // Apply card styling from example
                                                    <div key={exhibition.id} className="border border-gray-200 rounded-lg p-4">
                                                        {/* Status Badge */}
                                                        {exhibition.status && (
                                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${badgeClass}`}>
                                                                {exhibition.status}
                                                            </span>
                                                        )}
                                                        {/* Title */}
                                                        <h3 className="text-xl font-semibold mt-2">{exhibition.title}</h3>
                                                        {/* Dates */}
                                                        {(exhibition.start_date || exhibition.end_date) && (
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(exhibition.start_date)}
                                                                {exhibition.start_date && exhibition.end_date ? ' - ' : ''}
                                                                {formatDate(exhibition.end_date)}
                                                            </p>
                                                        )}
                                                        {/* Description */}
                                                        {exhibition.description && (
                                                            <p className="mt-2 text-gray-700 text-base leading-relaxed">{exhibition.description}</p>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // Fallback message
                                            <p className="text-gray-500 text-base">No exhibitions listed.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Increased spacing */}
                        <div className="lg:col-span-1 space-y-8 lg:space-y-10">
                            {/* Visiting Hours Card - Increased padding and spacing */}
                            <div className="bg-white shadow-md rounded-lg p-6">
                                {/* Increased font size and margin */}
                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faClock} className="mr-2.5 text-orange-500" />
                                    Visiting Hours
                                </h2>
                                {/* Increased spacing and font size */}
                                <div className="space-y-2.5 text-base">
                                    {museumData?.openingHours && typeof museumData.openingHours === 'object' && Object.keys(museumData.openingHours).length > 0 ? (
                                        Object.entries(museumData.openingHours)
                                            .filter(([key]) => key.toLowerCase() !== 'notes')
                                            .map(([key, value]) => (
                                                // Increased padding
                                                <div key={key} className="flex justify-between py-1">
                                                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-gray-800 font-medium">{String(value)}</span>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-gray-500">Hours not available.</p>
                                    )}
                                    {museumData?.openingHours?.notes && typeof museumData.openingHours.notes === 'string' && (
                                         // Increased margin/padding and font size
                                         <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">{museumData.openingHours.notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Ticket Information Card - Increased padding and spacing */}
                             <div className="bg-white shadow-md rounded-lg p-6">
                                {/* Increased font size and margin */}
                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faIndianRupeeSign} className="mr-2.5 text-orange-500" />
                                    Ticket Information
                                </h2>
                                {/* Increased spacing and font size */}
                                <div className="space-y-2.5 text-base">
                                    {museumData?.ticketPrice && typeof museumData.ticketPrice === 'object' && Object.keys(museumData.ticketPrice).length > 0 ? (
                                        Object.entries(museumData.ticketPrice).map(([key, value]) => {
                                            const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                            if (value === null || value === undefined || typeof value === 'object') return null;
                                            const formattedValue = value === 0 ? 'Free' : `₹${value}`;
                                            return (
                                                // Increased padding
                                                <div key={key} className="flex justify-between py-1">
                                                    <span className="text-gray-600">{formattedKey}</span>
                                                    <span className="text-gray-800 font-medium">{formattedValue}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-gray-500">Ticket info not available.</p>
                                    )}
                                    {/* Increased button padding and font size */}
                                    <button className="bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 text-base font-medium w-full mt-5">Book Tickets</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}