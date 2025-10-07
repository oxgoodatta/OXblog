import React, { useState, useEffect } from 'react';
import { likesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PostCard = ({ post, onDeleteClick }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  useEffect(() => {
    if (post) {
      setIsLiked(post.is_liked || false);
      setLikesCount(post.likes_count || 0);
    }
  }, [post?.is_liked, post?.likes_count]);

  const safePost = post || {};
  const postId = safePost.id || '';
  const content = safePost.content || '';
  const author = safePost.author || {};
  const authorName = author.username || 'Unknown user';
  const authorId = author.id || '';
  const createdAt = safePost.created_at ? new Date(safePost.created_at).toLocaleString() : 'Unknown date';
  const commentsCount = safePost.comments_count || 0;
  const media = safePost.media || [];

  // Get user initial for profile icon
  const getUserInitial = () => {
    return authorName.charAt(0).toUpperCase();
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
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

  const renderMedia = () => {
  if (media.length === 0) return null;

  return (
    <div className={`mt-3 grid gap-2 ${
      media.length === 1 ? 'grid-cols-1' : 
      media.length === 2 ? 'grid-cols-2' : 
      'grid-cols-2'
    }`}>
      {media.map((item, index) => (
        <div key={item.id} className="relative">
          {item.file_type === 'video' ? (
            <video
              controls
              className="w-full h-48 object-cover rounded-lg bg-gray-100"
              onError={(e) => {
                console.error('Video failed to load:', {
                  url: e.target.src,
                  filename: item.filename,
                  fileType: item.file_type
                });
              }}
            >
              <source 
                src={`http://localhost:5000${item.url}`} 
                type={`video/${getVideoType(item.filename)}`} 
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={`http://localhost:5000${item.url}`}
              alt="Post media"
              className="w-full h-48 object-cover rounded-lg bg-gray-100"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Helper function to get correct video type
const getVideoType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const videoTypes = {
    'mp4': 'mp4',
    'mov': 'mp4', // MOV files often use mp4 codec
    'avi': 'x-msvideo',
    'webm': 'webm',
    'mkv': 'x-matroska'
  };
  return videoTypes[ext] || 'mp4'; // Default to mp4 if unknown
};

useEffect(() => {
  if (media.length > 0) {
    media.forEach((item, index) => {
      if (item.file_type === 'video') {
        console.log('Video details:', {
          filename: item.filename,
          url: item.url,
          fullUrl: `http://localhost:5000${item.url}`,
          extension: item.filename.split('.').pop(),
          videoType: getVideoType(item.filename)
        });
      }
    });
  }
}, [media]);

  // Function to render content with proper emoji support
  const renderContentWithEmojis = (text) => {
    if (!text) return null;
    
    return (
      <p className="text-gray-800 text-[14px] whitespace-pre-line break-words leading-relaxed mb-3">
        {text}
      </p>
    );
  };

  if (!post) {
    return null;
  }

  return (
    <Link to={`/post/${postId}`} className="block hover:bg-gray-50 transition-colors duration-200">
      <div className='bg-gradient-to-r from-blue-50/50 to-transparent rounded-2xl p-2'>
        <div className="bg-white min-w-[400px] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-2 max-w-full mx-auto">
          <div className="flex justify-between items-start mb-3 gap-4">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              {/* Profile Icon */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {getUserInitial()}
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-600 truncate">@{authorName}</h3>
                <p className="text-[10px] text-gray-500 ml-1">
                  {createdAt}
                </p>
              </div>
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
            {content && renderContentWithEmojis(content)}
            {renderMedia()}
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