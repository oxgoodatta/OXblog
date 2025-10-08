import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, get user info and posts
      // Note: You might need to create a new API endpoint for user posts
      // For now, we'll fetch all posts and filter by username
      const postsResponse = await postsAPI.getPosts(1);
      const allPosts = postsResponse.data.posts;
      
      // Find user from posts and filter their posts
      const userPosts = allPosts.filter(post => post.author.username === username);
      
      if (userPosts.length > 0) {
        const userData = userPosts[0].author;
        setUser({
          ...userData,
          total_posts: userPosts.length
        });
        setUserPosts(userPosts);
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* User Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">@{user.username}</h1>
              <p className="text-gray-600 mt-1">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-6 mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{user.total_posts}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Posts Yet</h3>
              <p className="text-gray-600">
                @{user.username} hasn't created any posts yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;