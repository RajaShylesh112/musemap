import React, { useState } from "react";
import { Link } from "react-router-dom";

const initialQuizzes = [
  { title: "Indian Heritage Quiz", questions: 10, created: "May 10, 2023", updated: "May 15, 2023" },
  { title: "Ancient Artifacts Knowledge Test", questions: 8, created: "Jun 5, 2023", updated: "Jun 5, 2023" },
  { title: "Modern Art Quiz", questions: 12, created: "Apr 20, 2023", updated: "Apr 25, 2023" },
  { title: "Archaeological Wonders", questions: 15, created: "Jul 12, 2023", updated: "Jul 14, 2023" },
  { title: "Cultural Heritage of India", questions: 10, created: "Mar 18, 2023", updated: "Mar 20, 2023" },
];

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState(initialQuizzes);

  const handleDelete = (idx) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        <a href="/admin/quizzes/new">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold shadow flex items-center gap-2">
            + Add Quiz
          </button>
        </a>
      </div>
      <div className="rounded-lg bg-white shadow p-6 overflow-x-auto">
        <table className="w-full text-left min-w-[600px] md:table-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2">Title</th>
              <th>Questions</th>
              <th>Created</th>
              <th>Last Updated</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 font-medium">{quiz.title}</td>
                <td>{quiz.questions}</td>
                <td>{quiz.created}</td>
                <td>{quiz.updated}</td>
                <td className="text-right space-x-2">
                  <Link to={`/admin/quizzes/edit/${idx}`} className="inline-block">
                    <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizzesPage;
