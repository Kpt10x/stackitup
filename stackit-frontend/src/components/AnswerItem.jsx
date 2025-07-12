import React from 'react';
import ReactQuill from 'react-quill';

const AnswerItem = ({ answer, onVote, onAccept, isQuestionAuthor, currentUserId }) => {
  const { _id, body, author, createdAt, isAccepted, upvotes, downvotes, voteCount = 0 } = answer;

  const hasUpvoted = upvotes.includes(currentUserId);
  const hasDownvoted = downvotes.includes(currentUserId);

  // A simple function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`p-4 border-b border-gray-200 flex ${isAccepted ? 'bg-green-50' : ''}`}>
      {/* Vote Section */}
      <div className="flex flex-col items-center mr-4 w-12">
        <button
          title="Upvote"
          className={`text-gray-500 hover:text-green-500 ${hasUpvoted ? 'text-green-500' : ''}`}
          onClick={() => onVote(_id, 'up')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <span className="text-xl font-bold my-1">{voteCount}</span>
        <button
          title="Downvote"
          className={`text-gray-500 hover:text-red-500 ${hasDownvoted ? 'text-red-500' : ''}`}
          onClick={() => onVote(_id, 'down')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isAccepted && (
          <div title="Accepted Answer" className="text-green-500 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        {isQuestionAuthor && !isAccepted && (
             <button
                title="Accept this answer"
                className="text-gray-400 hover:text-green-600 mt-2"
                onClick={() => onAccept(_id)}
             >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
            </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="prose max-w-none">
            <ReactQuill
                value={body}
                readOnly={true}
                theme="bubble"
            />
        </div>
        <div className="mt-4 text-xs text-gray-500 text-right">
          answered on {formatDate(createdAt)} by <span className="text-blue-600">{author?.username || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnswerItem;
