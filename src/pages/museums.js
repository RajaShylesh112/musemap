import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../supabase'; // Changed import
import museumImg1 from '../assets/images/museum-img1.jpg';
import museumImg2 from '../assets/images/museum-img2.jpg';
import museumImg3 from '../assets/images/museum-img3.jpg';

export function MuseumsPage() {
    const [museums, setMuseums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uniqueTypes, setUniqueTypes] = useState([]);
    const [uniqueCities, setUniqueCities] = useState([]);
    const [filters, setFilters] = useState({
        location: '',
        type: '',
        price: ''
    });
    
    const supabase = getSupabase(); // Get Supabase client instance

    useEffect(() => {
        const fetchMuseums = async () => {
            if (!supabase) {
                console.error("Supabase client not available for fetching museums.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true); // Ensure loading is true at the start of fetch
                const { data: museumsData, error: museumsError } = await supabase
                    .from('museums')
                    .select('*');

                if (museumsError) throw museumsError;
                
                // Get unique types from museums
                const types = [...new Set(museumsData
                    .map(museum => museum.type)
                    .filter(type => type) // Remove null/undefined
                )].sort();
                
                // Get unique cities from location strings (second part before comma)
                const cities = [...new Set(museumsData
                    .map(museum => {
                        if (!museum.location) return null;
                        const parts = museum.location.split(',').map(part => part.trim());
                        return parts.length > 1 ? parts[1] : null;
                    })
                    .filter(city => city) // Remove null/undefined
                )].sort();
                
                setMuseums(museumsData || []);
                setUniqueTypes(types);
                setUniqueCities(cities);
            } catch (error) {
                console.error('Error fetching museums:', error); // Uncommented error log
            } finally {
                setLoading(false);
            }
        };

        fetchMuseums();
    }, [supabase]); // Added supabase to dependency array

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
            
        // Extract city from location (second part before comma)
        const locationParts = museum.location ? museum.location.split(',').map(part => part.trim()) : [];
        const city = locationParts.length > 1 ? locationParts[1].toLowerCase() : '';
        
        const matchesLocation = !filters.location || 
            museum.location.toLowerCase().includes(filters.location.toLowerCase()) ||
            city.includes(filters.location.toLowerCase());
            
        const matchesType = !filters.type || 
            (museum.type && museum.type.toLowerCase() === filters.type.toLowerCase());
            
        // Price filter logic
        const matchesPrice = !filters.price || (() => {
            // Use indian_nationals price for filtering
            const price = parseFloat(museum.ticket_price?.indian_nationals);
            if (isNaN(price)) {
                return false; // No price information available
            }
            
            switch(filters.price) {
                case 'lt50': return price < 50;
                case '50-200': return price >= 50 && price <= 200;
                case '201-500': return price >= 201 && price <= 500;
                case 'gt500': return price > 500;
                default: return true;
            }
        })();
        
        return matchesSearch && matchesLocation && matchesType && matchesPrice;
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
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-orange-300"
                        >
                            <option value="">All Types</option>
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                        <select
                            name="price"
                            value={filters.price}
                            onChange={handleFilterChange}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-orange-300"
                        >
                            <option value="">All Prices</option>
                            <option value="lt50">Under ₹50</option>
                            <option value="50-200">₹50 - ₹200</option>
                            <option value="201-500">₹201 - ₹500</option>
                            <option value="gt500">Over ₹500</option>
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
                                        <Link
                                            to={`/booking/${museum.id}`}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded transition-colors dark:bg-orange-400 dark:hover:bg-orange-300 dark:text-gray-900"
                                        >
                                            Book Tickets
                                        </Link>
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