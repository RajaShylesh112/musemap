import React from 'react';
import { Link } from 'react-router-dom';

export function PaymentSuccessPage() {
    const bookingDetails = {
        bookingId: "#123456",
        museum: "Example Museum",
        date: "March 10, 2025",
        tickets: "2 Adults, 1 Child",
        totalPaid: "$50.00"
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-orange-500 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your booking. Your transaction was successful.
                </p>

                <div className="space-y-4 text-left mb-8">
                    <div className="flex justify-between">
                        <span className="font-bold">Booking ID:</span>
                        <span>{bookingDetails.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Museum:</span>
                        <span>{bookingDetails.museum}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Date:</span>
                        <span>{bookingDetails.date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Tickets:</span>
                        <span>{bookingDetails.tickets}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Total Paid:</span>
                        <span>{bookingDetails.totalPaid}</span>
                    </div>
                </div>

                <Link 
                    to="/"
                    className="inline-block bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
} 