import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase"; 

const dummyQuizData = {
  title: "Sample Quiz Adventure",
  museum_id: "", 
  questions: [
    { question_text: "Sample Question 1: What is the primary material of the Dancing Girl statue from Mohenjo-daro?", options: ["Bronze", "Terracotta", "Gold", "Ivory"], correct_answer_index: 0 },
    { question_text: "Sample Question 2: Which Mughal emperor commissioned the Taj Mahal?", options: ["Akbar", "Jahangir", "Shah Jahan", "Aurangzeb"], correct_answer_index: 2 }
  ],
  rewards: { points: 50, badge_name: "Sample Badge" },
};


const QuizEditPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const supabase = getSupabase();

  const initialFormState = quizId ? 
    { title: "", museum_id: "", questions: [] } :
    dummyQuizData;

  const [quiz, setQuiz] = useState(initialFormState);
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(!!quizId); 
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false); 
  const [formMessage, setFormMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase client not available.");
        setLoading(false); 
        return;
      }
      
      let museumList = [];
      try {
        const { data: museumsData, error: museumsError } = await supabase
          .from("museums")
          .select("id, name");
        
        if (museumsError) {
            console.error("Error fetching museums:", museumsError);
        }
        museumList = museumsData || [];
        setMuseums(museumList);
      } catch (museumFetchErr) {
        console.error("Critical error fetching museums:", museumFetchErr);
        setError(`Failed to load essential museum data: ${museumFetchErr.message}`);
      }

      if (!quizId) { 
        // No ID, using dummy data. Ensure museum_id is set if possible.
        if (dummyQuizData.museum_id === "" && museumList.length > 0) {
             // setQuiz(prev => ({...prev, museum_id: museumList[0].id })); // Example
        }
        setLoading(false);
        return;
      }
      
      // Check for invalid numeric ID format
      if (quizId && !isNaN(Number(quizId)) && !quizId.includes('-')) {
        setError("Invalid Quiz ID format. Please use valid links.");
        setNotFound(true); // Treat as not found
        setQuiz(dummyQuizData); // Show dummy data
        setLoading(false);
        return;
      }

      // If quizId is present and valid format, proceed to fetch it.
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const { data: quizDataResult, error: quizFetchError } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .maybeSingle(); 

        if (quizFetchError) {
          console.error('Error fetching quiz:', quizFetchError);
          setError(`Failed to fetch quiz: ${quizFetchError.message}`);
          setQuiz(dummyQuizData); 
        } else if (!quizDataResult) {
          setNotFound(true);
          setQuiz(dummyQuizData); 
        } else {
          setQuiz({ 
            title: quizDataResult.title || "",
            museum_id: quizDataResult.museum_id || "",
            // description: quizDataResult.description || "", // description removed
            questions: Array.isArray(quizDataResult.questions) ? quizDataResult.questions : (typeof quizDataResult.questions === 'string' ? JSON.parse(quizDataResult.questions) : []),
            // Removed rewards from the form
            ...quizDataResult 
          });
        }
      } catch (err) { 
        console.error("Unexpected error fetching quiz data:", err);
        setError(err.message || "An unexpected error occurred.");
        setQuiz(dummyQuizData); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, supabase, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setFormMessage({ type: "error", text: "Supabase client not available." });
      return;
    }
    if (!quizId && quiz.title === dummyQuizData.title) {
        setFormMessage({ type: "error", text: "This is dummy data. Please modify it or use a create page to make a new quiz."});
        return;
    }
    if (notFound && quizId) { 
        setFormMessage({type: "error", text: "Cannot save, quiz record not found."});
        return;
    }

    setIsSaving(true); 
    setFormMessage(null);

    if (!quiz.title.trim()) {
      setFormMessage({ type: "error", text: "Quiz title cannot be empty." });
      setIsSaving(false);
      return;
    }
    if (!quiz.museum_id) {
      setFormMessage({ type: "error", text: "Please select a museum." });
      setIsSaving(false);
      return;
    }
    if (!quiz.questions || quiz.questions.length === 0) {
      setFormMessage({ type: "error", text: "A quiz must have at least one question." });
      setIsSaving(false);
      return;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question_text.trim()) {
        setFormMessage({ type: "error", text: `Question #${i + 1} text cannot be empty.` });
        setIsSaving(false);
        return;
      }
      const filledOptions = q.options.filter(opt => opt && opt.trim() !== "").length;
      if (filledOptions < 2) {
        setFormMessage({ type: "error", text: `Question #${i + 1} must have at least 2 filled options.` });
        setIsSaving(false);
        return;
      }
      const correctAnswerIndex = Number(q.correct_answer_index);
      if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= q.options.length) {
         setFormMessage({ type: "error", text: `Question #${i + 1} has an invalid correct answer selection.` });
         setIsSaving(false);
         return;
      }
    }
    
    
    if (!quizId) {
        console.warn("Attempting to save without a quizId. This should be an insert operation.");
        setFormMessage({type: "error", text: "Saving new quizzes from this page is not fully implemented. Please use a dedicated create page."});
        setIsSaving(false);
        return;
    }

    try {
      const { data, error } = await supabase
        .from("quizzes")
        .update({
          title: quiz.title,
          museum_id: quiz.museum_id,
          // description: quiz.description, // description removed
          questions: quiz.questions, 
          updated_at: new Date().toISOString(), 
        })
        .eq("id", quizId)
        .select(); 

      if (error) throw error;

      setFormMessage({ type: "success", text: "Quiz updated successfully!" });
      if (data && data.length > 0) {
         setQuiz(prevQuiz => ({
            ...prevQuiz,
            updated_at: data[0].updated_at 
         }));
      }
      setTimeout(() => navigate("/admin/dashboard/quizzes"), 2000); 
    } catch (err) {
      console.error("Error updating quiz:", err);
      setFormMessage({ type: "error", text: err.message || "Failed to update quiz." });
    } finally {
      setIsSaving(false); 
    }
  };

  // --- Questions Handlers ---
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = quiz.questions.map((q, i) => {
      if (i === index) {
        if (field.startsWith("option-")) {
          const optionIndex = parseInt(field.split("-")[1], 10);
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleAddQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question_text: "", options: ["", "", "", ""], correct_answer_index: 0 }
      ]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };


  if (loading) return (
    <div className="p-8 text-center min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-600">
            {quizId ? "Edit Quiz" : "Quiz Details (Sample Preview)"}
        </h2>

        {error && <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">Error: {error}</div>}
        {notFound && quizId && <div className="mb-4 p-3 rounded-md text-sm bg-yellow-100 text-yellow-700">Quiz with ID '{quizId}' not found. Displaying sample data for reference.</div>}
        {!quizId && <div className="mb-4 p-3 rounded-md text-sm bg-blue-100 text-blue-700">Displaying sample data for UI preview. No actual record is being edited.</div>}

        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : formMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
         <fieldset className="space-y-6" disabled={isSaving || (notFound && !!quizId) || (!quizId && quiz.title === dummyQuizData.title) }>
            {/* Quiz Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={quiz.title || ""}
                onChange={handleChange}
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                required
              />
            </div>

            {/* Museum Selection */}
            <div>
              <label htmlFor="museum_id" className="block text-sm font-medium text-gray-700 mb-1">Museum</label>
              <select
                id="museum_id"
                name="museum_id"
                value={quiz.museum_id || ""}
                onChange={handleChange}
                className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                required
              >
                <option value="">Select a Museum</option>
                {museums.map(museum => (
                  <option key={museum.id} value={museum.id}>{museum.name}</option>
                ))}
              </select>
            </div>

            {/* Questions Section */}
            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Questions</h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm" /* Ensured consistent button style */
                >
                  Add Question
                </button>
              </div>
              {quiz.questions && quiz.questions.map((q, index) => (
                <div key={index} className="p-4 border rounded-md mb-4 bg-gray-50 space-y-3">
                  <label htmlFor={`question_text-${index}`} className="block text-sm font-medium text-gray-700 mb-1"> {/* Standardized label */}
                    Question #{index + 1}
                  </label>
                  <textarea
                    id={`question_text-${index}`}
                    value={q.question_text || ""}
                    onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
                    placeholder="Enter question text"
                    className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white"
                    rows="2"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex}>
                        <label htmlFor={`option-${index}-${optIndex}`} className="block text-xs font-medium text-gray-600 mb-1"> {/* Standardized label */}
                          Option {optIndex + 1}
                        </label>
                        <input
                          type="text"
                          id={`option-${index}-${optIndex}`}
                          value={opt || ""}
                          onChange={(e) => handleQuestionChange(index, `option-${optIndex}`, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className="w-full rounded-md px-2 py-1 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label htmlFor={`correct_answer_index-${index}`} className="block text-sm font-medium text-gray-700 mb-1"> {/* Standardized label */}
                      Correct Answer
                    </label>
                    <select
                      id={`correct_answer_index-${index}`}
                      value={q.correct_answer_index}
                      onChange={(e) => handleQuestionChange(index, "correct_answer_index", parseInt(e.target.value, 10))}
                      className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                    >
                      {q.options.map((_, optIndex) => (
                        <option key={optIndex} value={optIndex}>Option {optIndex + 1}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow-sm text-xs font-medium"
                  >
                    Remove Question
                  </button>
                </div>
              ))}
              {quiz.questions && quiz.questions.length === 0 && <p className="text-gray-500 text-sm">No questions yet. Click "Add Question" to start.</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 pt-6 mt-6 border-t border-gray-200"> {/* Standardized spacing and border */}
              <button
                type="button"
                className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-semibold transition-colors duration-150" /* Adjusted padding */
                onClick={() => navigate(quizId ? -1 : "/admin/dashboard/quizzes")}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-70" /* Adjusted padding and disabled style */
                disabled={isSaving || (notFound && !!quizId) || (!quizId && quiz.title === dummyQuizData.title)}
              >
                {isSaving ? "Saving..." : (quizId ? "Save Changes" : "Preview (Not Savable)")}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default QuizEditPage;
