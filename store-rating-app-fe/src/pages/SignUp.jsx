import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, Smartphone, Lock } from 'lucide-react'; // or 'react-icons/xyz' if you're using another icon lib
import axios from "axios";
import { env } from "../environment/environment";
import { useNavigate } from "react-router-dom";


const SignUp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = env.baseUrl
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (accessToken && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
    if (accessToken) {
      console.log(accessToken);
    }


  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      
      const response = await axios.post(`${baseUrl}/auth/register`,{ name, email, address, password })
      console.log(response.data);
      
      // Store tokens and user data in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Update state
      setUser(response.data.user);
      setIsLoggedIn(true);
      navigate('/dashboard')
      
    } catch (err) {
      setError('Password must contain One Upper letter, One Special Character and One Number');
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (setter) => (e) => setter(e.target.value);
  const handleCheckboxChange = (setter) => (e) => setter(e.target.checked);

  if (isLoggedIn) {

  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}

      <div className="flex-1 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Clouds */}
          <div className="absolute top-10 left-10 w-24 h-12 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute top-20 right-20 w-32 h-16 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute bottom-20 left-16 w-28 h-14 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute bottom-32 right-12 w-36 h-18 bg-white bg-opacity-20 rounded-full"></div>

          {/* Main Illustration */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Phone */}
            <div className="relative">
              <div className="w-64 h-96 bg-gradient-to-b from-pink-400 to-purple-500 rounded-3xl shadow-2xl transform rotate-12 p-6">
                <div className="w-full h-full bg-gradient-to-b from-pink-300 to-purple-400 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-white mx-auto mb-4" />
                    <div className="w-20 h-20 border-4 border-white rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full"></div>
                    </div>
                    <p className="text-white text-xs">Touch your finger to your device</p>
                  </div>
                </div>
              </div>

              {/* Person */}
              <div className="absolute -left-20 bottom-0 transform -translate-y-8">
                <div className="w-24 h-32">
                  {/* Body */}
                  <div className="w-12 h-20 bg-yellow-400 rounded-t-full mx-auto"></div>
                  {/* Legs */}
                  <div className="flex justify-center mt-1">
                    <div className="w-3 h-12 bg-gray-100 rounded-full mr-1"></div>
                    <div className="w-3 h-12 bg-gray-100 rounded-full"></div>
                  </div>
                  {/* Feet */}
                  <div className="flex justify-center">
                    <div className="w-6 h-3 bg-gray-800 rounded-full mr-2"></div>
                    <div className="w-6 h-3 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Success Checkmark */}
              <div className="absolute -top-8 -left-16 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>

              {/* Lock Icon */}
              <div className="absolute -bottom-8 -right-12 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Right Side - Illustration */}
        <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-gray-800">Roxiler</span>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Holla,<br />Welcome Back
            </h1>
            <p className="text-gray-600">Hey, welcome back to your special place</p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                value={name}
                onChange={handleInputChange(setName)}
                placeholder="Name"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                maxLength={60}
                minLength={20}
              />
            </div>
            
            <div>
              <input
                type="email"
                value={email}
                onChange={handleInputChange(setEmail)}
                placeholder="Email"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <input
                type="text"
                value={address}
                onChange={handleInputChange(setAddress)}
                placeholder="Address"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                maxLength={400}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handleInputChange(setPassword)}
                placeholder="Password"
                pattern="(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\-=/\\]).{8,16}"
                title="Password must be 8-16 characters long, include at least one uppercase letter and one special character."
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>


            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="mt-4 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button onClick={() => navigate('/')} className="text-purple-600 hover:text-purple-700 font-semibold">
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;