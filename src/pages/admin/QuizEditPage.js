import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase"; // Assuming this path is correct

const QuizEditPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const supabase = getSupabase();

  const [quiz, setQuiz] = useState({
    title: "",
    museum_id: "",
    questions: [], // Array of objects: { question_text: "", options: ["", "", "", ""], correct_answer_index: 0 }
    rewards: { points: 0, badge_name: "" }, // Example structure
  });
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase client not available.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        // Fetch museums
        const { data: museumsData, error: museumsError } = await supabase
          .from("museums")
          .select("id, name");
        if (museumsError) throw museumsError;
        setMuseums(museumsData || []);

        // Fetch quiz details
        if (quizId) {
          const { data: quizData, error: quizError } = await supabase
            .from("quizzes")
            .select("*")
            .eq("id", quizId)
            .single();

          if (quizError) throw quizError;
          
          if (quizData) {
            setQuiz({
              title: quizData.title || "",
              museum_id: quizData.museum_id || "",
              // Ensure questions is an array, parse if string, default to empty array
              questions: Array.isArray(quizData.questions) ? quizData.questions : (typeof quizData.questions === 'string' ? JSON.parse(quizData.questions) : []),
              // Ensure rewards is an object, parse if string, default to empty object or specific structure
              rewards: typeof quizData.rewards === 'object' && quizData.rewards !== null ? quizData.rewards : (typeof quizData.rewards === 'string' ? JSON.parse(quizData.rewards) : { points: 0, badge_name: "" }),
            });
          } else {
            setError("Quiz not found.");
          }
        } else {
          setError("Quiz ID is missing."); // Should not happen with correct routing
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data. Ensure JSON parsing is safe.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, supabase]);

  // Basic handleChange for top-level quiz fields
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

    setLoading(true);
    setFormMessage(null);

    // Basic Validation
    if (!quiz.title.trim()) {
      setFormMessage({ type: "error", text: "Quiz title cannot be empty." });
      setLoading(false);
      return;
    }
    if (!quiz.museum_id) {
      setFormMessage({ type: "error", text: "Please select a museum." });
      setLoading(false);
      return;
    }
    if (!quiz.questions || quiz.questions.length === 0) {
      setFormMessage({ type: "error", text: "A quiz must have at least one question." });
      setLoading(false);
      return;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question_text.trim()) {
        setFormMessage({ type: "error", text: `Question #${i + 1} text cannot be empty.` });
        setLoading(false);
        return;
      }
      const filledOptions = q.options.filter(opt => opt && opt.trim() !== "").length;
      if (filledOptions < 2) {
        setFormMessage({ type: "error", text: `Question #${i + 1} must have at least 2 filled options.` });
        setLoading(false);
        return;
      }
      // Ensure correct_answer_index is a number and within bounds
      const correctAnswerIndex = Number(q.correct_answer_index);
      if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= q.options.length) {
         setFormMessage({ type: "error", text: `Question #${i + 1} has an invalid correct answer selection.` });
         setLoading(false);
         return;
      }
    }
    
    // Rewards validation (optional, based on requirements)
    if (quiz.rewards.points < 0) { // Assuming points should not be negative
        setFormMessage({ type: "error", text: "Reward points cannot be negative." });
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase
        .from("quizzes")
        .update({
          title: quiz.title,
          museum_id: quiz.museum_id,
          questions: quiz.questions, 
          rewards: quiz.rewards,     
          updated_at: new Date().toISOString(), // Explicitly set updated_at
        })
        .eq("id", quizId)
        .select(); 

      if (error) throw error;

      setFormMessage({ type: "success", text: "Quiz updated successfully!" });
      // Update local state with the potentially modified data from DB (e.g. updated_at)
      if (data && data.length > 0) {
         setQuiz(prevQuiz => ({
            ...prevQuiz,
            // Assuming questions and rewards are fine as they are,
            // but if db modifies them (e.g. through triggers), re-set them from data[0]
            updated_at: data[0].updated_at 
         }));
      }
      setTimeout(() => navigate("/admin/dashboard/quizzes"), 2000); 
    } catch (err) {
      console.error("Error updating quiz:", err);
      setFormMessage({ type: "error", text: err.message || "Failed to update quiz." });
    } finally {
      setLoading(false);
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

  // --- Rewards Handlers ---
  const handleRewardChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [name]: name === 'points' ? parseInt(value, 10) || 0 : value
      }
    }));
  };


  if (loading) return <div className="p-8 text-center">Loading quiz details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  // Removed !quiz check as quiz is initialized and might be partially filled for a new quiz scenario (though this is Edit page)
  // if (!quiz && !loading) return <div className="p-8 text-center">Quiz not found or could not be loaded.</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-600">Edit Quiz</h2>

        {formMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === "success" ? "bg-green-100 text-green-700" : formMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Quiz Title */}
          <div>
            <label htmlFor="title" className="block mb-1 font-semibold text-gray-700">Quiz Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={quiz.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              required
            />
          </div>

          {/* Museum Selection */}
          <div>
            <label htmlFor="museum_id" className="block mb-1 font-semibold text-gray-700">Museum</label>
            <select
              id="museum_id"
              name="museum_id"
              value={quiz.museum_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
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
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium"
              >
                Add Question
              </button>
            </div>
            {quiz.questions && quiz.questions.map((q, index) => (
              <div key={index} className="p-4 border rounded-md mb-4 bg-gray-50 space-y-3">
                <label htmlFor={`question_text-${index}`} className="block text-sm font-medium text-gray-700">
                  Question #{index + 1}
                </label>
                <textarea
                  id={`question_text-${index}`}
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
                  placeholder="Enter question text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  rows="2"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex}>
                      <label htmlFor={`option-${index}-${optIndex}`} className="block text-xs font-medium text-gray-600">
                        Option {optIndex + 1}
                      </label>
                      <input
                        type="text"
                        id={`option-${index}-${optIndex}`}
                        value={opt}
                        onChange={(e) => handleQuestionChange(index, `option-${optIndex}`, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor={`correct_answer_index-${index}`} className="block text-sm font-medium text-gray-700">
                    Correct Answer
                  </label>
                  <select
                    id={`correct_answer_index-${index}`}
                    value={q.correct_answer_index}
                    onChange={(e) => handleQuestionChange(index, "correct_answer_index", parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
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

          {/* Rewards Section */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Rewards</h3>
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              <div>
                <label htmlFor="rewards_points" className="block text-sm font-medium text-gray-700">Points</label>
                <input
                  type="number"
                  id="rewards_points"
                  name="points"
                  value={quiz.rewards.points || 0}
                  onChange={handleRewardChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label htmlFor="rewards_badge_name" className="block text-sm font-medium text-gray-700">Badge Name</label>
                <input
                  type="text"
                  id="rewards_badge_name"
                  name="badge_name"
                  value={quiz.rewards.badge_name || ""}
                  onChange={handleRewardChange}
                  placeholder="e.g., History Buff"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <button
              type="button"
              className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold transition-colors duration-150"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-colors duration-150 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizEditPage;
