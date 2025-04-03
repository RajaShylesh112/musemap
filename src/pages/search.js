import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import museumImg2 from '../assets/images/museum-img2.jpg';
import museumImg3 from '../assets/images/museum-img3.jpg';

export function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        type: '',
        price: ''
    });

    const museums = [
        {
            id: 1,
            name: "National Museum, New Delhi",
            description: "Explore India's rich cultural heritage with artifacts spanning thousands of years.",
            image: museumImg2,
            location: "Delhi",
            type: "History",
            price: "₹50"
        },
        {
            id: 2,
            name: "Indian Museum, Kolkata",
            description: "The oldest and largest museum in India, showcasing rare antiques and fossils.",
            image: museumImg3,
            location: "Kolkata",
            type: "Art",
            price: "₹30"
        },
        {
            id: 3,
            name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
            description: "A grand museum featuring art, archaeology, and natural history exhibits.",
            image: museumImg2,
            location: "Mumbai",
            type: "History",
            price: "₹40"
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
        const matchesType = !filters.type || museum.type === filters.type;
        return matchesSearch && matchesLocation && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h1 className="text-3xl font-bold text-center mb-8">Search Museums</h1>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Search by museum name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <option value="Art">Art</option>
                                <option value="History">History</option>
                                <option value="Science">Science</option>
                            </select>
                            <select
                                name="price"
                                value={filters.price}
                                onChange={handleFilterChange}
                                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">All Prices</option>
                                <option value="low">Under ₹30</option>
                                <option value="medium">₹30 - ₹50</option>
                                <option value="high">Above ₹50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMuseums.map(museum => (
                        <div key={museum.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <img 
                                src={museum.image} 
                                alt={museum.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold">{museum.name}</h3>
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                        {museum.price}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">{museum.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        {museum.location} • {museum.type}
                                    </span>
                                    <Link 
                                        to={`/museum/${museum.id}`}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
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