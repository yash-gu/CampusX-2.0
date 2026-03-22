import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const Marketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    status: 'Available'
  });
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Books',
    condition: 'Good',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const res = await api.get(`/api/products?${params}`);
      setProducts(res.data.products);
      setLoading(false);
    } catch (error) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/products', {
        ...newProduct,
        price: parseFloat(newProduct.price)
      });
      setProducts([res.data, ...products]);
      setNewProduct({
        title: '',
        price: '',
        category: 'Books',
        condition: 'Good',
        description: '',
        image: ''
      });
      setShowProductForm(false);
    } catch (error) {
      setError('Failed to create product listing');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${productId}`);
        setProducts(products.filter(product => product._id !== productId));
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  const handleContactSeller = async (productId, sellerId) => {
    try {
      const res = await api.post('/api/chat/start', {
        participantId: sellerId,
        productId,
        initialMessage: `Hi! I'm interested in your product listing.`
      });
      // Navigate to chat with this conversation
      window.location.href = `/chat?conversation=${res.data.conversation._id}`;
    } catch (error) {
      setError('Failed to start conversation');
    }
  };

  const categories = ['Books', 'Electronics', 'Stationery', 'Hostel Items', 'Clothing', 'Sports', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

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
        <h1 className="text-3xl font-bold text-bennett-blue mb-2">Unimart</h1>
        <p className="text-gray-600">Buy and sell items within the Bennett University community</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search products..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="input-field"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="">All</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowProductForm(!showProductForm)}
            className="btn-primary w-full lg:w-auto"
          >
            {showProductForm ? 'Cancel' : 'Sell Something'}
          </button>
        </div>
      </div>

      {showProductForm && (
        <div className="mb-6">
          <form onSubmit={handleCreateProduct} className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Create Product Listing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="input-field"
                  placeholder="Product title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={newProduct.condition}
                  onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}
                  className="input-field"
                >
                  {conditions.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="input-field"
                placeholder="Describe your product..."
                rows="3"
                maxLength="300"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <ImageUpload
                onImageUpload={(imageUrl) => setNewProduct({ ...newProduct, image: imageUrl })}
                existingImage={newProduct.image}
                placeholder="Upload Product Image"
              />
            </div>
            <button type="submit" className="mt-4 btn-primary">
              Create Listing
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        ) : (
          products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              currentUser={user}
              onDelete={handleDeleteProduct}
              onContactSeller={handleContactSeller}
            />
          ))
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, currentUser, onDelete, onContactSeller }) => {
  const canDelete = product.seller._id === currentUser.id;
  const isAvailable = product.status === 'Available';

  return (
    <div className="card overflow-hidden">
      {product.image && (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 flex-1">{product.title}</h3>
          {!isAvailable && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">SOLD</span>
          )}
        </div>
        
        <p className="text-2xl font-bold text-bennett-blue mb-2">₹{product.price}</p>
        
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{product.category}</span>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{product.condition}</span>
        </div>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-bennett-blue rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {product.seller.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{product.seller.name}</span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex space-x-2">
          {isAvailable && product.seller._id !== currentUser.id && (
            <button
              onClick={() => onContactSeller(product._id, product.seller._id)}
              className="flex-1 btn-primary text-sm"
            >
              Contact Seller
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={() => onDelete(product._id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
