import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Moon,
  Sun,
  Bell,
  Globe,
  Save,
  Camera,
  Check,
  Shield,
  Smartphone,
  CreditCard,
  Users,
  Copy,
  Link as LinkIcon,
  Building2,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CompanyData } from '../types';

import { useAuth } from '../context/AuthContext';

interface SettingsProps {
  userRole?: 'admin' | 'user';
  company?: CompanyData;
  onUpdateCompany?: (data: Partial<CompanyData>) => void;
}

const Settings = ({
  userRole = 'admin',
  company = { name: 'StockFlow Inc', id: 'team-default', logo: '' },
  onUpdateCompany
}: SettingsProps) => {
  const { user, signOut, refreshProfile } = useAuth(); // Get authenticated user
  const navigate = useNavigate();

  // --- State Management ---
  // --- State Management ---
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Local state for company form to allow editing before saving
  const [localCompany, setLocalCompany] = useState(company);

  // Profile State
  const [profile, setProfile] = useState({
    name: userRole === 'admin' ? 'John Doe' : 'Team User',
    role: userRole === 'admin' ? 'Administrator' : 'Viewer',
    email: user?.email || (userRole === 'admin' ? 'john.doe@stockflow.com' : 'user@stockflow.com'),
    avatar: 'https://picsum.photos/id/64/200/200'
  });

  // Update email and fetch profile when user object loads
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setProfile(prev => ({ ...prev, email: user.email! }));

        // Fetch user profile data
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('full_name, role, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(prev => ({
            ...prev,
            name: profileData.full_name || prev.name,
            role: profileData.role || prev.role,
            avatar: profileData.avatar_url || prev.avatar
          }));
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Preferences State
  // Initialize from local storage or default to light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });

  // --- Effects ---
  useEffect(() => {
    // Sync local state if props change (optional, depends on UX preference)
    setLocalCompany(company);
  }, [company]);

  useEffect(() => {
    // Apply theme to document and save to localStorage
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // --- Handlers ---

  // File state for uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCompany(prev => ({ ...prev, name: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file); // Store file for upload

      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalCompany(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLocalCompany(prev => ({ ...prev, logo: '' }));
  };

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file); // Store file for upload

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showSuccess = (message: string) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = async (section: string) => {
    setActiveSection(section);
    console.log(`Saving section: ${section}`);

    try {
      // If saving company settings, bubble up to App
      if (section === 'Company Settings' && onUpdateCompany) {
        let finalLogoUrl = localCompany.logo;

        // Upload logo if a new file is selected
        if (logoFile) {
          const fileExt = logoFile.name.split('.').pop();
          const fileName = `company-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, logoFile);

          if (uploadError) {
            console.error("Error uploading logo:", uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);

          finalLogoUrl = publicUrl;
        }

        // Update in Supabase
        const { error } = await supabase
          .from('companies')
          .update({
            name: localCompany.name,
            logo_url: finalLogoUrl
          })
          .eq('id', localCompany.id);

        if (error) {
          console.error("Error updating company:", error);
          throw error;
        }

        // Refresh global state
        await refreshProfile();

        if (onUpdateCompany) {
          onUpdateCompany({ ...localCompany, logo: finalLogoUrl });
        }

        setActiveSection(null);
        showSuccess(`${section} updated successfully`);
      }

      // Handle Profile Update
      if (section === 'Profile' && user) {
        let finalAvatarUrl = profile.avatar;

        // Upload Avatar
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

          if (uploadError) {
            console.error("Error uploading avatar:", uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          finalAvatarUrl = publicUrl;
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: profile.name,
            role: profile.role,
            avatar_url: finalAvatarUrl
          })
          .eq('id', user.id);

        if (error) throw error;

        await refreshProfile();
        setActiveSection(null);
        showSuccess(`${section} updated successfully`);
      }

      // Handle Password Update
      if (section === 'Security') {
        // 1. Basic Validation
        if (!passwords.current) {
          alert("Please enter your current password to confirm changes.");
          setActiveSection(null);
          return;
        }
        if (!passwords.new || !passwords.confirm) {
          alert("Please enter a new password and confirm it.");
          setActiveSection(null);
          return;
        }
        if (passwords.new.length < 6) {
          alert("New password must be at least 6 characters long.");
          setActiveSection(null);
          return;
        }
        if (passwords.new !== passwords.confirm) {
          alert("New passwords do not match.");
          setActiveSection(null);
          return;
        }

        // 2. Verify Current Password (Re-authentication)
        if (!user?.email) {
          alert("User email not found. Please reload.");
          setActiveSection(null);
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: passwords.current
        });

        if (signInError) {
          alert("Incorrect current password.");
          setActiveSection(null);
          return;
        }

        // 3. Update Password
        const { data, error } = await supabase.auth.updateUser({ password: passwords.new });

        if (error) {
          console.error("Supabase auth error:", error);
          throw error;
        }

        console.log("Password updated successfully", data);
        setPasswords({ current: '', new: '', confirm: '' });

        // Force success message and logout
        setSuccessMsg("Password updated! Redirecting to login...");
        setActiveSection(null);

        // Perform logout and navigation without blocking
        setTimeout(() => {
          signOut().catch(err => console.error("Sign out error:", err));
          navigate('/login');
        }, 1000);

        return;
      }
    } catch (err: any) {
      console.error("Error in handleSave:", err);
      // Only show alert for errors, not for success flow
      if (err.message) {
        alert(`Failed to update settings: ${err.message}`);
      } else {
        alert("An unexpected error occurred.");
      }
      setActiveSection(null);
    }
  };

  // Generate Dynamic Invite Link
  const inviteLink = `https://stockflow.app/invite/${localCompany.id}?company=${encodeURIComponent(localCompany.name)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Settings</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-1">Manage your account settings and preferences.</p>
          </div>
          {userRole === 'admin' && (
            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">
              Admin Account
            </span>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      <div className="flex flex-col gap-8">

        {/* 0. Company & Team Settings (Admin Only) */}
        {userRole === 'admin' && (
          <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-text-main dark:text-gray-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Company & Team Settings
              </h2>
              <button
                onClick={() => handleSave('Company Settings')}
                disabled={!!activeSection}
                className={`text-sm font-bold flex items-center gap-1 transition-colors ${activeSection ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:text-primary-hover'
                  }`}
              >
                {activeSection === 'Company Settings' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-6">

              {/* Company Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-gray-400" />
                  <input
                    type="text"
                    value={localCompany.name}
                    onChange={handleCompanyChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              {/* Company Logo Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300">Company Logo</label>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    {localCompany.logo ? (
                      <img src={localCompany.logo} alt="Company Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Logo
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      {localCompany.logo && (
                        <button
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary dark:text-gray-500">
                      Recommended size: 200x200px. Used in header and invoices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

              {/* Invite Link */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-text-main dark:text-gray-300">Invite Team Members</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">
                  Share this unique link to invite users. It includes your company ID and name.
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 py-3 pl-10 pr-3 text-text-secondary dark:text-gray-300 sm:text-sm font-mono truncate"
                    />
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all w-32 justify-center ${copied
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-primary hover:bg-primary-hover focus:ring-primary'
                      }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* 1. Public Profile Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-main dark:text-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Public Profile
            </h2>
            <button
              onClick={() => handleSave('Profile')}
              disabled={!!activeSection}
              className={`text-sm font-bold flex items-center gap-1 transition-colors ${activeSection ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:text-primary-hover'
                }`}
            >
              {activeSection === 'Profile' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              )}
            </button>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Camera className="w-8 h-8" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-xs text-text-secondary dark:text-gray-500">Allowed *.jpeg, *.jpg, *.png</p>
            </div>

            {/* Inputs */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300">Display Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300">Job Title</label>
                <input
                  type="text"
                  name="role"
                  value={profile.role}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300">Bio</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Tell us a little about yourself..."
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Account Security Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-main dark:text-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Account & Security
            </h2>
            <button
              onClick={() => handleSave('Security')}
              disabled={!!activeSection}
              className={`text-sm font-bold flex items-center gap-1 transition-colors ${activeSection ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:text-primary-hover'
                }`}
            >
              {activeSection === 'Security' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              )}
            </button>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-text-main dark:text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-text-secondary dark:text-gray-400 cursor-not-allowed outline-none select-all"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

            <h3 className="text-sm font-bold text-text-secondary dark:text-gray-500 uppercase tracking-wider mb-2">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-main dark:text-gray-300">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-gray-400" />
                  <input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-main dark:text-gray-300">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-gray-400" />
                  <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-main dark:text-gray-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-gray-400" />
                  <input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Appearance Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-lg font-bold text-text-main dark:text-gray-100 flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              Appearance
            </h2>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Card */}
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-500">
                  <Sun className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-text-main dark:text-gray-100">Light Mode</p>
                  <p className="text-xs text-text-secondary dark:text-gray-400">Default bright appearance</p>
                </div>
                {theme === 'light' && <CheckCircleIcon className="ml-auto w-6 h-6 text-primary" />}
              </button>

              {/* Dark Mode Card */}
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-slate-800' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700 text-blue-400' : 'bg-gray-100 text-slate-600'}`}>
                  <Moon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-text-main dark:text-gray-300'}`}>Dark Mode</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-text-secondary dark:text-gray-500'}`}>Easy on the eyes</p>
                </div>
                {theme === 'dark' && <CheckCircleIcon className="ml-auto w-6 h-6 text-primary" />}
              </button>
            </div>
          </div>
        </section>

        {/* 4. Notifications & Preferences */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-lg font-bold text-text-main dark:text-gray-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Preferences
            </h2>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">
            {/* Notification Toggles */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-main dark:text-gray-200">Email Notifications</p>
                  <p className="text-xs text-text-secondary dark:text-gray-400">Receive daily summaries and alerts</p>
                </div>
              </div>
              <ToggleSwitch checked={notifications.email} onChange={() => toggleNotification('email')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-main dark:text-gray-200">Push Notifications</p>
                  <p className="text-xs text-text-secondary dark:text-gray-400">Receive real-time alerts on your device</p>
                </div>
              </div>
              <ToggleSwitch checked={notifications.push} onChange={() => toggleNotification('push')} />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

            {/* Language & Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Language
                </label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option>English (US)</option>
                  <option>Español</option>
                  <option>Français</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Currency
                </label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option>Euro (€)</option>
                  <option>US Dollar ($)</option>
                  <option>British Pound (£)</option>
                </select>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

// Helper Components
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
      }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
  </button>
);

export default Settings;