import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsAPI, usersAPI, followAPI } from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    } else {
      // If no username in URL, redirect to current user's profile
      if (currentUser) {
        navigate(`/user/${currentUser.username}`, { replace: true });
      } else {
        navigate('/login');
      }
    }
  }, [username, currentUser, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching profile for:', username);
      
      // Get user profile
      const userResponse = await usersAPI.getUserProfile(username);
      console.log('User API response:', userResponse);
      
      if (!userResponse.data.user) {
        throw new Error('User not found in response');
      }
      
      const userData = userResponse.data.user;
      setUser(userData);
      
      // Get user's posts
      try {
        const postsResponse = await postsAPI.getPosts(1);
        const allPosts = postsResponse.data.posts;
        const userPosts = allPosts.filter(post => 
          post.author && 
          post.author.username && 
          post.author.username.toLowerCase() === username.toLowerCase()
        );
        setUserPosts(userPosts);
      } catch (postsError) {
        console.warn('Could not load user posts:', postsError);
        setUserPosts([]);
      }
      
    } catch (err) {
      console.error('Profile fetch error:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      setFollowLoading(true);
      
      if (user.is_following) {
        await followAPI.unfollowUser(user.id);
        setUser(prev => ({
          ...prev,
          is_following: false,
          followers_count: prev.followers_count - 1
        }));
      } else {
        await followAPI.followUser(user.id);
        setUser(prev => ({
          ...prev,
          is_following: true,
          followers_count: prev.followers_count + 1
        }));
      }
    } catch (err) {
      console.error('Follow error:', err);
      setError('Failed to update follow status');
    } finally {
      setFollowLoading(false);
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
          <p className="text-sm text-gray-500 mb-4">Username: {username}</p>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* User Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
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
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{user.followers_count}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{user.following_count}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Follow Button */}
            {currentUser && !isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  user.is_following
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {followLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : user.is_following ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            )}
            
            {/* Edit Profile Button for Own Profile */}
            {isOwnProfile && (
              <Link
                to="/settings"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors"
              >
                Edit Profile
              </Link>
            )}
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
                {isOwnProfile 
                  ? "You haven't created any posts yet. Start sharing your thoughts!" 
                  : `@${user.username} hasn't created any posts yet.`
                }
              </p>
              {isOwnProfile && (
                <Link
                  to="/create"
                  className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  Create Your First Post
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;