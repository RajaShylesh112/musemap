import React, { useState } from "react";

const QuizCreatePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], answer: 0 }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], answer: 0 }]);
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    if (field === "text") updated[idx].text = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleAnswerChange = (qIdx, value) => {
    const updated = [...questions];
    updated[qIdx].answer = value;
    setQuestions(updated);
  };

  const handleSubmit = e => {
    e.preventDefault();
    alert("Quiz created! (not implemented)");
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>
      <form onSubmit={handleSubmit} className="max-w-3xl bg-white rounded-lg p-6 border border-gray-200 shadow">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Quiz Title</label>
          <input className="w-full rounded px-3 py-2 bg-gray-100 text-gray-900" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Description</label>
          <textarea className="w-full rounded px-3 py-2 bg-gray-100 text-gray-900" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg">Questions</span>
            <button type="button" onClick={handleAddQuestion} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold">Add Question</button>
          </div>
          {questions.map((q, idx) => (
            <div key={idx} className="mb-4 border rounded p-4 bg-gray-50">
              <div className="mb-2">
                <label className="block font-semibold mb-1">Question {idx + 1}</label>
                <input className="w-full rounded px-3 py-2 bg-white text-gray-900 border border-gray-200" value={q.text} onChange={e => handleQuestionChange(idx, "text", e.target.value)} />
              </div>
              <div className="mb-2">
                <span className="block font-semibold mb-1">Options (select the correct answer)</span>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2 mb-1">
                    <input type="radio" name={`answer-${idx}`} checked={q.answer === oIdx} onChange={() => handleAnswerChange(idx, oIdx)} />
                    <input className="rounded px-2 py-1 bg-gray-100 text-gray-900 border border-gray-200 w-64" value={opt} onChange={e => handleOptionChange(idx, oIdx, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow">Create Quiz</button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreatePage;
