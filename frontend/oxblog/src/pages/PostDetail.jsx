import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import { postsAPI, commentsAPI } from '../services/api';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setComments(commentsResponse.data.comments);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev]);
  };

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
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        ← Back to Home
      </Link>

      <PostCard post={post} onDelete={() => {}} />
      
      <CommentSection
        comments={comments}
        postId={id}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default PostDetail;