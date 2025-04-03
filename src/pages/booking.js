import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabase';

export function BookingPage() {
    const [bookingData, setBookingData] = useState({
        museumId: '',
        date: '',
        time: '',
        numberOfTickets: 1,
        totalAmount: 0
    });
    const [step, setStep] = useState(1); // 1: Select Date/Time, 2: Review & Pay, 3: Confirmation
    const navigate = useNavigate();
    const supabase = getSupabase();

    // Available time slots
    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00", 
        "14:00", "15:00", "16:00", "17:00"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value,
            totalAmount: name === 'numberOfTickets' ? parseInt(value) * 100 : prev.totalAmount // 100 is ticket price
        }));
    };

    const handleDateTimeSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePayment = async () => {
        try {
            // Here you would integrate with your payment gateway
            // For now, we'll simulate a successful payment
            
            // Save booking to database
            const { data, error } = await supabase
                .from('bookings')
                .insert([
                    {
                        museum_id: bookingData.museumId,
                        date: bookingData.date,
                        time: bookingData.time,
                        number_of_tickets: bookingData.numberOfTickets,
                        total_amount: bookingData.totalAmount,
                        status: 'confirmed'
                    }
                ]);

            if (error) throw error;

            // Move to confirmation step
            setStep(3);
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment failed. Please try again.');
        }
    };

    const renderDateTimeSelection = () => (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date and Time</h2>
            <form onSubmit={handleDateTimeSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingData.date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Time
                    </label>
                    <select
                        name="time"
                        required
                        value={bookingData.time}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="">Select a time</option>
                        {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Number of Tickets
                    </label>
                    <input
                        type="number"
                        name="numberOfTickets"
                        min="1"
                        max="10"
                        required
                        value={bookingData.numberOfTickets}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Continue to Payment
                </button>
            </form>
        </div>
    );

    const renderPayment = () => (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review and Payment</h2>
            <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{bookingData.date}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Number of Tickets:</span>
                    <span className="font-medium">{bookingData.numberOfTickets}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{bookingData.totalAmount}</span>
        </div>
      </div>

            <div className="space-y-4">
                <button
                    onClick={handlePayment}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Pay Now
                </button>
                <button
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Back
                </button>
            </div>
        </div>
    );

    const renderConfirmation = () => (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
                Your booking has been confirmed. A confirmation email has been sent to your registered email address.
            </p>
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    View My Bookings
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Return to Home
                </button>
      </div>
    </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Progress Steps */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="flex justify-between">
                        <div className={`flex flex-col items-center ${step >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-orange-500 bg-orange-100' : 'border-gray-400'}`}>
                                1
                            </div>
                            <span className="text-sm mt-1">Select Date</span>
                        </div>
                        <div className={`flex flex-col items-center ${step >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-orange-500 bg-orange-100' : 'border-gray-400'}`}>
                                2
                            </div>
                            <span className="text-sm mt-1">Payment</span>
                        </div>
                        <div className={`flex flex-col items-center ${step >= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-orange-500 bg-orange-100' : 'border-gray-400'}`}>
                                3
                            </div>
                            <span className="text-sm mt-1">Confirmation</span>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                {step === 1 && renderDateTimeSelection()}
                {step === 2 && renderPayment()}
                {step === 3 && renderConfirmation()}
            </div>
        </div>
    );
}