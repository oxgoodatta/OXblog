import React, { useState } from 'react';
import { likesAPI, postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Safe access to post properties with fallbacks
  const safePost = post || {};
  const postId = safePost.id || '';
  const content = safePost.content || '';
  const author = safePost.author || {};
  const authorName = author.username || 'Unknown user';
  const authorId = author.id || '';
  const createdAt = safePost.created_at ? new Date(safePost.created_at).toLocaleString() : 'Unknown date';
  const commentsCount = safePost.comments_count || 0;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await likesAPI.likePost(postId);
      setIsLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        await postsAPI.deletePost(postId);
        if (onDelete) {
          onDelete(postId);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete post. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Don't render if post is invalid
  if (!post) {
    return null;
  }

  return (
    <Link to={`/post/${postId}`} className="block hover:bg-gray-50 transition-colors duration-200">
      <div className="bg-white min-w-[400px] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-3 max-w-full w-fit mx-auto">
        <div className="flex justify-between items-start mb-3 gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-blue-600 truncate">@{authorName}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {createdAt}
            </p>
          </div>
          
          {user && user.id === authorId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50 whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-line break-words leading-relaxed">
            {content}
          </p>
        </div>

        <div className="flex items-center space-x-6 text-gray-600 pt-2 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              isLiked ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">{commentsCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;