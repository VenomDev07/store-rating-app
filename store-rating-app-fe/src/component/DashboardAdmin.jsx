import React, { useEffect, useMemo, useState } from 'react';
import { 
  Plus, 
  TrendingUp,
  X,
  User,
  Mail,
  MapPin,
  Lock,
  Store,
  ChevronDown,
  Filter
} from 'lucide-react';
import axios from 'axios';
import { env } from '../environment/environment';

export default function DashboardAdmin() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });

  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [notowners, setNotOwners] = useState([])

  const [totalRating, setTotalRating] = useState(0)
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

  // Filter users based on current filter values
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const nameMatch = !filters.name || user.name.toLowerCase().includes(filters.name.toLowerCase());
      const emailMatch = !filters.email || user.email.toLowerCase().includes(filters.email.toLowerCase());
      const addressMatch = !filters.address || user.address.toLowerCase().includes(filters.address.toLowerCase());
      
      // Role filter logic
      let roleMatch = true;
      if (filters.role) {
        const filterRole = filters.role.toLowerCase();
        if (filterRole === 'user' || filterRole === 'normal_user') {
          roleMatch = user.role === 'NORMAL_USER';
        } else if (filterRole === 'owner' || filterRole === 'store_owner') {
          roleMatch = user.role === 'STORE_OWNER';
        } else {
          roleMatch = user.role.toLowerCase().includes(filterRole);
        }
      }
      
      return nameMatch && emailMatch && addressMatch && roleMatch;
    });
  }, [users, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.name || filters.email || filters.address || filters.role;
  }, [filters]);

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

  const handleUserSubmit = async(e) => {
    e.preventDefault();
    const response = await axios.post(`${env.baseUrl}/auth/register`,userForm,{headers: {Authorization : `Bearer ${(localStorage.getItem('accessToken'))}`}})
    console.log('User form submitted:', userForm);
    if(response.data){
        setShowUserModal(false);
        // Refresh data after adding user
        getDashboardData();
    }
    setUserForm({ name: '', email: '', address: '', password: '' });
  };

  const handleStoreSubmit = async(e) => {
    debugger
    e.preventDefault();
    try {
    const response = await axios.post(`${env.baseUrl}/stores`,JSON.stringify(storeForm),{headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    }})
    if(response.data){
        setShowStoreModal(false);
        // Refresh data after adding store
        getDashboardData();
    }
    console.log('Store form submitted:', storeForm);
    setStoreForm({ name: '', email: '', address: '', ownerId: '' });
    } catch (error) {
        console.error(error)
    }
  };

  const getDashboardData = async() => {
    debugger
    setLoading(true)
    const response = await axios.get(`${env.baseUrl}/dashboard/admin`,{headers : {Authorization : `Bearer ${(localStorage.getItem('accessToken'))}`}})
    console.log(response.data);
    setDashboardData(response.data)
    setUsers(response.data.enrichedUsers.filter((item) => (item.role != "SYSTEM_ADMIN")))
    setNotOwners(response.data.enrichedUsers.filter((item) => (item.role != "SYSTEM_ADMIN" && item.role != "STORE_OWNER")))
    setStores(response.data.storesWithAverageRatings)
    setTotalRating(response.data.totalRatings)
    setLoading(false)
  }

  useEffect(() => {
    getDashboardData();
  },[])

  const clearFilters = () => {
    setFilters({ name: '', email: '', address: '', role: '' });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
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

            <a onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white rounded-lg">
              <span>Profile</span>
            </a>

            <a href="/" onClick={() => {localStorage.clear()}} className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white rounded-lg">
              <span>Log Out</span>
            </a>
          </nav>

          
        </div>
      </div>

{loading ? (<div className="flex justify-center items-center h-screen">Loading...</div>) : (
              <div className="ml-64 h-screen flex flex-col">
                {/* Header - Sticky */}
                <div className="sticky top-0 bg-white border-b border-gray-200 pl-4 pt-4 pr-4 pb-1 z-20">
                {/* Dashboard Title */}
                  <div className="flex items-center justify-between">
                      <div>
                      <h1 className="text-3xl font-bold mb-2">Administrator Dashboard</h1>
                      <p className="text-gray-600 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
                      </div>
                      <div className="flex gap-3">
                          <button 
                              onClick={() => setShowFilterModal(true)}
                              className={`px-4 py-1 rounded-lg flex items-center gap-2 ${
                                hasActiveFilters 
                                  ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                              <Filter size={20} />
                              Filter
                              {hasActiveFilters && (
                                <span className="bg-white text-purple-600 text-xs px-2 py-1 rounded-full font-medium">
                                  Active
                                </span>
                              )}
                          </button>
                          <div className="flex items-center gap-4">
                              <div onClick={() => setShowProfileModal(true)} className="flex hover:bg-gray-100 p-2 rounded-md cursor-pointer items-center gap-2">
                                  <img
                                  src="\src\assets\system-administration.png"
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
                    <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm opacity-90">Total Users</span>
                        <TrendingUp size={20} className="opacity-75" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{users.length}</div>
                    <div className="text-sm opacity-75 flex items-center gap-1">
                        <TrendingUp size={16} />
                        Increased from last month
                    </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm border-purple-500 border-[1px] ">
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

                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm border-purple-500 border-[1px] ">
                      <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">Total Ratings</span>
                          <TrendingUp size={20} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-bold mb-2">{totalRating}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1"><TrendingUp size={16} />
                          Increased from last month
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 flex flex-col justify-between rounded-xl shadow-sm border-purple-500 border-[1px] ">
                      <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">Add Store</span>
                          <TrendingUp size={20} className="text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-500">
                              <button
                              onClick={() => setShowStoreModal(true)} 
                              className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                              <Store size={16} />
                              Add Store
                          </button>
                      </div>
                    </div>

                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Users */}
                    <div className="bg-gray-50 h-[100%] p-6 rounded-xl shadow-sm border-purple-500 border-[1px] ">
                      <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">Users</h3>
                            {hasActiveFilters && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  ({filteredUsers.length} of {users.length})
                                </span>
                                <button
                                  onClick={clearFilters}
                                  className="text-xs text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded"
                                >
                                  Clear filters
                                </button>
                              </div>
                            )}
                          </div>
                          <button onClick={() => setShowUserModal(true)}className="bg-gradient-to-r from-purple-400 to-purple-600 text-white w-fit px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                          <Plus size={16} />
                          Add User
                          </button>
                      </div>
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                            <div key={user.id} className="flex items-center shadow-xs gap-3 p-3 bg-white rounded-lg">
                                <img src='\src\assets\user.png' alt={user.name} className="w-10 h-10 rounded-full"/>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{user.name}</div>
                                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                  <div className="text-xs text-gray-400 truncate">{user.address}</div>
                                </div>
                                <span className={`cursor-default text-xs px-2 py-1 rounded-full ${user.role === "STORE_OWNER" ? 'bg-green-100 text-green-600' : null}}`}>{user?.storeName}</span>
                                <span className={`cursor-default text-xs px-2 py-1 rounded-full ${user.averageRating >= 3.5 ? 'bg-green-100 text-green-600' : user.averageRating < 3.5 ? 'bg-yellow-100 text-yellow-600' :'invisible'}`}>Avg: {user?.averageRating}</span>
                                <span className={`cursor-default text-xs px-2 py-1 rounded-full ${user.role === "NORMAL_USER" ? 'bg-green-100 text-green-600' :user.role === "STORE_OWNER" ? 'bg-yellow-100 text-yellow-600' :'bg-gray-100 text-gray-600'}`}>{user.role == "NORMAL_USER" ? "User" : user.role == "STORE_OWNER" ? "Owner" : null}</span>
                            </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              {hasActiveFilters ? (
                                <div>
                                  <p>No users match the current filters</p>
                                  <button
                                    onClick={clearFilters}
                                    className="text-purple-600 hover:text-purple-800 text-sm mt-2"
                                  >
                                    Clear all filters
                                  </button>
                                </div>
                              ) : (
                                <p>No users found</p>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                <div className="flex flex-col w-[100%]">
                    {/* Stores */}
                    <div className="bg-gray-50 h-full p-6 rounded-xl shadow-xs border-purple-500 border-[1px] ">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Stores</h3>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto pb-0.5">
                            {stores.map((store) => (
                            <div key={store.id} className="flex items-center gap-3 p-3 shadow-sm bg-white rounded-lg">
                                <img
                                src='src/assets/shop.png'
                                alt={store.name}
                                className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{store.name}</div>
                                <div className="text-xs text-gray-500 truncate">{store.email}</div>
                                <div className="text-xs text-gray-400 truncate">{store.address}</div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                store.averageRating >= 3.5 ? 'bg-green-100 text-green-600' :
                                store.averageRating < 3.5 ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'
                                }`}>
                                {store.averageRating}
                                </span>
                            </div>
                            ))}
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
      )}


      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-[rgba(188,188,188,0.7)] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ease-out animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Filter Users</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filter by name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => setFilters({...filters, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filter by email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={filters.address}
                  onChange={(e) => setFilters({...filters, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filter by address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filter by role"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg hover:from-purple-500 hover:to-purple-700"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="box-border fixed inset-0 bg-[rgba(188,188,188,0.7)] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ease-out animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Address
                </label>
                <textarea
                  value={userForm.address}
                  onChange={(e) => setUserForm({...userForm, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter address"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUserSubmit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg hover:from-purple-500 hover:to-purple-700"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-[rgba(188,188,188,0.7)] bg-opacity-50 flex items-center justify-center z-50 border-purple-500">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ease-out animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Store</h2>
              <button
                onClick={() => setShowStoreModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Store size={16} className="inline mr-2" />
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-0 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Store Email
                </label>
                <input
                  type="email"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({...storeForm, email: e.target.value})}
                  className="w-full px-3 py-2 border focus:outline-0 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter store email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Store Address
                </label>
                <textarea
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({...storeForm, address: e.target.value})}
                  className="w-full px-3 py-2 border focus:outline-0 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter store address"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Assign to User
                </label>
                <div className="relative">
                  <select
                    value={storeForm.ownerId}
                    onChange={(e) => setStoreForm({...storeForm, ownerId: e.target.value})}
                    className="w-full px-3 py-2 border focus:outline-0 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select a user</option>
                    {notowners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStoreModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStoreSubmit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg hover:from-purple-500 hover:to-purple-700"
                >
                  Add Store
                </button>
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