'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Shield, Bell, CreditCard, Key, Smartphone, Mail, Lock, Camera, Check, Loader2 } from 'lucide-react';
import PageBanner, { bannerConfigs } from '@/components/PageBanner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 4000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      showError('File size exceeds 800KB limit');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Update UI immediately
      setUser((prev: any) => ({ ...prev, avatar_url: base64 }));

      // Save avatar to backend immediately
      setUploadingAvatar(true);
      try {
        const res = await fetch(`${API_URL}/api/dashboard/me`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ avatar_url: base64 })
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
          showSuccess('Avatar uploaded successfully!');
        } else {
          showError('Failed to upload avatar');
        }
      } catch (err) {
        console.error(err);
        showError('Network error while uploading avatar');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (nameStr: string, emailStr: string) => {
    if (nameStr) {
      const parts = nameStr.split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return nameStr.substring(0, 2).toUpperCase();
    }
    if (emailStr) return emailStr.substring(0, 2).toUpperCase();
    return 'AP';
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
          setEmail(data.data.email || '');
          setName(data.data.name || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await fetch(`${API_URL}/api/dashboard/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          name,
          business_name: user?.business_name || '',
          avatar_url: user?.avatar_url || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
        showSuccess('Profile updated successfully!');
      } else {
        const err = await res.json().catch(() => null);
        showError(err?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      showError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }
    
    setPasswordSaving(true);
    setPwdError('');
    setPwdSuccess('');
    
    try {
      const res = await fetch(`${API_URL}/api/dashboard/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (res.ok) {
        setPwdSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsChangingPassword(false);
          setPwdSuccess('');
        }, 2000);
      } else {
        const data = await res.json().catch(() => null);
        setPwdError(data?.message || 'Failed to update password');
      }
    } catch (err) {
      setPwdError('Network error');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      
      <PageBanner pageKey="settings" {...bannerConfigs.settings} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1C1D22] dark:text-white mb-1">
          Settings
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Manage your account preferences, security, and team.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-[#1C1D22] dark:bg-white text-white dark:text-[#1C1D22]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d2e33] hover:text-gray-900 dark:hover:text-white'}`}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'security' ? 'bg-[#1C1D22] dark:bg-white text-white dark:text-[#1C1D22]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d2e33] hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Shield className="w-4 h-4 mr-3" />
            Security & 2FA
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-[#1C1D22] dark:bg-white text-white dark:text-[#1C1D22]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d2e33] hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Bell className="w-4 h-4 mr-3" />
            Notifications
          </button>

          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'billing' ? 'bg-[#1C1D22] dark:bg-white text-white dark:text-[#1C1D22]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d2e33] hover:text-gray-900 dark:hover:text-white'}`}
          >
            <CreditCard className="w-4 h-4 mr-3" />
            Billing & Invoices
          </button>
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white dark:bg-[#1C1D22] rounded-2xl border border-gray-100 dark:border-[#2d2e33] p-8 shadow-sm transition-colors min-h-[500px]">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#1C1D22] dark:text-white mb-4">Personal Information</h2>
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-[#6C3FE2] dark:text-[#8b61ff] overflow-hidden relative group">
                    {uploadingAvatar ? (
                      <Loader2 className="w-8 h-8 text-[#6C3FE2] animate-spin" />
                    ) : user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(name, email)
                    )}
                    <div 
                      className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer transition-all"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/png, image/jpeg, image/gif" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#2d2e33] hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold rounded-lg transition-colors text-gray-700 dark:text-white disabled:opacity-50"
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-gray-50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/20 dark:text-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address or Phone</label>
                    <input 
                      type="text" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@autopayx.com" 
                      className="w-full bg-gray-50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/20 dark:text-white transition-all" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Company / Workspace Name</label>
                    <input type="text" value={user?.business_name || ''} onChange={(e) => setUser({...user, business_name: e.target.value})} placeholder="Company Name" className="w-full bg-gray-50 dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/20 dark:text-white transition-all" />
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {successMessage && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm font-medium text-green-700 dark:text-green-400 animate-fade-in">
                  <Check className="w-4 h-4" />
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm font-medium text-red-700 dark:text-red-400 animate-fade-in">
                  {errorMessage}
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 dark:border-[#2d2e33] flex justify-end">
                <button 
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-6 py-3 bg-[#6C3FE2] hover:bg-[#5b32c6] text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#1C1D22] dark:text-white mb-2">Security & Authentication</h2>
                <p className="text-sm text-gray-500 mb-6">Keep your AutoPayX account secure with these settings.</p>
                
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-[#2d2e33] rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-4">
                        <Lock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1C1D22] dark:text-white">Change Password</h4>
                        <p className="text-xs text-gray-500">Update your account password</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#2d2e33] text-sm font-bold rounded-lg text-gray-700 dark:text-white hover:bg-gray-200 transition-colors"
                    >
                      {isChangingPassword ? 'Cancel' : 'Update'}
                    </button>
                  </div>

                  {isChangingPassword && (
                    <div className="p-6 border border-gray-100 dark:border-[#2d2e33] rounded-xl animate-fade-in space-y-4 bg-gray-50/50 dark:bg-[#151518]">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Current Password</label>
                          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/20 dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">New Password</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/20 dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Confirm New Password</label>
                          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3FE2]/20 dark:text-white" />
                        </div>
                        
                        {pwdError && <p className="text-xs text-red-500 font-medium">{pwdError}</p>}
                        {pwdSuccess && <p className="text-xs text-green-500 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> {pwdSuccess}</p>}
                        
                        <div className="pt-2 flex justify-end">
                          <button 
                            onClick={handleUpdatePassword}
                            disabled={passwordSaving}
                            className="px-4 py-2 bg-[#6C3FE2] hover:bg-[#5b32c6] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                          >
                            {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Save Password
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-[#2d2e33] rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mr-4">
                        <Smartphone className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1C1D22] dark:text-white">Two-Factor Authentication (2FA)</h4>
                        <p className="text-xs text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#6C3FE2] text-sm font-bold rounded-lg text-white hover:bg-[#5b32c6] transition-colors">
                      Enable
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#1C1D22] dark:text-white mb-2">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mb-6">Choose how you want to be alerted about your account.</p>
                
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1D22] dark:text-white">Successful Payments</h4>
                      <p className="text-xs text-gray-500">Get notified when a customer pays successfully.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6C3FE2]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1D22] dark:text-white">Failed Payments</h4>
                      <p className="text-xs text-gray-500">Get notified when a payment fails or is rejected.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6C3FE2]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1D22] dark:text-white">Weekly Reports</h4>
                      <p className="text-xs text-gray-500">Receive a weekly summary of your account activity.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6C3FE2]"></div>
                    </label>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-10 h-10 text-[#6C3FE2]" />
              </div>
              <h2 className="text-xl font-bold text-[#1C1D22] dark:text-white mb-2">Billing & Plans</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                Manage your subscription, view invoices, and upgrade your account limits.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard/plans'}
                className="px-6 py-3 bg-[#1C1D22] dark:bg-white text-white dark:text-[#1C1D22] font-bold rounded-xl transition-colors shadow-sm"
              >
                Go to Plans & Billing
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
