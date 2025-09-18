import React, { useState } from 'react';
import { commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CommentForm = ({ postId, parentId, onCommentAdded, placeholder = "Write a comment...", buttonText = "Comment" }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const commentData = { content: content.trim() };
      if (parentId) {
        commentData.parent_id = parentId;
      }

      const response = await commentsAPI.createComment(postId, commentData);
      onCommentAdded(response.data.comment);
      setContent('');
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">Please login to comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
          />
          
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
            >
              {isSubmitting ? 'Posting...' : buttonText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;