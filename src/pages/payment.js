import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function PaymentPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically process the payment
        // For now, we'll just redirect to the success page
        navigate('/payment-success');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">Payment Details</h1>
                
                <div className="mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h2 className="font-semibold mb-2">Order Summary</h2>
                        <div className="flex justify-between">
                            <span>Total Amount:</span>
                            <span className="font-bold">$50.00</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2" htmlFor="cardNumber">
                            Card Number
                        </label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2" htmlFor="cardHolder">
                            Card Holder Name
                        </label>
                        <input
                            type="text"
                            id="cardHolder"
                            name="cardHolder"
                            value={formData.cardHolder}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2" htmlFor="expiryDate">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                id="expiryDate"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2" htmlFor="cvv">
                                CVV
                            </label>
                            <input
                                type="text"
                                id="cvv"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                placeholder="123"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors mt-6"
                    >
                        Pay Now
                    </button>
                </form>
            </div>
        </div>
    );
}