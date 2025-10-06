'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  User,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const Header = () => {
  const { isAuthenticated, userRole, login, logout } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (loginDialogOpen) generateCaptcha();
  }, [loginDialogOpen]);

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Username and password are required.',
      });
      return;
    }

    if (!captchaInput) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please enter the captcha.',
      });
      return;
    }
    
    if (captchaInput !== captcha) {
      toast({
        variant: 'destructive',
        title: 'Captcha Incorrect',
        description: 'Please enter the correct captcha.',
      });
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      await login({ loginId: username, password });
      setLoginDialogOpen(false);
      setUsername('');
      setPassword('');
      setCaptchaInput('');
      toast({
        title: 'Login Successful',
        description: 'Welcome back.',
      });
    } catch (error) {
      generateCaptcha();
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logout Successful',
      description: 'You have been logged out.',
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      toast({
        title: 'Search Initiated',
        description: `Searching for: ${searchQuery}`,
      });
      setSearchDialogOpen(false);
      setSearchQuery('');
    }
  };

  const handleNotificationClick = () => {
    setNotificationDialogOpen(true);
  };

  const navLinks = [
    { to: '/', label: 'Home', action: () => window.dispatchEvent(new CustomEvent('landing')) },
    { to: '/valuation', label: 'Valuation Portal' },
    { to: '/plots', label: 'Plot Management' },
    { to: '/reports', label: 'Reports & Analytics' },
    { to: '/admin', label: 'Admin', requiresAuth: true, roles: ['admin'] },
    { to: '/department-dashboard', label: 'Department', requiresAuth: true, roles: ['department', 'admin'] },
  ];

  return (
    <header className="bg-maroon-800 text-white shadow-lg sticky top-0 z-50 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/src/assets/lovable-uploads/Seal_of_Assam.png"
              alt="Assam Government Logo"
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-semibold leading-tight">
                Directorate of Registration and Stamps Revenue
              </h1>
              <p className="text-xs sm:text-sm opacity-80">Government of Assam, India</p>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded hover:bg-[#1E8C98] transition-colors z-[1000]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Navigation */}
          <nav
            className={`${menuOpen ? 'flex' : 'hidden'
              } md:flex flex-col md:flex-row items-center absolute md:static top-full left-0 w-full md:w-auto bg-maroon-800 md:bg-transparent p-4 md:p-0 space-y-4 md:space-y-0 md:space-x-6 shadow-md md:shadow-none z-40`}
          >
            {navLinks.map((link, index) => {
              // Hide links that require auth if user is not authenticated
              if (link.requiresAuth && !isAuthenticated) return null;
              // Hide links that require specific roles if user doesn't have them
              if (link.roles && !link.roles.includes(userRole)) return null;
              
              return (
                <div key={index} className="relative group w-full md:w-auto">
                  <Link
                    to={link.to}
                    className="block text-sm hover:text-[#1E8C98] transition-colors py-2 md:py-0 w-full text-center md:text-left"
                    onClick={() => {
                      link.action?.();
                      setMenuOpen(false);
                    }}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}

            {/* Mobile-only icons */}
            <div className="flex md:hidden items-center gap-4 mt-4">
              <button
                className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors"
                aria-label="Search"
                onClick={() => setSearchDialogOpen(true)}
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors relative"
                aria-label="Notifications"
                onClick={handleNotificationClick}
              >
                <Bell className="h-5 w-5" />
                {isAuthenticated && userRole === 'admin' && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                )}
              </button>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={() => setLoginDialogOpen(true)}
                  className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors"
                  aria-label="Login"
                >
                  <User className="h-5 w-5" />
                </button>
              )}
            </div>
          </nav>

          {/* Desktop icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors"
              aria-label="Search"
              onClick={() => setSearchDialogOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors relative"
              aria-label="Notifications"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {isAuthenticated && userRole === 'admin' && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium hidden sm:inline">
                  {userRole === 'admin' ? 'Admin' : userRole === 'department' ? 'Department' : 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginDialogOpen(true)}
                className="p-2 rounded-full hover:bg-[#1E8C98] transition-colors"
                aria-label="Login"
              >
                <User className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6" style={{ zIndex: 2000 }}>
          <div className="bg-[#222] rounded-t-md px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4">
            <DialogTitle className="text-white text-base sm:text-lg font-semibold">
              User Authentication
            </DialogTitle>
            <button
              onClick={() => setLoginDialogOpen(false)}
              className="text-white text-lg sm:text-xl"
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#1E8C98] font-semibold">
                Login ID<span className="text-[#1E8C98]">*</span>
              </Label>
              <Input
                id="username"
                placeholder="Enter your login ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-[#1E8C98] text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1E8C98] font-semibold">
                Password<span className="text-[#1E8C98]">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-[#1E8C98] text-sm sm:text-base"
              />
            </div>
            
            {/* Captcha for all logins */}
            <div className="space-y-2">
              <Label htmlFor="captcha" className="text-[#1E8C98] font-semibold">
                Captcha<span className="text-[#1E8C98]">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <div
                  className="bg-gray-100 border border-[#1E8C98] px-3 py-2 rounded text-base sm:text-lg font-mono select-none"
                  style={{ letterSpacing: '2px' }}
                >
                  {captcha}
                </div>
                <button
                  type="button"
                  className="bg-[#1E8C98] text-white px-2 py-1 rounded text-xs sm:text-sm"
                  onClick={generateCaptcha}
                >
                  Reload
                </button>
              </div>
              <Input
                id="captcha-input"
                placeholder="Enter the captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="border border-[#1E8C98] text-sm sm:text-base"
              />
            </div>
            
            <p className="text-xs sm:text-sm text-[#1E8C98]">
              Forgot password?{' '}
              <a href="#" className="underline hover:text-[#6C3B2A]">
                Click here to reset.
              </a>
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setLoginDialogOpen(false)}
              className="border border-[#1E8C98] text-[#1E8C98] text-sm sm:text-base"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              className="bg-[#6C3B2A] hover:bg-[#1E8C98] text-white font-bold text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-lg font-semibold text-primary">
            Search
          </DialogTitle>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search for property, notifications, or services</Label>
              <Input
                id="search"
                placeholder="Enter your search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSearchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSearch}>
              Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="text-lg font-semibold text-primary">
            Notifications
          </DialogTitle>
          <div className="space-y-4">
            {isAuthenticated && userRole === 'admin' ? (
              <>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">Welcome Admin!</h4>
                  <p className="text-sm text-blue-600">You have administrative privileges.</p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-1">Pending Approvals</h4>
                    <p className="text-sm text-yellow-600">2 property valuation requests awaiting approval</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-1">Urgent Request</h4>
                    <p className="text-sm text-red-600">1 stamp duty calculation requires immediate review</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-gray-600">No new notifications at this time.</p>
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-2">Login to view personalized notifications.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setNotificationDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;