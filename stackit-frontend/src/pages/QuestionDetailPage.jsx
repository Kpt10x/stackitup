import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import AnswerItem from '../components/AnswerItem';
import { AuthContext } from '../context/AuthContext';

const QuestionDetailPage = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answerBody, setAnswerBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { user, isAuthenticated } = useContext(AuthContext);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/questions/${questionId}`);
      setQuestion(data);
    } catch (err) {
      setError('Failed to fetch question. It may have been deleted or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) {
      setSubmitError('Your answer cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data: newAnswer } = await axios.post(
        `/api/answers`,
        { body: answerBody, questionId: questionId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setQuestion(prev => ({ ...prev, answers: [...prev.answers, newAnswer] }));
      setAnswerBody('');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit your answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionVote = async (voteType) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axios.post(
        `/api/questions/${questionId}/vote`,
        { voteType },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setQuestion(prev => ({...prev, upvotes: data.upvotes, downvotes: data.downvotes, voteCount: data.voteCount }));
    } catch (err) {
      console.error('Failed to vote on question:', err);
    }
  };

  const handleAnswerVote = async (answerId, voteType) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axios.post(
        `/api/answers/${answerId}/vote`,
        { voteType },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(ans =>
          ans._id === answerId ? { ...ans, upvotes: data.upvotes, downvotes: data.downvotes, voteCount: data.voteCount } : ans
        )
      }));
    } catch (err) {
      console.error('Failed to vote on answer:', err);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!isAuthenticated) return;
    try {
       await axios.post(
        `/api/answers/${answerId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchQuestion();
    } catch (err) {
      console.error('Failed to accept answer:', err);
    }
  };

  if (loading) return <div className="text-center p-8">Loading question...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!question) return <div className="text-center p-8">Question not found.</div>;

  const isQuestionAuthor = user?._id === question.author._id;
  const hasUpvoted = question.upvotes.includes(user?._id);
  const hasDownvoted = question.downvotes.includes(user?._id);

  return (
    <div className="container mx-auto p-4">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold mb-3">{question.title}</h1>
        <div className="text-xs text-gray-500">
          Asked on {new Date(question.createdAt).toLocaleDateString()} by{' '}
          <span className="text-blue-600">{question.author?.username || 'Unknown'}</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        {/* Vote and Main Content */}
        <div className="flex-1">
          <div className="flex">
              {/* Question Vote Section */}
              <div className="flex flex-col items-center mr-4 w-12 flex-shrink-0">
                  <button title="Upvote" onClick={() => handleQuestionVote('up')} className={`text-gray-500 hover:text-green-500 ${hasUpvoted ? 'text-green-500' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <span className="text-2xl font-bold my-1">{question.voteCount}</span>
                  <button title="Downvote" onClick={() => handleQuestionVote('down')} className={`text-gray-500 hover:text-red-500 ${hasDownvoted ? 'text-red-500' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
              </div>
              {/* Question Body */}
              <div className="prose max-w-none flex-1">
                 <ReactQuill value={question.description} readOnly={true} theme="bubble" />
              </div>
          </div>
          <div className="flex space-x-2 my-8 ml-16">
            {question.tags.map(tag => (
              <span key={tag._id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {tag.name}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{question.answers.length} Answers</h2>
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              {question.answers.map(answer => (
                <AnswerItem
                  key={answer._id}
                  answer={answer}
                  onVote={handleAnswerVote}
                  onAccept={handleAcceptAnswer}
                  isQuestionAuthor={isQuestionAuthor}
                  currentUserId={user?._id}
                />
              ))}
            </div>
          </div>
          <div className="mt-10 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Your Answer</h2>
            {isAuthenticated ? (
              <form onSubmit={handleAnswerSubmit}>
                {submitError && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{submitError}</p>}
                <ReactQuill theme="snow" value={answerBody} onChange={setAnswerBody} className="bg-white rounded-md" />
                <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Post Your Answer'}
                </button>
              </form>
            ) : (
              <div>
                <p>You must be <Link to="/login" className="text-blue-600 hover:underline">logged in</Link> to post an answer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
