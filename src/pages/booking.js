import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSupabase } from '../supabase';
import jsPDF from 'jspdf';

export function BookingPage() {
    const navigate = useNavigate();
    const supabase = getSupabase();
    const { id: museumId } = useParams(); // Correctly get museumId from route param :id
    const [museum, setMuseum] = useState(null);
    const [loadingMuseum, setLoadingMuseum] = useState(true);
    const [errorMuseum, setErrorMuseum] = useState(null);

    // Define the structure of ticket categories. Prices will be fetched.
    const ticketCategories = {
        indian_nationals: "Indian Nationals",
        students_with_id: "Students with ID",
        children_below_12: "Children Below 12",
        foreign_nationals: "Foreign Nationals",
        photography_permit: "Photography Permit"
    };

    useEffect(() => {
        async function fetchMuseum() {
            if (!museumId) {
                setErrorMuseum("Museum ID is missing.");
                setLoadingMuseum(false);
                return;
            }
            try {
                setLoadingMuseum(true);
                const { data, error } = await supabase
                    .from('museums')
                    .select('name, ticket_price') // Ensure ticket_price is a JSON object in your DB
                    .eq('id', museumId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Museum not found.");
                
                // Ensure ticket_price is an object
                if (typeof data.ticket_price !== 'object' || data.ticket_price === null) {
                    // console.warn(`Ticket prices for museum ${museumId} are not configured correctly. Falling back to defaults or zero.`);
                    // Fallback or specific handling if ticket_price is not as expected
                    // For now, we'll let it proceed and it might show 0 or NaN if keys are missing.
                    // A more robust solution would be to ensure default prices or show an error.
                    data.ticket_price = data.ticket_price || {};
                }

                setMuseum(data);
                setErrorMuseum(null);
            } catch (err) {
                // console.error('Error fetching museum:', err);
                setErrorMuseum(err.message || 'Failed to fetch museum details.');
                setMuseum(null);
            } finally {
                setLoadingMuseum(false);
            }
        }
        fetchMuseum();
    }, [museumId, supabase]);

    const allTimeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00"
    ];

    const [step, setStep] = useState(1);
    // Ensure museum.ticket_price is available before rendering ticket options
    const currentTicketPrices = museum?.ticket_price || {};
    
    // State for available time slots and booked slots
    const [availableTimeSlots, setAvailableTimeSlots] = useState([
        "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00"
    ]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    
    // Payment form state
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardError, setCardError] = useState('');

    const [bookingData, setBookingData] = useState({
        museumId: museumId, // Set museumId here
        date: '',
        time: '',
        ticketCounts: Object.keys(ticketCategories).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {}),
        totalAmount: 0
    });

    // Update museumId in bookingData if it changes (e.g., direct navigation)
    useEffect(() => {
        setBookingData(prev => ({ ...prev, museumId: museumId }));
    }, [museumId]);


    const fetchBookedSlots = async (date) => {
        if (!date || !museumId) return;
        
        setIsLoadingSlots(true);
        try {
            // In a real app, you would fetch booked slots from your database
            // This is a mock implementation
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('time_slot')
                .eq('museum_id', museumId)
                .eq('date', date);
                
            if (error) throw error;
            
            const bookedTimes = bookings.map(booking => booking.time_slot);
            setBookedSlots(bookedTimes);
            
            // Filter out booked slots from all available slots
            const available = allTimeSlots.filter(slot => !bookedTimes.includes(slot));
            setAvailableTimeSlots(available);
            
            // Clear selected time if it's no longer available
            if (bookingData.time && !available.includes(bookingData.time)) {
                setBookingData(prev => ({
                    ...prev,
                    time: ''
                }));
            }
        } catch (error) {
            console.error('Error fetching booked slots:', error);
            // Fallback to all slots if there's an error
            setAvailableTimeSlots([...allTimeSlots]);
        } finally {
            setIsLoadingSlots(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'date') {
            // When date changes, fetch booked slots for that date
            fetchBookedSlots(value);
        }
        
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
            let total = 0;
            if (museum && museum.ticket_price) {
                total = Object.entries(updatedCounts)
                    .reduce((sum, [key, count]) => {
                        const price = museum.ticket_price[key] !== undefined ? museum.ticket_price[key] : 0; // Use 0 if price not defined
                        return sum + count * price;
                    }, 0);
            }

            return {
                ...prev,
                ticketCounts: updatedCounts,
                totalAmount: total
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/confirmation');
    };

    const handleDateTimeSubmit = (e) => {
        e.preventDefault();
        // Check if any tickets are selected
        const totalTickets = Object.values(bookingData.ticketCounts).reduce((sum, count) => sum + count, 0);
        
        if (totalTickets === 0) {
            alert("Please select at least one ticket to proceed.");
            return; // Prevent proceeding to the next step
        }
        
        // Additional validation: Check if the total number of tickets is reasonable
        if (totalTickets > 20) { // Adjust the maximum number of tickets as needed
            alert("You can book a maximum of 20 tickets at once. Please reduce the number of tickets and try again.");
            return;
        }
        
        setStep(2);
    };

    const handleDownloadTicket = () => {
        const doc = new jsPDF();

        // Theme Colors
        const primaryColor = '#8B4513'; // A brownish color, like old paper or wood
        const secondaryColor = '#5A3A22'; // Darker brown
        const accentColor = '#D4AF37'; // Gold accent for a touch of elegance

        // Page Border
        doc.setDrawColor(secondaryColor);
        doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10, 'S');

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(primaryColor);
        doc.text('Museum Visit Confirmation', doc.internal.pageSize.width / 2, 20, { align: 'center' });

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor);
        doc.text('Your Ticket to Discovery', doc.internal.pageSize.width / 2, 28, { align: 'center' });

        // Separator Line
        doc.setDrawColor(accentColor);
        doc.setLineWidth(0.5);
        doc.line(20, 35, doc.internal.pageSize.width - 20, 35);

        // Booking Details
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(secondaryColor);

        const lineHeight = 8;
        let currentY = 45;

        const addDetail = (label, value) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value), 70, currentY); // Ensure value is a string
            currentY += lineHeight;
        };

        addDetail('Museum:', museum?.name || 'Details Unavailable');
        addDetail('Date:', bookingData?.date || 'Not Specified');
        addDetail('Time:', bookingData?.time || 'Not Specified');
        addDetail('Ticket ID:', bookingData?.ticketId || 'TKT-XXXXXX');

        currentY += lineHeight / 2; // Extra space before visitor details

        doc.setFont('helvetica', 'bold');
        doc.text('Visitor Details:', 20, currentY);
        currentY += lineHeight;

        doc.setFont('helvetica', 'normal');
        let totalVisitors = 0;
        Object.entries(bookingData.ticketCounts).forEach(([key, count]) => {
            if (count > 0) {
                const label = ticketCategories[key] || key.replace(/_/g, ' ');
                addDetail(`  ${label}:`, `${count} visitor(s)`);
                totalVisitors += count;
            }
        });
        
        if (totalVisitors === 0) {
             addDetail('  Visitors:', 'No visitors specified');
        }


        currentY += lineHeight; // Extra space before total

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor);
        addDetail('Total Visitors:', totalVisitors);


        // Footer Message
        currentY = doc.internal.pageSize.height - 30;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor);
        doc.text('Thank you for your booking! We look forward to welcoming you.', doc.internal.pageSize.width / 2, currentY, { align: 'center' });
        currentY += 5;
        doc.text('Please present this ticket at the entrance.', doc.internal.pageSize.width / 2, currentY, { align: 'center' });


        // Decorative Element (e.g., a simple flourish or icon - jsPDF has limited graphics)
        // For simplicity, we'll add another line
        doc.setDrawColor(accentColor);
        doc.setLineWidth(0.2);
        doc.line(20, doc.internal.pageSize.height - 15, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 15);


        doc.save('Museum_Ticket_Visit.pdf');
    };

    if (loadingMuseum) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="ml-4 text-gray-700">Loading museum details...</p>
            </div>
        );
    }

    if (errorMuseum || !museum) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 bg-white shadow-md rounded-lg">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 dark:text-white mb-4">{errorMuseum || "Could not load museum information."}</p>
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

    const renderDateTimeSelection = () => (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Tickets for {museum?.name}</h2>
            <p className="text-gray-600 mb-6">Select Date, Time, and Ticket Types</p>
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
                    <div className="relative">
                        <select
                            name="time"
                            required
                            value={bookingData.time}
                            onChange={handleInputChange}
                            disabled={isLoadingSlots || !bookingData.date}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:opacity-75"
                        >
                            <option value="">
                                {isLoadingSlots ? 'Loading time slots...' : 
                                 !bookingData.date ? 'Select a date first' : 
                                 availableTimeSlots.length === 0 ? 'No slots available' : 'Select a time'}
                            </option>
                            {availableTimeSlots.map(time => (
                                <option key={time} value={time}>
                                    {time}{bookedSlots.includes(time) ? ' (Booked)' : ''}
                                </option>
                            ))}
                        </select>
                        {isLoadingSlots && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Types</label>
                    <div className="space-y-3">
                        {Object.entries(ticketCategories).map(([key, label]) => {
                            const price = currentTicketPrices[key] !== undefined ? currentTicketPrices[key] : "N/A";
                            return (
                                <div key={key} className="flex justify-between items-center">
                                    <div className="flex-1 capitalize">
                                        {label} (₹{price})
                                    </div>
                                    <input
                                        type="number"
                                        name={key}
                                        min="0"
                                        max="10" // Consider making max configurable or removing
                                        value={bookingData.ticketCounts[key]}
                                        onChange={handleTicketCountChange}
                                        className="w-20 border border-gray-300 rounded-md shadow-sm p-1 text-right"
                                        disabled={price === "N/A"} // Disable if price is not available
                                    />
                                </div>
                            );
                        })}
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

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format card number with spaces after every 4 digits
        if (name === 'cardNumber') {
            const formattedValue = value.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
            setCardData(prev => ({ ...prev, [name]: formattedValue }));
        } 
        // Format expiry date with slash
        else if (name === 'expiryDate') {
            let formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 2) {
                formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
            }
            setCardData(prev => ({ ...prev, [name]: formattedValue }));
        } 
        // Format CVV (limit to 4 digits)
        else if (name === 'cvv') {
            const formattedValue = value.replace(/\D/g, '').substring(0, 4);
            setCardData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setCardData(prev => ({ ...prev, [name]: value }));
        }
        
        // Clear any previous errors when user types
        if (cardError) setCardError('');
    };

    const validateCard = () => {
        // Basic validation
        if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardData.cardNumber)) {
            setCardError('Please enter a valid 16-digit card number');
            return false;
        }
        if (!cardData.cardName.trim()) {
            setCardError('Please enter the name on card');
            return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
            setCardError('Please enter a valid expiry date (MM/YY)');
            return false;
        }
        if (!/^\d{3,4}$/.test(cardData.cvv)) {
            setCardError('Please enter a valid CVV (3 or 4 digits)');
            return false;
        }
        return true;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!validateCard()) return;
        
        setIsProcessing(true);
        setCardError('');
        
        try {
            // In a real app, you would integrate with a payment processor here
            // This is just a simulation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // If payment is successful, proceed to confirmation
            setStep(3);
        } catch (error) {
            setCardError('Payment failed. Please try again or use a different card.');
            console.error('Payment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPayment = () => (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review and Payment</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">For: {museum?.name}</p>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Date:</span>
                        <span className="font-medium">{bookingData.date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Time:</span>
                        <span className="font-medium">{bookingData.time}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                    {Object.entries(bookingData.ticketCounts).map(([key, count]) => {
                        const price = currentTicketPrices[key] !== undefined ? currentTicketPrices[key] : 0;
                        return (
                            count > 0 && (
                                <div key={key} className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">{ticketCategories[key]}</span>
                                    <span>{count} × ₹{price} = ₹{count * price}</span>
                                </div>
                            )
                        );
                    })}
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                    <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>₹{bookingData.totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleCardInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name on Card</label>
                    <input
                        type="text"
                        name="cardName"
                        value={cardData.cardName}
                        onChange={handleCardInputChange}
                        placeholder="John Doe"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry (MM/YY)</label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={cardData.expiryDate}
                            onChange={handleCardInputChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                        <input
                            type="password"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardInputChange}
                            placeholder="•••"
                            maxLength="4"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>
                
                {cardError && (
                    <div className="text-red-500 text-sm mt-2">{cardError}</div>
                )}
                
                <div className="flex flex-col space-y-3 mt-6">
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                            isProcessing ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            `Pay ₹${bookingData.totalAmount}`
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center space-x-4 my-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Secure payment with</span>
                        <div className="flex space-x-2">
                            <svg className="h-5" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#012169"/>
                                <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#FFF"/>
                                <path d="M19 12l-7-5.1v10.2l7-5.1z" fill="#C8102E"/>
                                <path d="M12 6.9l-7-5.1v18.4l7-5.1V6.9z" fill="#012169"/>
                                <path d="M12 6.9l7-5.1h-7v5.1z" fill="#C8102E"/>
                                <path d="M19 12l7-5.1-7-5.1v10.2z" fill="#012169"/>
                                <path d="M19 12l7 5.1v-10L19 12z" fill="#C8102E"/>
                                <path d="M12 17.1l7 5.1v-5.1h-7z" fill="#012169"/>
                                <path d="M12 17.1v5.1H5l7-5.1z" fill="#C8102E"/>
                            </svg>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-2 px-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Back to Booking
                    </button>
                </div>
            </form>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed for {museum?.name}!</h2>
            <p className="text-gray-600 mb-6">A confirmation email has been sent to your registered email address.</p>
            <button
                onClick={handleDownloadTicket}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
                Download Ticket
            </button>
            <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
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
