'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  Hospital,
  Calendar,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'hospital') return '/hospital/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Hospital className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HealthCare+</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/resource-viewer"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              📊 Resource Viewer
            </Link>
            <Link
              href="/system-monitoring"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              📈 System Monitor
            </Link>
            <Link
              href="/intelligent-emergency"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              🧠 AI Emergency
            </Link>
            <Link
              href="/realtime-test"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              🧪 System Test
            </Link>
            <Link
              href="/hospitals"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Find Hospitals
            </Link>
            <Link
              href="/blood-search"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Blood Search
            </Link>
            <Link
              href="/emergency"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              🚨 Emergency
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/appointments"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      My Appointments
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="/resource-viewer"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMenu}
            >
              📊 Resource Viewer
            </Link>
            <Link
              href="/system-monitoring"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMenu}
            >
              📈 System Monitor
            </Link>
            <Link
              href="/intelligent-emergency"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMenu}
            >
              🧠 AI Emergency
            </Link>
            <Link
              href="/realtime-test"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMenu}
            >
              🧪 System Test
            </Link>
            <Link
              href="/hospitals"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMenu}
            >
              Find Hospitals
            </Link>
            <Link
              href="/blood-search"
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={toggleMenu}
            >
              Blood Search
            </Link>
            <Link
              href="/emergency"
              className="block bg-red-600 text-white text-center px-4 py-2 rounded-lg font-semibold"
              onClick={toggleMenu}
            >
              🚨 Emergency
            </Link>
            <hr />
            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/appointments"
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                  onClick={toggleMenu}
                >
                  My Appointments
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block bg-blue-600 text-white text-center px-4 py-2 rounded-lg font-medium"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
