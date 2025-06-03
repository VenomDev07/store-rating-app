import React, { useEffect, useState } from 'react';
import { 
  TrendingUp,
  X,
  User,
  Mail,
  MapPin,
  Lock,
} from 'lucide-react';
import axios from 'axios';
import { env } from '../environment/environment';

export default function DashboardOwner() {

  const [storeAvgRating, setStoreAvgRating] = useState([])
  const [ratedUser, setRatedUser] = useState([])
  const [dashboardData ,setDashboardData] = useState()
  

  const [loading, setLoading] = useState(false)

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

    // Add this password update handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
        return;
    }

    try {
        debugger
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
        // You can add a success notification here
        alert('Password updated successfully!');
        }
    } catch (error) {
        console.error(error);
        setPasswordErrors({ general: 'Failed to update password. Please check your current password.' });
    }
  };




  useEffect(() => {
  const getDashboardData = async() => {
      debugger
      setLoading(true)
      const response = await axios.get(`${env.baseUrl}/dashboard/store`,{headers : {Authorization : `Bearer ${(localStorage.getItem('accessToken'))}`}})
      console.log(response.data);
      setDashboardData(response.data)
      setRatedUser(response.data.recentRatings)
      setStoreAvgRating(response.data.averageRating)
      setLoading(false)
  }
  
  getDashboardData();
  },[])



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

            <a onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white rounded-lg">
              <span>Profile</span>
            </a>

            <a href="/" onClick={() => {localStorage.clear()}} className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white rounded-lg">
              <span>Log Out</span>
            </a>
          </nav>

          
        </div>
      </div>

      {/* Main Content */}
      {loading ? (<div className="flex justify-center items-center h-screen">Loading...</div>) : (
              <div className="ml-64 h-screen flex flex-col">
                {/* Header - Sticky */}
                <div className="sticky top-0 bg-white border-b border-gray-200 pl-4 pt-4 pr-4 pb-1 z-20">
                {/* Dashboard Title */}
                <div className="flex items-center justify-between">
                    <div>
                    <h1 className="text-3xl font-bold mb-2">Store Admin Dashboard</h1>
                    <p className="text-gray-600 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-4">
                            <div onClick={() => setShowProfileModal(true)} className="flex hover:bg-gray-100 p-2 rounded-md cursor-pointer items-center gap-2">
                                <img
                                src="\src\assets\system-administration.png"
                                alt="Profile"
                                className="w-10 h-10 rounded-full"
                                />
                                <div>
                                <div className="text-sm font-medium">{JSON.parse(localStorage.getItem('user')).name || 'Owner'}</div>
                                <div className="text-xs text-gray-500">{JSON.parse(localStorage.getItem('user')).email || 'Owner.com'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 p-4 overflow-y-auto">
                {/* Stats Cards */}

                {/* Bottom Section */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Users */}
                    <div className="bg-gray-50 h-[100%] p-6 rounded-xl shadow-sm border-purple-500 border-[1px] ">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold">Users</h3>
                          <h3 className="text-lg font-semibold">Rating</h3>
                      </div>
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                          {ratedUser.map((user) => (
                          <div key={user.id} className="flex items-center shadow-xs gap-3 p-3 bg-white rounded-lg">
                              <img
                                src='\src\assets\user.png'
                                alt={user.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{user.userName}</div>
                                <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                <div className="text-xs text-gray-400 truncate">{user.address}</div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                              user.rating >= 3.5 ? 'bg-green-100 text-green-600' :
                              user.rating < 3.5 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                              }`}>
                              {user?.rating}
                              </span>
                          </div>
                          ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br flex flex-col justify-evenly from-purple-400 via-purple-500 to-purple-600 text-white p-6 rounded-xl" style={{color: 'white'}}>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-md font-semibold">Store Name</span>
                        </div>
                        <div className="text-6xl font-bold mb-2">{dashboardData?.storeName}</div>
                      </div>
                      <div>
                          <div className="flex items-center justify-between mb-4">
                              <span className="text-md font-semibold">Average Ratings</span>
                              <TrendingUp size={20} className="text-gray-400" />
                          </div>
                          <div className="text-6xl font-bold mb-2">{storeAvgRating}</div>
                          <div className="text-sm flex items-center gap-1"><TrendingUp size={16} />
                              Increased from last month
                          </div>
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
                    src="\src\assets\system-administration.png"
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
                    {JSON.parse(localStorage.getItem('user')).name || 'Admin'}
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {JSON.parse(localStorage.getItem('user')).email || 'admin@example.com'}
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Address
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {JSON.parse(localStorage.getItem('user')).address || 'Address not available'}
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

      <style jsx>{`
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