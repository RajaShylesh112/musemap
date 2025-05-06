import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ChatbotPage() {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Hello! I\'m your museum assistant. How can I help you today?',
            options: [
                'View FAQs',
                'Help with Booking',
                'Information about Museums'
            ]
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Use the same FAQ structure as in faq.js
    const faqCategories = [
        {
            category: "General Information",
            items: [
                {
                    id: "gi1",
                    question: "What is MuseMap?",
                    answer: "MuseMap is a platform designed to help you discover and explore museums across India. You can find information about museums, book tickets, take quizzes to test your knowledge, and get recommendations."
                },
                {
                    id: "gi2",
                    question: "How can I contact customer support?",
                    answer: "You can contact our customer support through the \"Contact Us\" page on our website or by emailing support@musemap.com. We typically respond within 24-48 hours."
                },
                {
                    id: "gi3",
                    question: "Is MuseMap available as a mobile app?",
                    answer: "Currently, MuseMap is available as a web platform. We are working on developing mobile apps for Android and iOS in the near future."
                }
            ]
        },
        {
            category: "Booking & Tickets",
            items: [
                {
                    id: "bt1",
                    question: "How do I book a ticket online?",
                    answer: "You can book tickets directly through our website. Navigate to the museum you wish to visit, select your preferred date and time slot, choose the number and type of tickets, and proceed to payment. You can also use our chatbot for assistance with booking."
                },
                {
                    id: "bt2",
                    question: "What payment methods are accepted?",
                    answer: "We accept a wide range of payment methods, including major credit/debit cards (Visa, Mastercard, American Express), UPI (Google Pay, PhonePe, Paytm), and net banking from most major banks."
                },
                {
                    id: "bt3",
                    question: "Can I cancel or reschedule my ticket?",
                    answer: "Yes, ticket cancellations and rescheduling are possible subject to the museum\'s specific policy. Generally, you can manage your bookings through your profile page or by contacting support at least 24 hours before your scheduled visit. Please check the terms and conditions at the time of booking for specific details."
                },
                {
                    id: "bt4",
                    question: "Are there any discounts or group booking options?",
                    answer: "Yes, many museums offer discounts for students, seniors, and large groups. Please check the specific museum\'s page for details on available discounts and how to avail them. For group bookings (typically 10+ people), you might need to contact the museum directly or our support team for special arrangements."
                },
                {
                    id: "bt5",
                    question: "How will I receive my tickets after booking?",
                    answer: "Once your booking is confirmed and payment is successful, you will receive your e-tickets via email and they will also be available in your MuseMap account under the 'My Bookings' section."
                }
            ]
        },
        {
            category: "Account & Profile",
            items: [
                {
                    id: "ap1",
                    question: "How do I create an account?",
                    answer: "You can create an account by clicking the \"Register\" or \"Sign Up\" button on our homepage. You\'ll need to provide your email address and create a password. Alternatively, you can sign up using your Google or Facebook account for a quicker process."
                },
                {
                    id: "ap2",
                    question: "I forgot my password. What should I do?",
                    answer: "If you\'ve forgotten your password, click on the \"Forgot Password\" link on the login page. Enter your registered email address, and we\'ll send you instructions on how to reset your password."
                },
                {
                    id: "ap3",
                    question: "How can I update my profile information?",
                    answer: "Once logged in, you can access your profile page by clicking on your name or profile icon. From there, you should find options to edit your personal details, contact information, and preferences."
                },
                {
                    id: "ap4",
                    question: "Is my personal information secure?",
                    answer: "Yes, we take data security very seriously. Your personal information is encrypted and stored securely. Please refer to our Privacy Policy for more details on how we protect your data."
                }
            ]
        },
        {
            category: "Quizzes & Rewards",
            items: [
                {
                    id: "qr1",
                    question: "How do the quizzes work?",
                    answer: "Our quizzes are designed to be a fun and interactive way to test your knowledge about Indian museums, art, history, and culture. Each quiz consists of multiple-choice questions. Your scores contribute to your profile and can unlock rewards."
                },
                {
                    id: "qr2",
                    question: "What are rewards and how can I earn them?",
                    answer: "You can earn reward points and badges by actively participating on the MuseMap platform. This includes booking tickets, completing quizzes with high scores, and regularly visiting museums. Rewards can include discounts on future bookings, exclusive content, or special recognition on your profile. Check the \"Reward Criteria\" page for more details."
                },
                {
                    id: "qr3",
                    question: "Can I retake a quiz?",
                    answer: "Yes, you can typically retake quizzes. However, there might be a limit on how frequently you can retake a specific quiz or how retakes affect your score for reward purposes. Specific rules will be mentioned with each quiz."
                }
            ]
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
                    'Help with Booking',
                    'Information about Museums'
                ]
            }]);
        }
    };

    const showFAQs = () => {
        // Ask user to select a category first
        setMessages(prev => [...prev, {
            type: 'bot',
            content: 'Please select an FAQ category:',
            options: faqCategories.map(cat => cat.category) // Present categories as options
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

    const handleOptionClick = (option) => {
        setMessages(prev => [...prev, { type: 'user', content: option }]);

        const selectedCategory = faqCategories.find(cat => cat.category === option);

        if (selectedCategory) {
            // User selected an FAQ category, show its items
            setMessages(prev => [...prev, {
                type: 'bot',
                content: `Here are the FAQs for ${selectedCategory.category}:`,
                faqs: selectedCategory.items // Pass only items of the selected category
            }]);
        } else {
            // Handle other predefined options
            switch (option) {
                case 'View FAQs': // This case might be redundant if direct category selection is preferred
                    showFAQs();
                    break;
                case 'Help with Booking':
                    showBookingHelp();
                    break;
                case 'Information about Museums':
                    showMuseumInfo();
                    break;
                default:
                    // Default response if the option is not a known command or category
                    setMessages(prev => [...prev, {
                        type: 'bot',
                        content: 'I\'m not sure how to help with that. Please choose from the main options or ask another question.',
                        options: [
                            'View FAQs',
                            'Help with Booking',
                            'Information about Museums'
                        ]
                    }]);
                    break;
            }
        }
    };

    const renderMessage = (message, index) => {
        const isBot = message.type === 'bot';

        return (
            <div key={index} className={`mb-4 ${isBot ? 'mr-20' : 'ml-20'}`}>
                <div className={`p-4 rounded-lg ${isBot ? 'bg-white dark:bg-gray-700' : 'bg-orange-500 text-white'}`}>
                    <p className={`dark:text-white`}>{message.content}</p>

                    {/* Options (for category selection or main menu) */}
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

                    {/* Display all FAQ Categories and their items (original full list - can be removed if not needed after category selection) */}
                    {message.faqCategories && (
                        <div className="mt-4 space-y-6">
                            {message.faqCategories.map((categoryObj) => (
                                <div key={categoryObj.category} className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-orange-400 mb-2">{categoryObj.category}</h3>
                                    <div className="space-y-3">
                                        {categoryObj.items.map((faq, i) => (
                                            <div key={faq.id || i} className="border-b dark:border-gray-600 pb-2 last:border-b-0">
                                                <h4 className="font-medium text-gray-800 dark:text-gray-100">{faq.question}</h4>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Display FAQs for a single selected category */}
                    {message.faqs && !message.faqCategories && (
                        <div className="mt-4 space-y-3">
                            {message.faqs.map((faq, i) => (
                                <div key={faq.id || i} className="border-b dark:border-gray-600 pb-2 last:border-b-0">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-100">{faq.question}</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{faq.answer}</p>
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
                        <h2 className="text-xl font-semibold dark:text-yellow-400">Museum Assistant</h2>
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