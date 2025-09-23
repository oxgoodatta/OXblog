import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-100 w-16 h-screen items-center flex flex-col shadow-lg border-b">
      <div className="w-full  h-full">
        <div className="flex  justify-between items-center flex-col h-full ">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <div class="w-12 h-12 flex items-center justify-center  overflow-hidden">
                <img src="/OXBLOGLOGO.png" className="object-contain" />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-col w-full  md:flex justify-between items-center ">
            <Link
              to="/"
              className="text-gray-700  hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <img src="/icons8-search-50.png" alt="Search" className='w-8 h-8' />
            </Link>
            
            <Link
              to="/"
              className="text-gray-700  hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <img src="/icons8-home-48.png" alt="Home" className='w-8 h-8'/>
            </Link>
            <Link
              to="/"
              className="text-gray-700  hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <img src="/icons8-plus-64.png" alt="Home" className='w-8 h-8'/>
            </Link>
            <Link
              to="/"
              className="text-gray-700  hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <img src="/icons8-notification-48.png" alt="Home" className='w-8 h-8'/>
            </Link>
            <Link
              to="/"
              className="text-gray-700  hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <img src="/icons8-profile-64.png" alt="Home" className='w-8 h-8'/>
            </Link>
            
            {user && (
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Auth Section */}
          {/*
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 text-sm">
                  Welcome, <strong>@{user.username}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          */}
          <div className="flex items-center space-x-4">
           <Link
              to="/"
              className="text-gray-700  hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <img src="/icons8-logout-64.png" alt="Home" className='w-8 h-8'/>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;