import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">User Information</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Username</label>
                <p className="text-lg text-gray-800">@{user.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-800">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-lg text-gray-800">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
                Edit Profile
              </button>
              
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md">
                Change Password
              </button>
              
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;