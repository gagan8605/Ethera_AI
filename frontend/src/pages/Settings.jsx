import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

export default function Settings() {
  const { user, updateProfile, changePassword, deactivateAccount, activateAccount, deleteAccount, logout } = useAuthStore()

  const [profileData, setProfileData] = useState({
    name: user?.name || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [accountAction, setAccountAction] = useState('')
  const [actionPassword, setActionPassword] = useState('')
  const [confirmDelete, setConfirmDelete] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle account status - if isActive is undefined, assume active (default)
  const isAccountActive = user?.isActive !== false // undefined or true = active, false = inactive

  // Update profile data when user changes
  useEffect(() => {
    setProfileData({
      name: user?.name || ''
    })
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateProfile(profileData)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountAction = async () => {
    if (!actionPassword) {
      toast.error('Password is required')
      return
    }

    setIsLoading(true)
    try {
      if (accountAction === 'deactivate') {
        await deactivateAccount(actionPassword)
        toast.success('Account deactivated successfully')
        setAccountAction('')
        setActionPassword('')
      } else if (accountAction === 'activate') {
        await activateAccount(actionPassword)
        toast.success('Account activated successfully')
        setAccountAction('')
        setActionPassword('')
      } else if (accountAction === 'delete') {
        if (confirmDelete !== 'DELETE') {
          toast.error('Please type "DELETE" to confirm')
          return
        }
        await deleteAccount(actionPassword, confirmDelete)
        toast.success('Account deleted successfully')
        logout()
      }
    } catch (error) {
      const status = error.response?.status
      const message = error.response?.data?.message || 'Action failed'

      if (status === 400) {
        // Bad request - account already in desired state
        toast.error(message)
        setAccountAction('')
        setActionPassword('')
        setConfirmDelete('')
      } else if (status === 401) {
        // Unauthorized - wrong password
        toast.error(message)
      } else {
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-2">Manage your account settings</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Account Management */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Account Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary font-medium">Account Status</p>
                <p className="text-text-secondary text-sm">
                  Your account is currently {isAccountActive ? 'active' : 'deactivated'}
                </p>
              </div>
              <div className="space-x-2">
                {!isAccountActive ? (
                  <button
                    onClick={() => setAccountAction('activate')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Activate Account
                  </button>
                ) : (
                  <button
                    onClick={() => setAccountAction('deactivate')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Deactivate Account
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Delete Account</p>
                  <p className="text-text-secondary text-sm">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  onClick={() => setAccountAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Modal */}
        {accountAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                {accountAction === 'deactivate' && 'Deactivate Account'}
                {accountAction === 'activate' && 'Activate Account'}
                {accountAction === 'delete' && 'Delete Account'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Confirm with your password
                  </label>
                  <input
                    type="password"
                    value={actionPassword}
                    onChange={(e) => setActionPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {accountAction === 'delete' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="DELETE"
                      required
                    />
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setAccountAction('')
                      setActionPassword('')
                      setConfirmDelete('')
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccountAction}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                      accountAction === 'delete'
                        ? 'bg-red-600 hover:bg-red-700'
                        : accountAction === 'deactivate'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
