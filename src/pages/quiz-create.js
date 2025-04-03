import React, { useState } from 'react';

export function QuizCreatePage() {
    const [questionData, setQuestionData] = useState({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle quiz question submission
        console.log('Question submitted:', questionData);
        // Reset form
        setQuestionData({
            question: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correctAnswer: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setQuestionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-orange-500 text-center mb-8">Create Quiz</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label 
                            htmlFor="question"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Question:
                        </label>
                        <input
                            type="text"
                            id="question"
                            name="question"
                            value={questionData.question}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {[1, 2, 3, 4].map(num => (
                        <div key={num}>
                            <label 
                                htmlFor={`option${num}`}
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Option {num}:
                            </label>
                            <input
                                type="text"
                                id={`option${num}`}
                                name={`option${num}`}
                                value={questionData[`option${num}`]}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    ))}

                    <div>
                        <label 
                            htmlFor="correctAnswer"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Correct Answer:
                        </label>
                        <input
                            type="text"
                            id="correctAnswer"
                            name="correctAnswer"
                            value={questionData.correctAnswer}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                        Add Question
                    </button>
                </form>
            </div>
        </div>
    );
} 