import React from 'react';
import facebookIcon from '../assets/images/facebook-icon.png';
import twitterIcon from '../assets/images/twitter-icon.png';
import instagramIcon from '../assets/images/instagram-icon.png';

export function Footer() {
    return (
        <footer className="bg-peach-100 py-8 mt-auto">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col items-center">
                    <div className="flex space-x-6 mb-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <img src={facebookIcon} alt="Facebook" className="w-6 h-6" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <img src={twitterIcon} alt="Twitter" className="w-6 h-6" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <img src={instagramIcon} alt="Instagram" className="w-6 h-6" />
                        </a>
                    </div>
                    <div className="flex space-x-8 mb-4">
                        <a href="/contact" className="text-gray-700 hover:text-orange-500">Contact Us</a>
                        <a href="/privacy" className="text-gray-700 hover:text-orange-500">Privacy Policy</a>
                        <a href="/terms" className="text-gray-700 hover:text-orange-500">Terms of Service</a>
                        <a href="/about" className="text-gray-700 hover:text-orange-500">About</a>
                    </div>
                    <p className="text-gray-600">© 2025 MuseMap. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
} 