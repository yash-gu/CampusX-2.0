import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const StudyVault = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filters, setFilters] = useState({
    courseCode: '',
    professor: '',
    resourceType: 'all',
    search: '',
    sortBy: 'createdAt'
  });
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    courseCode: '',
    professor: '',
    resourceType: 'Notes',
    fileUrl: '',
    fileName: '',
    fileSize: '',
    tags: []
  });

  useEffect(() => {
    fetchResources();
    fetchCourses();
    fetchProfessors();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.courseCode) params.append('courseCode', filters.courseCode);
      if (filters.professor) params.append('professor', filters.professor);
      if (filters.resourceType !== 'all') params.append('resourceType', filters.resourceType);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const res = await api.get(`/api/study-resources?${params}`);
      setResources(res.data.resources);
      setLoading(false);
    } catch (error) {
      setError('Failed to load resources');
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/study-resources/courses/list');
      setCourses(res.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchProfessors = async () => {
    try {
      const res = await api.get('/api/study-resources/professors/list');
      setProfessors(res.data.professors);
    } catch (error) {
      console.error('Failed to fetch professors:', error);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/study-resources', {
        ...newResource,
        tags: newResource.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      setResources([res.data, ...resources]);
      setNewResource({
        title: '',
        description: '',
        courseCode: '',
        professor: '',
        resourceType: 'Notes',
        fileUrl: '',
        fileName: '',
        fileSize: '',
        tags: ''
      });
      setShowUploadForm(false);
    } catch (error) {
      setError('Failed to upload resource');
    }
  };

  const handleRating = async (resourceId, rating) => {
    try {
      const res = await api.put(`/api/study-resources/${resourceId}/rating`, { rating });
      setResources(resources.map(resource => 
        resource._id === resourceId ? {
          ...resource,
          averageRating: res.data.averageRating,
          ratings: [...resource.ratings.filter(r => r.user._id !== user.id), res.data.userRating]
        } : resource
      ));
    } catch (error) {
      setError('Failed to submit rating');
    }
  };

  const handleDownload = async (resourceId) => {
    try {
      const res = await api.put(`/api/study-resources/${resourceId}/download`);
      setResources(resources.map(resource => 
        resource._id === resourceId ? { ...resource, downloads: res.data.downloads } : resource
      ));
      window.open(res.data.fileUrl, '_blank');
    } catch (error) {
      setError('Failed to download resource');
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewResource({
        ...newResource,
        fileUrl: res.data.imageUrl,
        fileName: file.name,
        fileSize: file.size
      });
    } catch (error) {
      setError('Failed to upload file');
    }
  };

  const resourceTypes = ['Notes', 'Assignment', 'Lab Report', 'Previous Paper', 'Reference Material', 'Other'];

  const getUserRating = (resource) => {
    const userRating = resource.ratings.find(r => r.user._id === user.id);
    return userRating ? userRating.rating : 0;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStars = (rating, resourceId, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRating(resourceId, star)}
            className={`text-lg ${interactive ? 'cursor-pointer hover:text-yellow-500' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bennett-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bennett-blue mb-2">Study Vault</h1>
        <p className="text-gray-600">Peer-to-peer academic resource sharing</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <select
                  value={filters.courseCode}
                  onChange={(e) => setFilters({ ...filters, courseCode: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                <select
                  value={filters.professor}
                  onChange={(e) => setFilters({ ...filters, professor: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Professors</option>
                  {professors.map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                <select
                  value={filters.resourceType}
                  onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Types</option>
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search resources..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="input-field"
                >
                  <option value="createdAt">Latest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn-primary w-full lg:w-auto"
          >
            {showUploadForm ? 'Cancel' : 'Upload Resource'}
          </button>
        </div>
      </div>

      {showUploadForm && (
        <div className="mb-6">
          <form onSubmit={handleUploadResource} className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Study Resource</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="input-field"
                  placeholder="Resource title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  value={newResource.courseCode}
                  onChange={(e) => setNewResource({ ...newResource, courseCode: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="e.g., CSE101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                <input
                  type="text"
                  value={newResource.professor}
                  onChange={(e) => setNewResource({ ...newResource, professor: e.target.value })}
                  className="input-field"
                  placeholder="Professor name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                <select
                  value={newResource.resourceType}
                  onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value })}
                  className="input-field"
                >
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Describe the resource..."
                maxLength="300"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
              <input
                type="file"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                className="input-field"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                required
              />
              {newResource.fileName && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {newResource.fileName} ({formatFileSize(newResource.fileSize)})
                </p>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={newResource.tags}
                onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
                className="input-field"
                placeholder="e.g., algorithms, midterm, chapter1"
              />
            </div>
            <button type="submit" className="mt-4 btn-primary" disabled={!newResource.fileUrl}>
              Upload Resource
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No resources found. Upload the first study material!</p>
          </div>
        ) : (
          resources.map(resource => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              currentUser={user}
              onRating={handleRating}
              onDownload={handleDownload}
              renderStars={renderStars}
              getUserRating={getUserRating}
              formatFileSize={formatFileSize}
            />
          ))
        )}
      </div>
    </div>
  );
};

const ResourceCard = ({ resource, currentUser, onRating, onDownload, renderStars, getUserRating, formatFileSize }) => {
  const userRating = getUserRating(resource);

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-900 flex-1">{resource.title}</h3>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          {resource.resourceType}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">📚 Course:</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            {resource.courseCode}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">👨‍🏫 Professor:</span>
          <span>{resource.professor}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">📄 Size:</span>
          <span>{formatFileSize(resource.fileSize)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">⬇️ Downloads:</span>
          <span>{resource.downloads}</span>
        </div>
      </div>

      {resource.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {resource.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Rating:</span>
          <span className="text-sm text-gray-600">
            {resource.averageRating.toFixed(1)} ({resource.ratings.length} reviews)
          </span>
        </div>
        <div className="flex items-center justify-between">
          {renderStars(resource.averageRating, resource._id, true)}
          <span className="text-xs text-gray-500">
            {userRating > 0 ? `Your rating: ${userRating}★` : 'Click to rate'}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onDownload(resource._id)}
          className="flex-1 btn-primary text-sm"
        >
          📥 Download
        </button>
      </div>

      <div className="mt-4 flex items-center text-xs text-gray-500">
        <div className="w-6 h-6 bg-bennett-blue rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
          {resource.uploader.name.charAt(0).toUpperCase()}
        </div>
        <span>Uploaded by {resource.uploader.name}</span>
      </div>
    </div>
  );
};

export default StudyVault;
