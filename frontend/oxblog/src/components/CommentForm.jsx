import React, { useState, useRef, useEffect } from 'react';
import { commentsAPI } from '../services/api';

const CommentForm = ({ postId, parentId = null, onCommentAdded, replyingTo = null, onCancelReply }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Focus the input field when replyingTo changes
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await commentsAPI.createComment(postId, {
        content: content.trim(),
        parent_id: parentId
      });
      
      onCommentAdded(response.data.comment);
      setContent('');
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Reply Header */}
      {replyingTo && (
        <div className="flex items-center justify-between mb-3 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            Replying to <strong>@{replyingTo.author?.username}</strong>
          </span>
          <button
            onClick={onCancelReply}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyingTo ? `Reply to @${replyingTo.author?.username}...` : "Write a comment..."}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            required
          />
        </div>
        
        <div className="flex gap-2">
          {replyingTo && (
            <button
              type="button"
              onClick={onCancelReply}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;