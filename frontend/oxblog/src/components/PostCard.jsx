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
    <Link to={`/post/${postId}`} className="block hover:bg-gray-50 transition-colors rounded-lg">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">@{authorName}</h3>
            <p className="text-sm text-gray-500">
              {createdAt}
            </p>
          </div>
          
          {user && user.id === authorId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>

        <p className="text-gray-800 mb-4 whitespace-pre-line">{content}</p>

        <div className="flex items-center space-x-4 text-gray-600">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center space-x-1 text-gray-600">
            <span>💬</span>
            <span>{commentsCount}</span>
          </div>

          <button className="hover:text-blue-500" onClick={(e) => e.preventDefault()}>
            Share
          </button>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;