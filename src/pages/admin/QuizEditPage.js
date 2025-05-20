import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const initialQuizzes = [
  { title: "Indian Heritage Quiz", description: "", questions: 10, created: "May 10, 2023", updated: "May 15, 2023", questionsList: [{ text: "", options: ["", "", "", ""], answer: 0 }] },
  { title: "Ancient Artifacts Knowledge Test", description: "", questions: 8, created: "Jun 5, 2023", updated: "Jun 5, 2023", questionsList: [{ text: "", options: ["", "", "", ""], answer: 0 }] },
  { title: "Modern Art Quiz", description: "", questions: 12, created: "Apr 20, 2023", updated: "Apr 25, 2023", questionsList: [{ text: "", options: ["", "", "", ""], answer: 0 }] },
  { title: "Archaeological Wonders", description: "", questions: 15, created: "Jul 12, 2023", updated: "Jul 14, 2023", questionsList: [{ text: "", options: ["", "", "", ""], answer: 0 }] },
  { title: "Cultural Heritage of India", description: "", questions: 10, created: "Mar 18, 2023", updated: "Mar 20, 2023", questionsList: [{ text: "", options: ["", "", "", ""], answer: 0 }] },
];

const QuizEditPage = () => {
  const { idx } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    setQuiz(initialQuizzes[idx]);
  }, [idx]);

  const handleChange = (field, value) => {
    setQuiz({ ...quiz, [field]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Quiz updated! (not implemented)");
  };

  if (!quiz) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Edit Quiz</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl">
        <div>
          <label className="block mb-2 font-semibold">Quiz Title</label>
          <input
            value={quiz.title}
            onChange={e => handleChange("title", e.target.value)}
            className="rounded px-2 py-1 bg-gray-100 text-gray-900 border border-gray-200 w-full"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Description</label>
          <textarea
            value={quiz.description}
            onChange={e => handleChange("description", e.target.value)}
            className="rounded px-2 py-1 bg-gray-100 text-gray-900 border border-gray-200 w-full"
          />
        </div>
        {/* Add similar logic for editing questions if needed */}
        <div className="flex justify-end">
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default QuizEditPage;
