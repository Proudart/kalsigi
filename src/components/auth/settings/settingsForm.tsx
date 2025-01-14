"use client";

import { SetStateAction, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { toast } from "../../ui/use-toast";
import { IconLock, IconHistory, IconTrash } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";

export default function SettingsForm() {
    const [isLoading, setIsLoading] = useState({
        password: false,
        watchHistory: false,
        bookmarks: false,
        account: false
    });
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [deleteAccountPassword, setDeleteAccountPassword] = useState(""); // New state for delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // New state for showing delete confirmation
  
    const handleChangePassword = async (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      
      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(prev => ({ ...prev, password: true }));

        // First verify old password

        // Then reset password
        const { data, error } = await authClient.changePassword({
          currentPassword:oldPassword,
          newPassword:newPassword,
          revokeOtherSessions: true
        }, {
          onSuccess: () => {
            toast({
              title: "Password changed successfully",
              description: "Your password has been updated.",
            });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
          },
          onError: (ctx) => {
            throw new Error(ctx.error.message);
          }
        });

        if (error) {
          throw error;
        }

      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to change password. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, password: false }));
      }
    };

    const handleDeleteAccount = async () => {
      const confirmed = window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      );
      
      if (!confirmed) return;
      setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
      if (!deleteAccountPassword) {
        toast({
          title: "Error",
          description: "Please enter your current password",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(prev => ({ ...prev, account: true }));

        const { error } = await authClient.deleteUser({}, {
          onSuccess: () => {
            toast({
              title: "Account deleted",
              description: "Your account has been deleted successfully.",
            });
            window.location.reload();
          },
          onError: (ctx) => {
            throw new Error(ctx.error.message);
          }
        });

        if (error) {
          throw error;
        }

      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, account: false }));
        setDeleteAccountPassword("");
        setShowDeleteConfirm(false);
      }
    };

    const handleClearWatchHistory = async () => {
      try {
        setIsLoading(prev => ({ ...prev, watchHistory: true }));
        const response = await fetch("/api/auth/clearWatchHistory", {
          method: "POST",
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error("Failed to clear watch history");
        }

        toast({
          title: "Watch history cleared",
          description: "Your watch history has been cleared successfully.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to clear watch history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, watchHistory: false }));
      }
    };

    const handleClearBookmarks = async () => {
      try {
        setIsLoading(prev => ({ ...prev, bookmarks: true }));
        const response = await fetch("/api/auth/clearBookmark", {
          method: "POST",
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error("Failed to clear bookmarks");
        }

        toast({
          title: "Bookmarks cleared",
          description: "Your bookmarks have been cleared successfully.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to clear bookmarks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, bookmarks: false }));
      }
    };

    return (
      <div className="mx-auto p-6 space-y-8 bg-background-300 dark:bg-background-900 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-primary-800 dark:text-primary-200">
          Account Settings
        </h1>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary-700 dark:text-primary-300 flex items-center">
            <IconLock className="mr-2" size={24} /> Change Password
          </h2>
          <div className="space-y-4">
            <Input
              type="password"
              value={oldPassword}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setOldPassword(e.target.value)}
              placeholder="Current Password"
              required
              disabled={isLoading.password}
              className="w-full bg-background-50 dark:bg-background-800 text-text-800 dark:text-text-200 border-primary-300 dark:border-primary-700"
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              disabled={isLoading.password}
              className="w-full bg-background-50 dark:bg-background-800 text-text-800 dark:text-text-200 border-primary-300 dark:border-primary-700"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              disabled={isLoading.password}
              className="w-full bg-background-50 dark:bg-background-800 text-text-800 dark:text-text-200 border-primary-300 dark:border-primary-700"
            />
            <Button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              disabled={isLoading.password}
            >
              {isLoading.password ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary-700 dark:text-primary-300 flex items-center">
            <IconHistory className="mr-2" size={24} /> Manage Data
          </h2>
          <div className="flex space-x-4">
            <Button 
              onClick={handleClearWatchHistory} 
              className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
              disabled={isLoading.watchHistory}
            >
              {isLoading.watchHistory ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Clearing...
                </div>
              ) : (
                'Clear Watch History'
              )}
            </Button>
            <Button 
              onClick={handleClearBookmarks} 
              className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
              disabled={isLoading.bookmarks}
            >
              {isLoading.bookmarks ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Clearing...
                </div>
              ) : (
                'Clear Bookmarks'
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary-700 dark:text-primary-300 flex items-center">
            <IconTrash className="mr-2" size={24} /> Delete Account
          </h2>
          <p className="text-text-700 dark:text-text-300">
            Deleting your account will permanently remove all your data from the platform.
          </p>
          <p className="text-text-700 dark:text-text-300">
            This action cannot be undone.
          </p>

          {showDeleteConfirm ? (
            <div className="space-y-4">
              <Input
                type="password"
                value={deleteAccountPassword}
                onChange={(e) => setDeleteAccountPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                disabled={isLoading.account}
                className="w-full bg-background-50 dark:bg-background-800 text-text-800 dark:text-text-200 border-primary-300 dark:border-primary-700"
              />
              <div className="flex space-x-4">
                <Button 
                  onClick={handleConfirmDelete} 
                  variant="destructive" 
                  className="flex-1 bg-accent-600 hover:bg-accent-700 text-white"
                  disabled={isLoading.account}
                >
                  {isLoading.account ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting Account...
                    </div>
                  ) : (
                    'Confirm Delete'
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteAccountPassword("");
                  }}
                  className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
                  disabled={isLoading.account}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleDeleteAccount} 
              variant="destructive" 
              className="w-full bg-accent-600 hover:bg-accent-700 text-white"
            >
              Delete Account
            </Button>
          )}
        </div>
      </div>
    );
}