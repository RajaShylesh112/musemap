import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabase';

export function BookingPage() {
    const navigate = useNavigate();
    const supabase = getSupabase();

    const categoryPrices = {
        indian_nationals: 50,
        students_with_id: 20,
        children_below_12: 0,
        foreign_nationals: 650,
        photography_permit: 100
    };

    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00"
    ];

    const [step, setStep] = useState(1);

    const [bookingData, setBookingData] = useState({
        museumId: '',
        date: '',
        time: '',
        ticketCounts: {
            indian_nationals: 0,
            students_with_id: 0,
            children_below_12: 0,
            foreign_nationals: 0,
            photography_permit: 0
        },
        totalAmount: 0
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTicketCountChange = (e) => {
        const { name, value } = e.target;
        const newCount = Math.max(0, parseInt(value) || 0);

        setBookingData(prev => {
            const updatedCounts = { ...prev.ticketCounts, [name]: newCount };
            const total = Object.entries(updatedCounts)
                .reduce((sum, [key, count]) => sum + count * categoryPrices[key], 0);

            return {
                ...prev,
                ticketCounts: updatedCounts,
                totalAmount: total
            };
        });
    };

    const handleDateTimeSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePayment = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .insert([{
                    museum_id: bookingData.museumId,
                    date: bookingData.date,
                    time: bookingData.time,
                    ticket_counts: bookingData.ticketCounts,
                    total_amount: bookingData.totalAmount,
                    status: 'confirmed'
                }]);

            if (error) throw error;

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
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        name="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingData.date}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <select
                        name="time"
                        required
                        value={bookingData.time}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                        <option value="">Select a time</option>
                        {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Types</label>
                    <div className="space-y-3">
                        {Object.entries(categoryPrices).map(([key, price]) => (
                            <div key={key} className="flex justify-between items-center">
                                <div className="flex-1 capitalize">
                                    {key.replace(/_/g, ' ')} (₹{price})
                                </div>
                                <input
                                    type="number"
                                    name={key}
                                    min="0"
                                    max="10"
                                    value={bookingData.ticketCounts[key]}
                                    onChange={handleTicketCountChange}
                                    className="w-20 border border-gray-300 rounded-md shadow-sm p-1 text-right"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
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
                <div className="flex justify-between"><span>Date:</span><span>{bookingData.date}</span></div>
                <div className="flex justify-between"><span>Time:</span><span>{bookingData.time}</span></div>
                <div className="space-y-2">
                    {Object.entries(bookingData.ticketCounts).map(([key, count]) => (
                        count > 0 && (
                            <div key={key} className="flex justify-between">
                                <span>{key.replace(/_/g, ' ')}</span>
                                <span>{count} × ₹{categoryPrices[key]} = ₹{count * categoryPrices[key]}</span>
                            </div>
                        )
                    ))}
                </div>
                <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{bookingData.totalAmount}</span>
                </div>
            </div>

            <button
                onClick={handlePayment}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
            >
                Pay Now
            </button>
            <button
                onClick={() => setStep(1)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
            >
                Back
            </button>
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
            <p className="text-gray-600 mb-6">A confirmation email has been sent to your registered email address.</p>
            <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
            >
                View My Bookings
            </button>
            <button
                onClick={() => navigate('/')}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
            >
                Return to Home
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto mb-8">
                    <div className="flex justify-between">
                        {['Select Date', 'Payment', 'Confirmation'].map((label, index) => {
                            const current = index + 1;
                            return (
                                <div key={current} className={`flex flex-col items-center ${step >= current ? 'text-orange-500' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= current ? 'border-orange-500 bg-orange-100' : 'border-gray-400'}`}>
                                        {current}
                                    </div>
                                    <span className="text-sm mt-1">{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {step === 1 && renderDateTimeSelection()}
                {step === 2 && renderPayment()}
                {step === 3 && renderConfirmation()}
            </div>
        </div>
    );
}
