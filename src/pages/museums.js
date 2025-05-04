import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import museumImg1 from '../assets/images/museum-img1.jpg';
import museumImg2 from '../assets/images/museum-img2.jpg';
import museumImg3 from '../assets/images/museum-img3.jpg';

export function MuseumsPage() {
    const [museums, setMuseums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        type: '',
        hours: ''
    });

    useEffect(() => {
        fetchMuseums();
    }, []);

    const fetchMuseums = async () => {
        try {
            const { data, error } = await supabase
                .from('museums')
                .select('*');

            if (error) throw error;
            setMuseums(data);
        } catch (error) {
            console.error('Error fetching museums:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const getImage = (museumName, imageUrl) => {
        if (imageUrl) {
            return imageUrl;
        }

        switch (museumName) {
            case "National Museum, New Delhi":
                return museumImg1;
            case "Indian Museum, Kolkata":
                return museumImg2;
            case "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya, Mumbai":
                return museumImg3;
            default:
                return museumImg2; // Default image if no match
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900 dark:text-orange-300">
            <div className="max-w-7xl mx-auto px-4">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8 dark:bg-gray-800 dark:text-orange-300">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search museums..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-orange-300 dark:placeholder-orange-200"
                        />
                        <select
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-orange-300"
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
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-orange-300"
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
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-orange-300"
                        >
                            <option value="">All Hours</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                        </select>
                    </div>
                </div>

                {/* Museum Cards */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMuseums.map(museum => (
                            <div key={museum.id} className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800 dark:text-orange-300">
                                <img
                                    src={getImage(museum.name, museum.image_url)}
                                    alt={museum.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 dark:text-orange-300">{museum.name}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-3 dark:text-orange-200">{museum.description}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <Link
                                            to={`/museums/${museum.id}`}
                                            className="text-orange-500 hover:text-orange-600 font-medium dark:text-orange-400 dark:hover:text-orange-300"
                                        >
                                            View Details
                                        </Link>
                                        <span className="text-gray-500 dark:text-orange-200">
                                            {museum.ticket_price && typeof museum.ticket_price === 'object' && museum.ticket_price.indian_nationals !== undefined
                                                ? `From ₹${museum.ticket_price.indian_nationals}`
                                                : 'Price Varies'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredMuseums.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-orange-300">No museums found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}