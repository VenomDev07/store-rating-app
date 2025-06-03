import React, { useEffect, useState } from 'react';
import { 
  TrendingUp,
  X,
  User,
  Mail,
  MapPin,
  Lock,
  Search,
  Star
} from 'lucide-react';
import axios from 'axios';
import { env } from '../environment/environment';
import { useNavigate } from 'react-router-dom';

export default function DashboardUser() {
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState([])
  const [userRatings, setUserRatings] = useState({}) // Store user's ratings for each store
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordForm.repeatPassword) {
      errors.repeatPassword = 'Please repeat your new password';
    } else if (passwordForm.newPassword !== passwordForm.repeatPassword) {
      errors.repeatPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
        return;
    }

    try {
        const response = await axios.put(`${env.baseUrl}/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
        }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}`, 'Content-Type': 'application/json'}
        });
        
        if (response.data) {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', repeatPassword: '' });
        setPasswordErrors({});
        alert('Password updated successfully!');
        }
    } catch (error) {
        console.error(error);
        setPasswordErrors({ general: 'Failed to update password. Please check your current password.' });
    }
  };

  // Fetch user's existing ratings for all stores
  const fetchUserRatings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Get all ratings for the current user
      const response = await axios.get(`${env.baseUrl}/users/ratings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Convert to object with storeId as key
      const ratingsMap = {};
      response.data.forEach(rating => {
        ratingsMap[rating.storeId] = rating;
      });
      
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

  // Handle star rating click
  const handleStarClick = async (storeId, rating) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please login to rate stores');
        navigate('/')
        return;
      }

      const existingRating = userRatings[storeId];
      
      if (existingRating) {
        // Update existing rating
        const response = await axios.put(`${env.baseUrl}/ratings/${existingRating.id}`, {
          rating
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setUserRatings(prev => ({
            ...prev,
            [storeId]: { ...existingRating, rating }
          }));
          
          // Update stores array to reflect new average rating
          await getDashboardData();
        }
      } else {
        // Create new rating
        const response = await axios.post(`${env.baseUrl}/ratings`, {
          storeId,
          rating
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setUserRatings(prev => ({
            ...prev,
            [storeId]: response.data
          }));
          
          // Update stores array to reflect new average rating
          await getDashboardData();
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.status === 403) {
        alert('You cannot rate your own store');
      } else if (error.response?.status === 409) {
        alert('You have already rated this store');
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    }
  };

  // Star Rating Component
  const StarRating = ({ storeId, currentRating = 0, size = 16 }) => {
    const [hoveredStar, setHoveredStar] = useState(0);
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`cursor-pointer transition-colors ${
              star <= (hoveredStar || currentRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => handleStarClick(storeId, star)}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {currentRating > 0 ? `(${currentRating})` : ''}
        </span>
      </div>
    );
  };

  const getDashboardData = async() => {
    try {
      setLoading(true)
      const response = await axios.get(`${env.baseUrl}/stores`)
      console.log(response.data);
      setStores(response.data.stores) 
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stores:', error);
      setLoading(false)
    }
  };

  useEffect(() => {
    getDashboardData();
    fetchUserRatings(); // Fetch user's existing ratings
  }, [])

  /* Search Functionality */
  const searchStores = async (term = '') => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('accessToken');
      let url = `${env.baseUrl}/stores/search?page=1&limit=50`;
      
      if (term.trim()) {
        url += `&name=${encodeURIComponent(term)}&address=${encodeURIComponent(term)}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setStores(response.data.stores || []);
      }
    } catch (error) {
      console.error('Error searching stores:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
    getDashboardData(); // Load all stores
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search - wait 500ms after user stops typing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      if (value.trim()) {
        searchStores(value);
      } else {
        getDashboardData(); // Load all stores if search is empty
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold">Roxiler</span>
          </div>

          <nav className="space-y-4">
            <div className="text-xs font-medium text-gray-500 mb-4">MENU</div>
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white rounded-lg">
              <span>Dashboard</span>
            </a>

            <a onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white rounded-lg cursor-pointer">
              <span>Profile</span>
            </a>

            <a href="/" onClick={() => {localStorage.clear()}} className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white rounded-lg cursor-pointer">
              <span>Log Out</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">Loading...</div>
      ) : (
        <div className="ml-64 h-screen flex flex-col">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white border-b border-gray-200 pl-4 pt-4 pr-4 pb-1 z-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">User Dashboard</h1>
                <p className="text-gray-600 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-4">
                  <div onClick={() => setShowProfileModal(true)} className="flex hover:bg-gray-100 p-2 rounded-md cursor-pointer items-center gap-2">
                    <img
                      src="\src\assets\user.png"
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium">{JSON.parse(localStorage.getItem('user')).name || 'Admin'}</div>
                      <div className="text-xs text-gray-500">{JSON.parse(localStorage.getItem('user')).email || 'admin.com'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border-purple-500 border-[1px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Total Stores</span>
                  <TrendingUp size={20} className="text-gray-400" />
                </div>
                <div className="text-3xl font-bold mb-2">{stores.length}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <TrendingUp size={16} />
                  Increased from last month
                </div>
              </div>
            </div>

            {/* Stores Section */}
            <div className="flex flex-col w-[100%]">
              <div className="bg-gray-50 h-full p-6 rounded-xl shadow-xs border-purple-500 border-[1px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Stores</h3>
                  
                  {/* Search Input */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search stores by name or address..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
                      />
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {isSearching && (
                      <div className="text-sm text-gray-500">Searching...</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pb-0.5">
                  {stores.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No stores found matching your search.' : 'No stores available.'}
                    </div>
                  ) : (
                    stores.map((store) => (
                      <div key={store.id} className="flex items-center gap-3 p-4 shadow-sm bg-white rounded-lg">
                        <img
                          src='src/assets/shop.png'
                          alt={store.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{store.name}</div>
                          <div className="text-xs text-gray-500 truncate">{store.email}</div>
                          <div className="text-xs text-gray-400 truncate">{store.address}</div>
                          
                          {/* Star Rating Component */}
                          <div className="mt-2">
                            <StarRating 
                              storeId={store.id} 
                              currentRating={userRatings[store.id]?.rating || 0}
                              size={16}
                            />
                          </div>
                        </div>
                        
                        {/* Average Rating Display */}
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            store.averageRating >= 3.5 ? 'bg-green-100 text-green-600' :
                            store.averageRating >= 2.5 ? 'bg-yellow-100 text-yellow-600' :
                            store.averageRating > 0 ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            Avg: {store.averageRating || 0}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {store.totalRatings || 0} reviews
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-[rgba(188,188,188,0.7)] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ease-out animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <img
                  src="\src\assets\user.png"
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Name
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {JSON.parse(localStorage.getItem('user') || '{}').email || 'admin@example.com'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Address
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {JSON.parse(localStorage.getItem('user') || '{}').address || 'Address not available'}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowPasswordModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg hover:from-purple-500 hover:to-purple-700"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[rgba(188,188,188,0.7)] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ease-out animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Update Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', repeatPassword: '' });
                  setPasswordErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {passwordErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {passwordErrors.general}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent ${
                    passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent ${
                    passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Repeat New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.repeatPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, repeatPassword: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent ${
                    passwordErrors.repeatPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Repeat new password"
                />
                {passwordErrors.repeatPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.repeatPassword}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', repeatPassword: '' });
                    setPasswordErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg hover:from-purple-500 hover:to-purple-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes animate-in {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}