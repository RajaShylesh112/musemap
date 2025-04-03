import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/images/home_page_img1.jpg';

export function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-screen">
                <div className="absolute inset-0">
                    <img 
                        src={heroImg} 
                        alt="Museum Hero" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </div>
                
                <div className="relative h-full flex items-center justify-center text-center px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Discover India's Museums
                        </h1>
                        <p className="text-xl text-white mb-8">
                            Explore the rich cultural heritage of India through our curated collection of museums
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/museums"
                                className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Explore Museums
                            </Link>
                            <Link 
                                to="/quiz"
                                className="bg-white text-orange-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Take Quiz
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
                            <p className="text-gray-600">Find museums based on location, type, and price range</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Interactive Quiz</h3>
                            <p className="text-gray-600">Test your knowledge about Indian museums and culture</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                            <p className="text-gray-600">Book museum visits and guided tours in advance</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}