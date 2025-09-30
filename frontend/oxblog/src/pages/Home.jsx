import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getPosts(currentPage);
      
      // Handle different response structures
      let postsData = [];
      let pagesTotal = 1;
      
      if (Array.isArray(response.data)) {
        postsData = response.data;
      } else if (response.data && Array.isArray(response.data.posts)) {
        postsData = response.data.posts;
        pagesTotal = response.data.total_pages || 1;
      } else if (Array.isArray(response.data)) {
        postsData = response.data;
        pagesTotal = response.data.total_pages || 1;
      } else {
        throw new Error('Unexpected response format from server');
      }
      
      setPosts(postsData);
      setTotalPages(pagesTotal);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            Unable to load posts
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-screen px-1 ">
      <div className="flex flex-col h-screen pt-4 lg:flex-row  gap-8 lg:gap-12">
        {/* Posts Column - Left Side with scrollable content */}
        <div className="lg:w-3/5  xl:w-2/3">
          {/* Header only for posts side */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-4 p-4 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Latest Posts</h1>
                <p className="text-blue-100">
                  {posts.length === 0 
                    ? 'Join the conversation and share your thoughts' 
                    : `Discover ${posts.length} amazing ${posts.length === 1 ? 'post' : 'posts'} from our community`
                  }
                </p>
              </div>
              {posts.length > 0 && (
                <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-center md:text-right">
                    <p className="text-blue-100 font-medium">Page {currentPage} of {totalPages}</p>
                    <p className="text-blue-200 text-sm">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable posts area */}
          <div className="max-h-[calc(100vh-140px)] custom-scrollbar  overflow-y-auto">
            <div className="space-y-6 pr-4">
              {posts.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-300 mb-4">
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {user ? 'Be the first to share your thoughts with the community!' : 'Sign in to create your first post and start the conversation!'}
                  </p>
                </div>
              ) : (
                posts.map(post => (
                  <ErrorBoundary key={post.id}>
                    <div className="bg-black max-w-fit rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-0.5">
                      <PostCard
                        post={post}
                        onDelete={handlePostDeleted}
                      />
                    </div>
                  </ErrorBoundary>
                ))
              )}
            </div>

            {/* Pagination - Now properly under posts */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex justify-center items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2.5 rounded-xl transition-all duration-200 font-medium min-w-[44px] ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PostForm Column - Right Side */}
        <div className="lg:w-2/5 xl:w-1/3">
          {user && (
            <div className="sticky top-1 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
                    <p className="text-gray-600 text-sm">Share what's on your mind</p>
                  </div>
                </div>
                <ErrorBoundary>
                  <PostForm onPostCreated={handlePostCreated} />
                </ErrorBoundary>
              </div>
              
              {/* Quick Stats Card */}
              {posts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>Community Stats</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Total Posts</span>
                      <span className="font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {posts.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Current Page</span>
                      <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                        {currentPage}/{totalPages}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;