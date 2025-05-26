import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase";

const initialQuizState = {
  title: "",
  // description: "", // description field removed
  questions: [{ question_text: "", options: ["", "", "", ""], correct_answer_index: 0 }],
  museum_id: null,
  rewards: { points: 10, badge_name: "Quiz Master" } 
};

const QuizCreatePage = () => {
  const [quizData, setQuizData] = useState(initialQuizState);
  const [userMuseumId, setUserMuseumId] = useState(null);
  const [isLoadingUserMuseum, setIsLoadingUserMuseum] = useState(true);
  const [formError, setFormError] = useState(null); // For errors like no museum found
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState(null); // For success/error on save

  const navigate = useNavigate();
  const supabase = getSupabase();

  useEffect(() => {
    const fetchUserMuseum = async () => {
      if (!supabase) {
        setFormError("Supabase client not available.");
        setIsLoadingUserMuseum(false);
        return;
      }
      setIsLoadingUserMuseum(true);
      setFormError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setFormError("You must be logged in to create a quiz.");
        setIsLoadingUserMuseum(false);
        if(!user) navigate('/login');
        return;
      }

      const { data: museumData, error: museumError } = await supabase
        .from('museums')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (museumError || !museumData) {
        setFormError("Please set up your museum details before creating quizzes. You can manage your museum under 'Manage My Museum'.");
        setUserMuseumId(null);
      } else {
        setUserMuseumId(museumData.id);
        setQuizData(prev => ({ ...prev, museum_id: museumData.id }));
      }
      setIsLoadingUserMuseum(false);
    };

    fetchUserMuseum();
  }, [supabase, navigate]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { question_text: "", options: ["", "", "", ""], correct_answer_index: 0 }]
    }));
  };

  const handleQuestionChange = (idx, field, value) => {
    const updatedQuestions = quizData.questions.map((q, index) => {
      if (index === idx) {
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updatedQuestions = quizData.questions.map((q, index) => {
      if (index === qIdx) {
        const newOptions = [...q.options];
        newOptions[oIdx] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleAnswerChange = (qIdx, value) => { // value is the option index
    const updatedQuestions = quizData.questions.map((q, index) => {
      if (index === qIdx) {
        return { ...q, correct_answer_index: parseInt(value, 10) };
      }
      return q;
    });
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };
  
  const handleRewardChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [name]: name === 'points' ? parseInt(value, 10) || 0 : value
      }
    }));
  };


  const handleSubmit = async e => {
    e.preventDefault();
    if (!userMuseumId) {
      setFormMessage({ type: "error", text: formError || "Cannot create quiz without a museum." });
      return;
    }
    if (!quizData.title.trim()) {
      setFormMessage({ type: "error", text: "Quiz title is required." });
      return;
    }
    if (quizData.questions.some(q => !q.question_text.trim() || q.options.filter(opt => opt.trim() !== "").length < 2)) {
        setFormMessage({ type: "error", text: "All questions must have text and at least two options."});
        return;
    }

    setIsSaving(true);
    setFormMessage(null);

    const payload = {
      ...quizData,
      museum_id: userMuseumId, // Ensure museum_id is from the fetched state
    };

    try {
      const { error } = await supabase.from('quizzes').insert([payload]);
      if (error) throw error;
      setFormMessage({ type: "success", text: "Quiz created successfully!" });
      setQuizData(initialQuizState); // Reset form
      setTimeout(() => navigate('/admin/dashboard/quizzes'), 1500);
    } catch (error) {
      console.error("Error creating quiz:", error);
      setFormMessage({ type: "error", text: `Failed to create quiz: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoadingUserMuseum) {
    return <div className="p-8 text-center">Loading user and museum information...</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-orange-600">Create New Quiz</h2>
        
        {formError && (
          <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">
            {formError} Visit the <a href="/admin/museum-details" className="font-semibold underline hover:text-red-800">Manage My Museum</a> page to set up your museum.
          </div>
        )}

        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <fieldset className="space-y-6" disabled={isSaving || !!formError || isLoadingUserMuseum}> {/* Added space-y-6 */}
            <div> {/* Removed mb-4 from direct children, space-y-6 on fieldset handles it */}
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
              <input 
                id="title"
                name="title"
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
                value={quizData.title} 
                onChange={handleInputChange} 
                required
              />
            </div>
            {/* Description field removed from UI */}

            {/* Rewards Section */}
            <div className="border-t pt-6 mt-6"> {/* Standardized spacing */}
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Rewards</h3> {/* Standardized heading */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="rewards_points" className="block text-sm font-medium text-gray-700 mb-1">Points</label> {/* Added mb-1 */}
                        <input
                            type="number"
                            id="rewards_points"
                            name="points"
                            value={quizData.rewards.points}
                            onChange={handleRewardChange}
                            className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                        />
                    </div>
                    <div>
                        <label htmlFor="rewards_badge_name" className="block text-sm font-medium text-gray-700 mb-1">Badge Name</label> {/* Added mb-1 */}
                        <input
                            type="text"
                            id="rewards_badge_name"
                            name="badge_name"
                            value={quizData.rewards.badge_name}
                            onChange={handleRewardChange}
                            placeholder="e.g., History Buff"
                            className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 mt-6"> {/* Standardized spacing */}
              <div className="flex justify-between items-center mb-4"> {/* Standardized mb */}
                <h3 className="text-xl font-semibold text-gray-800">Questions</h3> {/* Standardized heading */}
                <button type="button" onClick={handleAddQuestion} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm">Add Question</button> {/* Changed to green */}
              </div>
              {quizData.questions.map((q, idx) => (
                <div key={idx} className="mb-4 border rounded-lg p-4 bg-gray-50 space-y-3"> {/* This internal spacing is fine */}
                  <div>
                    <label htmlFor={`question_text-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Question {idx + 1}</label> {/* Added mb-1 */}
                    <textarea 
                      id={`question_text-${idx}`}
                      className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white" 
                      value={q.question_text} 
                      onChange={e => handleQuestionChange(idx, "question_text", e.target.value)} 
                      rows="2"
                      required
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-1">Options</span>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          id={`q${idx}-opt${oIdx}`}
                          name={`correct_answer_index-${idx}`} 
                          checked={q.correct_answer_index === oIdx} 
                          onChange={() => handleAnswerChange(idx, oIdx)} 
                          className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                        />
                        <label htmlFor={`q${idx}-opt${oIdx}`} className="sr-only">Option {oIdx + 1}</label>
                        <input 
                          type="text"
                          className="w-full rounded-md px-2 py-1 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white text-sm" 
                          value={opt} 
                          onChange={e => handleOptionChange(idx, oIdx, e.target.value)} 
                          placeholder={`Option ${oIdx + 1}`}
                          required={oIdx < 2} // Require at least first two options
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200"> {/* Standardized spacing */}
              <button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-70" /* Adjusted padding */
                disabled={isSaving || !!formError || isLoadingUserMuseum}
              >
                {isSaving ? "Creating..." : "Create Quiz"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default QuizCreatePage;
