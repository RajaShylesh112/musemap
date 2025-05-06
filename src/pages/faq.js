import React, { useState } from 'react';

export function FAQPage() {
    const [expandedQuestion, setExpandedQuestion] = useState(null); // Manages which FAQ is expanded

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
                    answer: "Yes, ticket cancellations and rescheduling are possible subject to the museum's specific policy. Generally, you can manage your bookings through your profile page or by contacting support at least 24 hours before your scheduled visit. Please check the terms and conditions at the time of booking for specific details."
                },
                {
                    id: "bt4",
                    question: "Are there any discounts or group booking options?",
                    answer: "Yes, many museums offer discounts for students, seniors, and large groups. Please check the specific museum's page for details on available discounts and how to avail them. For group bookings (typically 10+ people), you might need to contact the museum directly or our support team for special arrangements."
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
                    answer: "You can create an account by clicking the \"Register\" or \"Sign Up\" button on our homepage. You'll need to provide your email address and create a password. Alternatively, you can sign up using your Google or Facebook account for a quicker process."
                },
                {
                    id: "ap2",
                    question: "I forgot my password. What should I do?",
                    answer: "If you've forgotten your password, click on the \"Forgot Password\" link on the login page. Enter your registered email address, and we'll send you instructions on how to reset your password."
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

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold text-center mb-12 text-orange-500">Frequently Asked Questions</h1>
            
            {faqCategories.map((categoryObj) => (
                <div key={categoryObj.category} className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-orange-400 mb-6 pb-2 border-b border-gray-300 dark:border-gray-600">{categoryObj.category}</h2>
                    <div className="space-y-4">
                        {categoryObj.items.map((faq) => (
                            <div 
                                key={faq.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <button
                                    className={`w-full text-left p-5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none`}
                                    onClick={() => setExpandedQuestion(expandedQuestion === faq.id ? null : faq.id)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{faq.question}</span>
                                        <span>{expandedQuestion === faq.id ? '-' : '+'}</span>
                                    </div>
                                </button>
                                
                                {expandedQuestion === faq.id && (
                                    <div className="p-5 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}