import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSupabase } from "../../supabase";
import { format } from 'date-fns';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const supabase = getSupabase();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/login');
        return;
      }

      // Get museum for current user
      const { data: museumData, error: museumError } = await supabase
        .from('museums')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (museumError || !museumData) {
        setError("Please set up your museum details first.");
        setIsLoading(false);
        return;
      }

      // Get quizzes for this museum
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('museum_id', museumData.id)
        .order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;

      setQuizzes(quizzesData || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to load quizzes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      
      // Refresh the quizzes list
      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("Failed to delete quiz. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        <Link to="/admin/quizzes/new">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold shadow flex items-center gap-2">
            + Add Quiz
          </button>
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-700">
          {error}
        </div>
      )}
      
      <div className="rounded-lg bg-white shadow p-6 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No quizzes found. Create your first quiz to get started.
          </div>
        ) : (
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
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 font-medium">{quiz.title}</td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td>{formatDate(quiz.created_at)}</td>
                  <td>{formatDate(quiz.updated_at)}</td>
                  <td className="text-right space-x-2">
                    <Link to={`/admin/quizzes/edit/${quiz.id}`} className="inline-block">
                      <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">Edit</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
