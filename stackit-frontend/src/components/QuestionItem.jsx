import React from 'react';
import { Link } from 'react-router-dom';

const QuestionItem = ({ question }) => {
  const {
    _id,
    title,
    author,
    tags,
    voteCount = 0, // Default to 0 if not present
    answers = [], // Default to empty array
    createdAt,
  } = question;

  // A simple function to format time since post
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="flex p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      {/* Stats Section */}
      <div className="flex flex-col items-end text-sm text-gray-600 pr-6 w-28 flex-shrink-0">
        <span className="mb-1">{voteCount} votes</span>
        <span className={`p-1 rounded ${answers.length > 0 ? 'bg-green-100 text-green-800' : 'bg-transparent'}`}>
          {answers.length} answers
        </span>
      </div>

      {/* Main Content Section */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-800">
          <Link to={`/questions/${_id}`}>{title}</Link>
        </h2>
        <div className="flex items-center justify-between mt-2">
          {/* Tags */}
          <div className="flex space-x-2">
            {tags.map((tag) => (
              <span key={tag._id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {tag.name}
              </span>
            ))}
          </div>
          {/* Author and Date */}
          <div className="text-xs text-gray-500">
            asked {timeSince(createdAt)} by <span className="text-blue-600">{author?.username || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionItem;
