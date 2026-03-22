import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    enrollmentNo: user?.enrollmentNo || '',
    branch: user?.branch || 'CSE',
    year: user?.year || '1',
    bio: user?.bio || '',
    profilePic: user?.profilePic || ''
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/api/auth/profile', profileData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      // Update user context if needed
    } catch (error) {
      setError('Failed to update profile');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const branches = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'BT', 'Other'];
  const years = ['1', '2', '3', '4'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bennett-blue mb-2">Profile</h1>
        <p className="text-gray-600">Manage your CampusX profile</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-bennett-blue p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profileData.profilePic ? (
                <img
                  src={profileData.profilePic}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center text-bennett-blue text-2xl font-bold ${profileData.profilePic ? 'hidden' : ''}`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <p className="text-blue-100">{user?.enrollmentNo}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                editMode
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'btn-primary'
              }`}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="input-field"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    name="enrollmentNo"
                    value={profileData.enrollmentNo}
                    onChange={handleChange}
                    className="input-field"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Enrollment number cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={profileData.branch}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    name="year"
                    value={profileData.year}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}st Year</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  className="input-field"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  maxLength="200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profileData.bio.length}/200 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <ImageUpload
                  onImageUpload={(imageUrl) => setProfileData({ ...profileData, profilePic: imageUrl })}
                  existingImage={profileData.profilePic}
                  placeholder="Upload Profile Picture"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                  <p className="text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Enrollment Number</h4>
                  <p className="text-gray-900">{user?.enrollmentNo}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Branch & Year</h4>
                  <p className="text-gray-900">{user?.branch} - {user?.year}st Year</p>
                </div>
              </div>
              {user?.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Bio</h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Logout</h4>
              <p className="text-sm text-gray-600">Sign out of your CampusX account</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
