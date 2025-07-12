import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuestionItem from '../components/QuestionItem';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/questions?page=${page}`);
        setQuestions(data.questions);
        setPage(data.page);
        setPages(data.pages);
        setCount(data.count);
      } catch (err) {
        setError('Failed to fetch questions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [page]); // Refetch when page changes

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Questions</h1>
        <Link to="/ask" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Ask Question
        </Link>
      </div>

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 text-sm text-gray-600">
              {count} questions
            </div>
            <div>
              {questions.length > 0 ? (
                questions.map((question) => (
                  <QuestionItem key={question._id} question={question} />
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">No questions found.</p>
              )}
            </div>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default HomePage;
