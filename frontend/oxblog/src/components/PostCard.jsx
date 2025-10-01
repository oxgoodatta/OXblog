import React, { useState, useEffect } from 'react'; // Added useEffect import
import { likesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PostCard = ({ post, onDeleteClick }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  // Add this useEffect to sync with post data on refresh
  useEffect(() => {
    if (post) {
      setIsLiked(post.is_liked || false);
      setLikesCount(post.likes_count || 0);
    }
  }, [post?.is_liked, post?.likes_count]); // This will update when post data changes

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
    
    if (!user) {
      // Optional: redirect to login or show message
      alert('Please login to like posts');
      return;
    }
    
    try {
      const response = await likesAPI.likePost(postId);
      setIsLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(postId);
    }
  };

  // Don't render if post is invalid
  if (!post) {
    return null;
  }

  return (
    <Link to={`/post/${postId}`} className="block hover:bg-gray-50 transition-colors duration-200">
      <div className='bg-gradient-to-r from-blue-50/50 to-transparent rounded-2xl p-2'>
        <div className="bg-white min-w-[400px] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border  border-gray-100 p-2 max-w-full  mx-auto">
          <div className="flex justify-between items-start mb-3 gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-blue-600 truncate">@{authorName}</h3>
              <p className="text-[10px] text-gray-500 ml-1">
                {createdAt}
              </p>
            </div>
            
            {user && user.id === authorId && (
              <button
                onClick={handleDeleteClick}
                className="text-red-500 hover:text-red-700 text-sm whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          <div className="mb-1">
            <p className="text-gray-800 text-[14px] whitespace-pre-line break-words leading-relaxed">
              {content}
            </p>
          </div>

          <div className="flex items-center space-x-6 text-gray-600 pt-1 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <span className="text-sm">{isLiked ? '❤️' : '🤍'}</span>
              <span className="text-xs font-medium">{likesCount}</span>
            </button>

            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm">💬</span>
              <span className="text-xs font-medium">{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;