import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSupabase } from '../supabase';

export function MuseumDetailsPage() {
    const [activeTab, setActiveTab] = useState('about');
    const [museumData, setMuseumData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const supabase = getSupabase();

    useEffect(() => {
        fetchMuseumData();
    }, [id]);

    const fetchMuseumData = async () => {
        try {
            setLoading(true);
            
            // In a real app, you would fetch from your database
            // For now, we'll use mock data based on the ID
            const mockMuseums = {
                1: {
                    id: 1,
                    name: "National Museum, New Delhi",
                    location: "Janpath, New Delhi, India",
                    description: "The National Museum, New Delhi is one of the largest museums in India. Established in 1949, it holds a variety of articles ranging from pre-historic era to modern works of art. It functions under the Ministry of Culture, Government of India.",
                    openingHours: {
                        monday: "10:00 AM - 6:00 PM",
                        tuesday: "10:00 AM - 6:00 PM",
                        wednesday: "10:00 AM - 6:00 PM",
                        thursday: "10:00 AM - 6:00 PM",
                        friday: "10:00 AM - 6:00 PM",
                        saturday: "10:00 AM - 8:00 PM",
                        sunday: "10:00 AM - 6:00 PM"
                    },
                    exhibits: [
                        {
                            name: "Ancient Civilizations",
                            description: "Explore artifacts from ancient India, including Indus Valley Civilization",
                            duration: "1-2 hours"
                        },
                        {
                            name: "Medieval Period",
                            description: "Art and artifacts from the medieval period of Indian history",
                            duration: "1 hour"
                        },
                        {
                            name: "Modern Art Gallery",
                            description: "Contemporary Indian art from the 20th century",
                            duration: "30-45 minutes"
                        }
                    ],
                    facilities: [
                        "Café",
                        "Gift Shop",
                        "Wheelchair Access",
                        "Audio Guide",
                        "Guided Tours"
                    ]
                },
                2: {
                    id: 2,
                    name: "Indian Museum, Kolkata",
                    location: "Park Street, Kolkata, India",
                    description: "The Indian Museum in Kolkata is the oldest and largest museum in India. Founded in 1814, it has rare collections of antiques, armor and ornaments, fossils, skeletons, mummies, and Mughal paintings.",
                    openingHours: {
                        monday: "10:00 AM - 5:00 PM",
                        tuesday: "10:00 AM - 5:00 PM",
                        wednesday: "10:00 AM - 5:00 PM",
                        thursday: "10:00 AM - 5:00 PM",
                        friday: "10:00 AM - 5:00 PM",
                        saturday: "10:00 AM - 5:00 PM",
                        sunday: "Closed"
                    },
                    exhibits: [
                        {
                            name: "Archaeology Gallery",
                            description: "Ancient artifacts and archaeological findings",
                            duration: "1-2 hours"
                        },
                        {
                            name: "Natural History",
                            description: "Fossils and specimens from prehistoric times",
                            duration: "1 hour"
                        },
                        {
                            name: "Art Gallery",
                            description: "Paintings and sculptures from various periods",
                            duration: "45 minutes"
                        }
                    ],
                    facilities: [
                        "Library",
                        "Research Center",
                        "Wheelchair Access",
                        "Guided Tours",
                        "Photography Allowed"
                    ]
                },
                3: {
                    id: 3,
                    name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya, Mumbai",
                    location: "Fort, Mumbai, India",
                    description: "Formerly known as the Prince of Wales Museum, this museum was founded in the early 20th century. It houses approximately 50,000 exhibits of ancient Indian history as well as objects from foreign lands.",
                    openingHours: {
                        monday: "10:15 AM - 6:00 PM",
                        tuesday: "10:15 AM - 6:00 PM",
                        wednesday: "10:15 AM - 6:00 PM",
                        thursday: "10:15 AM - 6:00 PM",
                        friday: "10:15 AM - 6:00 PM",
                        saturday: "10:15 AM - 6:00 PM",
                        sunday: "Closed"
                    },
                    exhibits: [
                        {
                            name: "Indian Miniature Paintings",
                            description: "Collection of miniature paintings from various schools",
                            duration: "1 hour"
                        },
                        {
                            name: "Natural History Section",
                            description: "Exhibits showcasing India's biodiversity",
                            duration: "45 minutes"
                        },
                        {
                            name: "Arms and Armour",
                            description: "Historical weapons and armor from different periods",
                            duration: "30 minutes"
                        }
                    ],
                    facilities: [
                        "Cafeteria",
                        "Book Shop",
                        "Wheelchair Access",
                        "Audio Guide",
                        "Photography Allowed"
                    ]
                }
            };

            // Simulate API call delay
            setTimeout(() => {
                const museum = mockMuseums[id] || mockMuseums[1]; // Default to first museum if ID not found
                setMuseumData(museum);
                setLoading(false);
            }, 500);

        } catch (error) {
            console.error('Error fetching museum data:', error);
            setError('Failed to load museum information. Please try again later.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
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

    return (
        <div className="museum-details-container max-w-6xl mx-auto p-8">
            <div className="header mb-8">
                <h1 className="text-4xl font-bold mb-2">{museumData.name}</h1>
                <p className="text-gray-600">{museumData.location}</p>
          </div>

            <div className="tabs mb-6">
                <div className="flex space-x-4 border-b">
                    {['about', 'exhibits', 'facilities', 'hours'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 capitalize ${
                                activeTab === tab
                                    ? 'border-b-2 border-orange-500 text-orange-500'
                                    : 'text-gray-600 hover:text-orange-500'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
          </div>
        </div>

            <div className="content">
                {activeTab === 'about' && (
                    <div className="space-y-4">
                        <p className="text-gray-700">{museumData.description}</p>
                        <button 
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            onClick={() => navigate('/booking')}
                        >
                            Book Tickets
                        </button>
                    </div>
                )}

                {activeTab === 'exhibits' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {museumData.exhibits.map((exhibit, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold mb-2">{exhibit.name}</h3>
                                <p className="text-gray-600 mb-2">{exhibit.description}</p>
                                <p className="text-sm text-gray-500">Duration: {exhibit.duration}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'facilities' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {museumData.facilities.map((facility, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <span className="text-orange-500">✓</span>
                                <span>{facility}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'hours' && (
                    <div className="space-y-2">
                        {Object.entries(museumData.openingHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between py-2 border-b">
                                <span className="capitalize">{day}</span>
                                <span>{hours}</span>
                            </div>
                        ))}
        </div>
                )}
      </div>
    </div>
    );
}