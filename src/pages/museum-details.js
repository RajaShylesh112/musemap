import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function MuseumDetailsPage() {
    const [activeTab, setActiveTab] = useState('about');
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
            const { data: museum, error } = await supabase
                .from('museums')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (museum) {
                setMuseumData({
                    ...museum,
                    openingHours: museum.opening_hours,
                    exhibits: museum.exhibits || [],
                    facilities: museum.facilities || []
                });
            }
            setLoading(false);
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
                            className={`px-4 py-2 capitalize hover:scale-105 transition-transform ${ // Hover effect
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
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center" // Added flex and items-center
                            onClick={() => navigate('/booking')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v2a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H4zM2 11a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm2-1a1 1 0 00-1 1v2a1 1 0 001 1h12a1 1 0 001-1v-2a1 1 0 00-1-1H4z" clipRule="evenodd" />
                            </svg>
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