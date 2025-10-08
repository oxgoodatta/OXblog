import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'users', 'posts'
  const { user } = useAuth();

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch(query, searchType);
    }
  }, [query, searchType]);

  const performSearch = async (searchQuery, type = 'all') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await searchAPI.searchAll(searchQuery, type);
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to perform search');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('searchQuery').trim();
    
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
  };

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Search</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                name="searchQuery"
                placeholder="Search for users or posts..."
                defaultValue={query}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={2}
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Search Type Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => handleSearchTypeChange('all')}
              className={`px-4 py-2 font-medium ${
                searchType === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleSearchTypeChange('users')}
              className={`px-4 py-2 font-medium ${
                searchType === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => handleSearchTypeChange('posts')}
              className={`px-4 py-2 font-medium ${
                searchType === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts
            </button>
          </div>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && query && (
          <div className="space-y-6">
            {/* Users Results */}
            {(searchType === 'all' || searchType === 'users') && searchResults.users.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Users ({searchResults.users_total || searchResults.users.length})
                </h2>
                <div className="space-y-3">
                  {searchResults.users.map((userResult) => (
                    <Link
                      key={userResult.id}
                      to={`/user/${userResult.username}`}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {userResult.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">@{userResult.username}</h3>
                        <p className="text-sm text-gray-600">
                          {userResult.total_posts} posts • Joined {new Date(userResult.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {(searchType === 'all' || searchType === 'posts') && searchResults.posts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Posts ({searchResults.posts_total || searchResults.posts.length})
                </h2>
                <div className="space-y-4">
                  {searchResults.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && 
             searchResults.users.length === 0 && 
             searchResults.posts.length === 0 && 
             query && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-600">
                  No users or posts found for "{query}". Try different keywords.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!query && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Searching</h3>
            <p className="text-gray-600">
              Enter a search term above to find users and posts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;