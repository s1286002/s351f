/**
 * @file useUser.js
 * @description Custom hook for user authentication, profile data, and user management
 */

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

// Mock user data for development/fallback
const MOCK_USER = {
  _id: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "student",
  profileData: {
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "123-456-7890",
    address: "123 Main St",
    bio: "Computer Science student with interest in AI and machine learning.",
    departmentId: {
      _id: "dept1",
      name: "Computer Science",
      code: "CS",
    },
    programId: {
      _id: "prog1",
      name: "Bachelor of Science in Computer Science",
      programCode: "BSCS",
    },
    enrollmentYear: 2021,
    graduationYear: 2025,
    profilePicture: "/images/default-avatar.png",
  },
};

// Create a context for user data
const UserContext = createContext();

/**
 * Provider component for user data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch the current user's profile data
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user/me");

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.success && responseData.data) {
          setUser(responseData.data);
        } else {
          throw new Error(responseData.error || "Failed to load user data");
        }
      } catch (err) {
        console.warn("Using mock user data:", err.message);
        // Use mock data if API fails (for development only)
        setUser(MOCK_USER);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load user profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update the current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Result of the update operation
   */
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to update profile: ${response.status}`
        );
      }

      const responseData = await response.json();
      console.log("useUser responseData");
      console.log(responseData);

      if (responseData.success && responseData.data) {
        setUser(responseData.data);
        return { success: true, data: responseData.data };
      } else {
        throw new Error(responseData.error || "Failed to update user data");
      }
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError(err.message || "Failed to update user profile");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Change the user's password
   * @param {Object} passwordData - Object containing current and new password
   * @returns {Promise<Object>} Result of the password change operation
   */
  const changePassword = useCallback(async (passwordData) => {
    try {
      const response = await fetch("/api/user/mypassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || `Failed to change password: ${response.status}`
        );
      }

      return {
        success: true,
        message: responseData.message || "Password changed successfully",
      };
    } catch (err) {
      console.error("Error changing password:", err);
      return {
        success: false,
        error: err.message || "Failed to change password",
      };
    }
  }, []);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Value to be provided by the context
  const value = {
    user,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile,
    changePassword,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Custom hook to access user data and functions
 * @returns {Object} User data, loading state, error, and user management functions
 */
export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
