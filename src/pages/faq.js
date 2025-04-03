import React, { useState } from 'react';

export function FAQPage() {
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const faqs = [
        {
            question: "How do I book a ticket online?",
            answer: "You can book a ticket through our chatbot by selecting the date, time, and ticket type."
        },
        {
            question: "What payment methods are accepted?",
            answer: "We accept credit/debit cards, UPI, and net banking."
        },
        {
            question: "Can I cancel or reschedule my ticket?",
            answer: "Yes, you can reschedule or cancel your booking via the chatbot before the visit date."
        }
    ];

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div 
                        key={index}
                        className="border rounded-lg overflow-hidden"
                    >
                        <button
                            className={`w-full text-left p-4 bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors ${
                                expandedQuestion === index ? 'border-b' : ''
                            }`}
                            onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                        >
                            {faq.question}
                        </button>
                        
                        {expandedQuestion === index && (
                            <div className="p-4 bg-white">
                                <p>{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 