import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CommentForm from '../components/CommentForm';
import { postsAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const { user } = useAuth();

  const COMMENTS_TO_SHOW = 3;

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const fetchPostAndComments = async () => {
    try {
      const [postResponse, commentsResponse] = await Promise.all([
        postsAPI.getPosts().then(response => 
          response.data.posts.find(p => p.id === parseInt(id))
        ),
        commentsAPI.getComments(id)
      ]);

      setPost(postResponse);
      setComments(commentsResponse.data.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    fetchPostAndComments();
    setReplyingTo(null);
  };

  const handleReplyClick = (comment) => {
    setReplyingTo(comment);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Get direct replies only (first level)
  const getDirectReplies = (commentId) => {
    return comments.filter(comment => comment.parent_id === commentId);
  };

  // Get ALL replies recursively (for counting)
  const getAllReplies = (commentId) => {
    const directReplies = getDirectReplies(commentId);
    let allReplies = [...directReplies];
    
    directReplies.forEach(reply => {
      allReplies = [...allReplies, ...getAllReplies(reply.id)];
    });
    
    return allReplies;
  };

  // Comment component - Only first-level replies get indentation
  const CommentItem = ({ comment, isFirstLevelReply = false }) => {
    const directReplies = getDirectReplies(comment.id);
    const allReplies = getAllReplies(comment.id);
    const hasReplies = directReplies.length > 0;
    const isReply = comment.parent_id !== null;

    // Only indent if it's a first-level reply (direct reply to a top-level comment)
    const shouldIndent = isFirstLevelReply && isReply;

    return (
      <div className={`${shouldIndent ? 'ml-12' : ''}`}>
        {/* Comment Card */}
        <div className={`
          relative mb-4 transition-all duration-300 
          ${isReply 
            ? '' 
            : ''
          }
        `}>
          {/* Main comment content */}
          <div className={`
            rounded-2xl p-4 transition-all duration-300
            ${isReply 
              ? 'bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm' 
              : 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-200/80 shadow-lg'
            }
            hover:shadow-xl hover:border-blue-200/60
          `}>
            {/* Comment Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                {/* User avatar */}
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                    bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg
                  `}>
                    {comment.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">
                      {comment.author?.username}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                {/* Reply indicator - Show who we're replying to */}
                {isReply && comment.parent_author && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200/50">
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-blue-600 font-medium">
                      @{comment.parent_author}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Reply Button */}
              {user && (
                <button
                  onClick={() => handleReplyClick(comment)}
                  className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 bg-white/80 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium border border-blue-200/50 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="text-sm">Reply</span>
                </button>
              )}
            </div>

            {/* Comment Content */}
            <p className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px] mb-3">
              {comment.content}
            </p>

            {/* Reply count with cute badge */}
            {allReplies.length > 0 && (
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100/50">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-medium">
                  {allReplies.length} {allReplies.length === 1 ? 'reply' : 'replies'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Render DIRECT replies - Pass isFirstLevelReply only for direct replies to top-level comments */}
        {hasReplies && (
          <div className="space-y-4">
            {directReplies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isFirstLevelReply={comment.parent_id === null} // Only indent if parent is top-level
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter(comment => !comment.parent_id);
  const displayedComments = showAllComments 
    ? topLevelComments 
    : topLevelComments.slice(0, COMMENTS_TO_SHOW);

  const hasMoreComments = topLevelComments.length > COMMENTS_TO_SHOW;
  const totalReplies = comments.filter(comment => comment.parent_id).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Post not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200 group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Post Card */}
      <div className="mb-8  flex  justify-center transform hover:scale-[1.01] transition-transform duration-300">
        <div className='w-full'>
          <PostCard post={post} onDeleteClick={() => {}} />
        </div>
      </div>

      {/* Comments Section */}
      <div className="mb-8 ">
        {/* Comments Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Conversation
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {topLevelComments.length} comments • {totalReplies} replies
            </p>
          </div>
        </div>

        {/* Comments List */}
        {topLevelComments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No comments yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {user ? 'Start the conversation by posting the first comment!' : 'Sign in to join the conversation!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {/* Show More/Less Comments */}
        {hasMoreComments && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>
                {showAllComments 
                  ? 'Show fewer comments' 
                  : `Show all ${topLevelComments.length} comments`
                }
              </span>
              <svg 
                className={`w-4 h-4 transform transition-transform duration-300 ${
                  showAllComments ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Static Comment Form */}
      {user && (
        <div className="sticky bottom-6 mt-8 bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200/60 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CommentForm
            postId={id}
            parentId={replyingTo?.id}
            onCommentAdded={handleCommentAdded}
            replyingTo={replyingTo}
            onCancelReply={handleCancelReply}
          />
        </div>
      )}
    </div>
  );
};

export default PostDetail;