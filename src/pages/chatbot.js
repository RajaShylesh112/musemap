import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ChatbotPage() {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Hello! I\'m your museum assistant. How can I help you today?',
            options: [
                'View FAQs',
                'Get Personalized Recommendations',
                'Help with Booking',
                'Information about Museums'
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const faqs = [
        {
            question: "What are the museum opening hours?",
            answer: "Most museums are open from 9 AM to 5 PM, Tuesday through Sunday. Some museums may have extended hours on specific days."
        },
        {
            question: "How do I book tickets?",
            answer: "You can book tickets through our website by selecting your preferred museum, date, and time slot. We also offer guided tours and audio guides as additional options."
        },
        {
            question: "Are there any discounts available?",
            answer: "Yes, we offer discounts for students, seniors, and children. Group bookings may also qualify for special rates."
        },
        {
            question: "What's the cancellation policy?",
            answer: "Bookings can be cancelled up to 24 hours before the scheduled visit for a full refund."
        }
    ];

    const recommendations = [
        {
            name: "National Museum",
            description: "Perfect for history enthusiasts",
            tags: ["history", "artifacts", "culture"]
        },
        {
            name: "Science Museum",
            description: "Interactive exhibits and demonstrations",
            tags: ["science", "interactive", "education"]
        },
        {
            name: "Art Gallery",
            description: "Contemporary and classical art collections",
            tags: ["art", "culture", "exhibitions"]
        }
    ];

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);

        // Process user message and generate response
        processUserMessage(inputMessage);

        setInputMessage('');
    };

    const processUserMessage = (message) => {
        const lowerMessage = message.toLowerCase();

        // Check for keywords and generate appropriate response
        if (lowerMessage.includes('faq') || lowerMessage.includes('question')) {
            showFAQs();
        } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
            showRecommendations();
        } else if (lowerMessage.includes('book') || lowerMessage.includes('ticket')) {
            showBookingHelp();
        } else {
            // Default response
            setMessages(prev => [...prev, {
                type: 'bot',
                content: 'I\'m not sure I understand. Would you like to:',
                options: [
                    'View FAQs',
                    'Get Personalized Recommendations',
                    'Help with Booking',
                    'Information about Museums'
                ]
            }]);
        }
    };

    const handleOptionClick = (option) => {
        setMessages(prev => [...prev, { type: 'user', content: option }]);

        switch (option) {
            case 'View FAQs':
                showFAQs();
                break;
            case 'Get Personalized Recommendations':
                showRecommendations();
                break;
            case 'Help with Booking':
                showBookingHelp();
                break;
            case 'Information about Museums':
                showMuseumInfo();
                break;
            default:
                break;
        }
    };

    const showFAQs = () => {
        setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Here are some frequently asked questions:',
            faqs: faqs
        }]);
    };

    const showRecommendations = () => {
        setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Based on popular choices, here are some recommendations:',
            recommendations: recommendations
        }]);
    };

    const showBookingHelp = () => {
        setMessages(prev => [...prev, {
            type: 'bot',
            content: 'To help you with booking:',
            booking: {
                steps: [
                    'Select your preferred museum',
                    'Choose a date and time',
                    'Select number of tickets',
                    'Add any extras (audio guide, guided tour)',
                    'Proceed to payment'
                ],
                link: '/booking'
            }
        }]);
    };

    const showMuseumInfo = () => {
        setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Our museums offer various exhibitions and experiences:',
            museums: recommendations
        }]);
    };

    const renderMessage = (message, index) => {
        const isBot = message.type === 'bot';

        return (
            <div key={index} className={`mb-4 ${isBot ? 'mr-20' : 'ml-20'}`}>
                <div className={`p-4 rounded-lg ${isBot ? 'bg-white dark:bg-gray-700' : 'bg-orange-500 text-white'}`}>
                    <p className={`dark:text-white`}>{message.content}</p>

                    {/* Options */}
                    {message.options && (
                        <div className="mt-4 space-y-2">
                            {message.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleOptionClick(option)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* FAQs */}
                    {message.faqs && (
                        <div className="mt-4 space-y-4">
                            {message.faqs.map((faq, i) => (
                                <div key={i} className="border-b pb-2">
                                    <h4 className="font-medium">{faq.question}</h4>
                                    <p className={`text-gray-600 dark:text-white text-sm mt-1`}>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recommendations */}
                    {message.recommendations && (
                        <div className="mt-4 space-y-4">
                            {message.recommendations.map((rec, i) => (
                                <div key={i} className="border rounded p-3">
                                    <h4 className="font-medium">{rec.name}</h4>
                                    <p className={`text-sm text-gray-600 dark:text-white`}>{rec.description}</p>
                                    <div className="mt-2">
                                        {rec.tags.map((tag, j) => (
                                            <span key={j} className="inline-block bg-gray-100 text-gray-600 dark:text-white text-xs px-2 py-1 rounded mr-2">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Booking Help */}
                    {message.booking && (
                        <div className="mt-4">
                            <div className="space-y-2">
                                {message.booking.steps.map((step, i) => (
                                    <div key={i} className="flex items-center">
                                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-sm mr-2">
                                            {i + 1}
                                        </span>
                                        <span className={`text-gray-600 dark:text-white`}>{step}</span>
                                    </div>
                                ))}
                            </div>
                            <Link 
                                to={message.booking.link}
                                className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                            >
                                Start Booking
                            </Link>
                        </div>
                    )}

                    {/* Museum Information */}
                    {message.museums && (
                        <div className="mt-4 space-y-4">
                            {message.museums.map((museum, i) => (
                                <div key={i} className="border rounded p-3">
                                    <h4 className="font-medium">{museum.name}</h4>
                                    <p className={`text-sm text-gray-600 dark:text-white`}>{museum.description}</p>
                                    <Link 
                                        to={`/museum/${i + 1}`}
                                        className="mt-2 text-orange-500 hover:text-orange-600 text-sm"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-orange-500 text-white p-4">
                        <h2 className="text-xl font-semibold dark:text-orange-400">Museum Assistant</h2>
                        <p className="text-sm opacity-75 dark:text-white">Ask me anything about our museums!</p>
                    </div>

                    {/* Chat Messages */}
                    <div className="h-[600px] overflow-y-auto p-4 bg-gray-50">
                        {messages.map((message, index) => renderMessage(message, index))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                                type="submit"
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 