import React, { useState } from 'react';
import api from '../utils/api';

const ImageUpload = ({ onImageUpload, existingImage, placeholder = "Upload image" }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(existingImage || '');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = res.data.imageUrl;
      setPreview(imageUrl);
      onImageUpload(imageUrl);
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageUpload('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-4">
        <label className="cursor-pointer">
          <span className="btn-secondary inline-block">
            {uploading ? 'Uploading...' : placeholder}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
        
        {preview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove Image
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border border-gray-300"
            onError={(e) => {
              e.target.style.display = 'none';
              setError('Failed to load image preview');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
