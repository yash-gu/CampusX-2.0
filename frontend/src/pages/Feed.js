import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState({ text: '', image: '' });
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data.posts);
      setLoading(false);
    } catch (error) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/posts', newPost);
      setPosts([res.data, ...posts]);
      setNewPost({ text: '', image: '' });
      setShowPostForm(false);
    } catch (error) {
      setError('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.put(`/api/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId ? res.data.post : post
      ));
    } catch (error) {
      setError('Failed to like post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
      } catch (error) {
        setError('Failed to delete post');
      }
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const res = await api.post(`/api/posts/${postId}/comments`, { text: commentText });
      setPosts(posts.map(post => 
        post._id === postId ? {
          ...post,
          comments: [...post.comments, res.data.comment]
        } : post
      ));
    } catch (error) {
      setError('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bennett-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bennett-blue mb-2">The Buzz</h1>
        <p className="text-gray-600">What's happening at Bennett University?</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="w-full btn-primary"
        >
          {showPostForm ? 'Cancel' : 'Create Post'}
        </button>

        {showPostForm && (
          <form onSubmit={handleCreatePost} className="mt-4 card p-6">
            <div className="mb-4">
              <textarea
                value={newPost.text}
                onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bennett-blue focus:border-transparent"
                rows="4"
                maxLength="500"
                required
              />
            </div>
            <div className="mb-4">
              <ImageUpload
                onImageUpload={(imageUrl) => setNewPost({ ...newPost, image: imageUrl })}
                existingImage={newPost.image}
                placeholder="Add Image"
              />
            </div>
            <button type="submit" className="btn-primary">
              Post
            </button>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onLike={handleLike}
              onDelete={handleDeletePost}
              onAddComment={handleAddComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUser, onLike, onDelete, onAddComment }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const isLiked = post.likes.includes(currentUser.id);
  const canDelete = post.author._id === currentUser.id;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setCommenting(true);
    await onAddComment(post._id, commentText);
    setCommentText('');
    setCommenting(false);
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-bennett-blue rounded-full flex items-center justify-center text-white font-semibold">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
            <p className="text-sm text-gray-500">
              {post.author.enrollmentNo} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(post._id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post image"
            className="mt-3 rounded-lg max-w-full h-auto"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{post.likes.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
        >
          <span>💬</span>
          <span>{post.comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="border-t pt-4">
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 input-field"
                maxLength="200"
              />
              <button
                type="submit"
                disabled={commenting || !commentText.trim()}
                className="btn-primary disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {post.comments.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-semibold">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="font-semibold text-sm text-gray-900">{comment.author.name}</p>
                    <p className="text-gray-800">{comment.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
