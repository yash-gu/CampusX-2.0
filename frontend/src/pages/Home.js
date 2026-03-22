import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-bennett-blue to-bennett-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to CampusX
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Bennett University's Social Marketplace Platform
          </p>
          
          {!isAuthenticated ? (
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <Link
                to="/register"
                className="block md:inline-block bg-white text-bennett-blue px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="block md:inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-bennett-blue transition-colors duration-200"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/feed"
                className="block md:inline-block bg-white text-bennett-blue px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 text-center"
              >
                The Buzz
              </Link>
              <Link
                to="/marketplace"
                className="block md:inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-bennett-blue transition-colors duration-200 text-center"
              >
                Unimart
              </Link>
              <Link
                to="/calendar"
                className="block md:inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-bennett-blue transition-colors duration-200 text-center"
              >
                Calendar
              </Link>
              <Link
                to="/study-vault"
                className="block md:inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-bennett-blue transition-colors duration-200 text-center"
              >
                Study Vault
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center">
            <div className="text-bennett-blue text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-bennett-blue mb-2">The Buzz</h3>
            <p className="text-gray-700">
              Share thoughts, updates, and connect with fellow Bennett University students
            </p>
          </div>
          
          <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center">
            <div className="text-bennett-blue text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-bennett-blue mb-2">Unimart</h3>
            <p className="text-gray-700">
              Buy, sell, and trade items within the Bennett University community
            </p>
          </div>
          
          <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center">
            <div className="text-bennett-blue text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-bennett-blue mb-2">Campus Calendar</h3>
            <p className="text-gray-700">
              Events, deadlines, and activities with RSVP and calendar integration
            </p>
          </div>
          
          <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center">
            <div className="text-bennett-blue text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-bennett-blue mb-2">Study Vault</h3>
            <p className="text-gray-700">
              Peer-to-peer notes sharing with ratings and course-specific filtering
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white bg-opacity-90 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-bennett-blue mb-4 text-center">
            Why CampusX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="text-bennett-blue text-2xl">✓</div>
              <div>
                <h4 className="font-semibold text-gray-800">Exclusive to Bennett University</h4>
                <p className="text-gray-600">Only @bennett.edu.in email addresses allowed</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-bennett-blue text-2xl">✓</div>
              <div>
                <h4 className="font-semibold text-gray-800">Secure & Private</h4>
                <p className="text-gray-600">Your data is safe within our university community</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-bennett-blue text-2xl">✓</div>
              <div>
                <h4 className="font-semibold text-gray-800">Real-time Communication</h4>
                <p className="text-gray-600">Instant messaging and notifications</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-bennett-blue text-2xl">✓</div>
              <div>
                <h4 className="font-semibold text-gray-800">Student-to-Student Marketplace</h4>
                <p className="text-gray-600">Trade books, electronics, and more with peers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
