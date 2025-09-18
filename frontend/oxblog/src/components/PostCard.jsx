import React, { useState } from 'react';
import { likesAPI, postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = async () => {
    try {
      const response = await likesAPI.likePost(post.id);
      setIsLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(post.id);
        onDelete(post.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <Link to={`/post/${post.id}`}>
    {/* Post content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                <h3 className="font-semibold text-gray-800">@{post.author.username}</h3>
                <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleString()}
                </p>
                </div>
                
                {user?.id === post.author.id && (
                <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700 text-sm"
                >
                    Delete
                </button>
                )}
            </div>

            <p className="text-gray-800 mb-4">{post.content}</p>

            <div className="flex items-center space-x-4 text-gray-600">
                <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${
                    isLiked ? 'text-red-500' : 'hover:text-red-500'
                }`}
                >
                <span>❤️</span>
                <span>{likesCount}</span>
                </button>

                <button className="flex items-center space-x-1 hover:text-blue-500">
                <span>💬</span>
                <span>{post.comments_count}</span>
                </button>

                <button className="hover:text-blue-500">Share</button>
            </div>
        </div>
    </Link>
  );
};

export default PostCard;