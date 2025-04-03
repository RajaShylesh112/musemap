import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import museumImg2 from '../assets/images/museum-img2.jpg';
import museumImg3 from '../assets/images/museum-img3.jpg';

export function MuseumsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        type: '',
        hours: ''
    });

    const museums = [
        {
            id: 1,
            name: "National Museum, New Delhi",
            description: "Explore India's rich cultural heritage with artifacts spanning thousands of years.",
            image: museumImg2,
            location: "Delhi"
        },
        {
            id: 2,
            name: "Indian Museum, Kolkata",
            description: "The oldest and largest museum in India, showcasing rare antiques and fossils.",
            image: museumImg3,
            location: "Kolkata"
        },
        {
            id: 3,
            name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya, Mumbai",
            description: "A grand museum featuring art, archaeology, and natural history exhibits.",
            image: museumImg2,
            location: "Mumbai"
        }
    ];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredMuseums = museums.filter(museum => {
        const matchesSearch = museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            museum.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !filters.location || museum.location === filters.location;
        return matchesSearch && matchesLocation;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search museums..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <select
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">All Locations</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Kolkata">Kolkata</option>
                        </select>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">All Types</option>
                            <option value="art">Art</option>
                            <option value="history">History</option>
                            <option value="science">Science</option>
                        </select>
                        <select
                            name="hours"
                            value={filters.hours}
                            onChange={handleFilterChange}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">All Hours</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                        </select>
                    </div>
                </div>

                {/* Museum Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMuseums.map(museum => (
                        <div key={museum.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <img 
                                src={museum.image} 
                                alt={museum.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{museum.name}</h3>
                                <p className="text-gray-600 mb-4">{museum.description}</p>
                                <Link 
                                    to={`/museums/${museum.id}`}
                                    className="text-orange-500 hover:text-orange-600 font-medium"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredMuseums.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No museums found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}