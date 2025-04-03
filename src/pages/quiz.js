import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabase';

export function QuizPage() {
    const [quizData, setQuizData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const supabase = getSupabase();

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            // In a real app, this would fetch from your database
            // For now, we'll use mock data
            const mockQuiz = {
                id: 1,
                title: "Museum Knowledge Quiz",
                questions: [
                    {
                        id: 1,
                        question: "Which is the oldest museum in India?",
                        options: [
                            "National Museum, New Delhi",
                            "Indian Museum, Kolkata",
                            "Salar Jung Museum, Hyderabad",
                            "Government Museum, Chennai"
                        ],
                        correctAnswer: 1
                    },
                    {
                        id: 2,
                        question: "What type of artifacts are typically found in an archaeological museum?",
                        options: [
                            "Modern Art",
                            "Ancient Tools and Pottery",
                            "Live Animals",
                            "Scientific Instruments"
                        ],
                        correctAnswer: 1
                    },
                    {
                        id: 3,
                        question: "Which museum houses the famous Kohinoor Diamond replica?",
                        options: [
                            "National Museum",
                            "Victoria Memorial",
                            "Salar Jung Museum",
                            "Prince of Wales Museum"
                        ],
                        correctAnswer: 2
                    }
                ],
                rewards: {
                    bronze: 60,
                    silver: 80,
                    gold: 90
                }
            };

            setQuizData(mockQuiz);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, answerIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestion < quizData.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            calculateScore();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const calculateScore = () => {
        let correctAnswers = 0;
        quizData.questions.forEach(question => {
            if (selectedAnswers[question.id] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const finalScore = (correctAnswers / quizData.questions.length) * 100;
        setScore(finalScore);
        setShowResults(true);

        // Save quiz results
        saveQuizResults(finalScore);
    };

    const saveQuizResults = async (finalScore) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { error } = await supabase
                    .from('quiz_results')
                    .insert([
                        {
                            user_id: user.id,
                            quiz_id: quizData.id,
                            score: finalScore,
                            completed_at: new Date()
                        }
                    ]);

                if (error) throw error;

                // Award badges based on score
                if (finalScore >= quizData.rewards.gold) {
                    awardBadge('gold');
                } else if (finalScore >= quizData.rewards.silver) {
                    awardBadge('silver');
                } else if (finalScore >= quizData.rewards.bronze) {
                    awardBadge('bronze');
                }
            }
        } catch (error) {
            console.error('Error saving quiz results:', error);
        }
    };

    const awardBadge = async (level) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { error } = await supabase
                    .from('user_badges')
                    .insert([
                        {
                            user_id: user.id,
                            badge_type: 'quiz',
                            badge_level: level,
                            awarded_at: new Date()
                        }
                    ]);

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error awarding badge:', error);
        }
    };

    const retakeQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setScore(0);
        setShowResults(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
                        <div className="mb-8">
                            <div className="text-5xl font-bold text-orange-500 mb-2">{score}%</div>
                            <p className="text-gray-600">
                                You answered {Math.round((score / 100) * quizData.questions.length)} out of {quizData.questions.length} questions correctly
                            </p>
                        </div>

                        {/* Badge Award */}
                        {score >= quizData.rewards.bronze && (
                            <div className="mb-8">
                                <div className="w-20 h-20 mx-auto mb-4">
                                    {score >= quizData.rewards.gold ? (
                                        <div className="bg-yellow-100 rounded-full p-4">
                                            <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </div>
                                    ) : score >= quizData.rewards.silver ? (
                                        <div className="bg-gray-100 rounded-full p-4">
                                            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="bg-orange-100 rounded-full p-4">
                                            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-lg font-medium text-gray-900">
                                    {score >= quizData.rewards.gold ? 'Gold' : score >= quizData.rewards.silver ? 'Silver' : 'Bronze'} Badge Earned!
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={retakeQuiz}
                                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Take Quiz Again
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestionData = quizData.questions[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200">
                        <div 
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-8">
                        {/* Question Counter */}
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-sm text-gray-500">
                                Question {currentQuestion + 1} of {quizData.questions.length}
                            </span>
                            <span className="text-sm text-gray-500">
                                {Math.round(((currentQuestion + 1) / quizData.questions.length) * 100)}% Complete
                            </span>
                        </div>

                        {/* Question */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {currentQuestionData.question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-4 mb-8">
                            {currentQuestionData.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(currentQuestionData.id, index)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                        selectedAnswers[currentQuestionData.id] === index
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-orange-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                            selectedAnswers[currentQuestionData.id] === index
                                                ? 'border-orange-500'
                                                : 'border-gray-300'
                                        }`}>
                                            {selectedAnswers[currentQuestionData.id] === index && (
                                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                            )}
                                        </div>
                                        {option}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className={`px-6 py-2 rounded-lg ${
                                    currentQuestion === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!selectedAnswers[currentQuestionData.id]}
                                className={`px-6 py-2 rounded-lg ${
                                    !selectedAnswers[currentQuestionData.id]
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                            >
                                {currentQuestion === quizData.questions.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 