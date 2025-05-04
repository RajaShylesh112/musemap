import React from 'react';
import facebookIcon from '../assets/images/facebook-icon.png';
import twitterIcon from '../assets/images/twitter-icon.png';
import instagramIcon from '../assets/images/instagram-icon.png';

export function Footer() {
    return (
        <footer className="bg-peach-100 py-6 sm:py-8 mt-auto dark:bg-gray-800 dark:text-orange-300">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col items-center">
                    <div className="flex space-x-8 mb-6">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                            <img src={facebookIcon} alt="Facebook" className="w-6 h-6" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                            <img src={twitterIcon} alt="Twitter" className="w-6 h-6" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                            <img src={instagramIcon} alt="Instagram" className="w-6 h-6" />
                        </a>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 dark:text-orange-300">
                        <a href="/contact" className="text-gray-700 hover:text-orange-500 px-2 py-1 dark:text-orange-300 dark:hover:text-orange-400">Contact Us</a>
                        <a href="/privacy" className="text-gray-700 hover:text-orange-500 px-2 py-1 dark:text-orange-300 dark:hover:text-orange-400">Privacy Policy</a>
                        <a href="/terms" className="text-gray-700 hover:text-orange-500 px-2 py-1 dark:text-orange-300 dark:hover:text-orange-400">Terms of Service</a>
                        <a href="/about" className="text-gray-700 hover:text-orange-500 px-2 py-1 dark:text-orange-300 dark:hover:text-orange-400">About</a>
                    </div>
                    <p className="text-gray-600 text-center text-sm sm:text-base dark:text-orange-200">&copy; 2025 MuseMap. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}