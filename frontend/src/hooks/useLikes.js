// hooks/useLikes.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const useLikes = () => {
  const [userLikes, setUserLikes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const {
    isAuthenticated,
    user,
    registerLogoutCallback,
    unregisterLogoutCallback,
  } = useAuth();

  // Fetch user's existing likes when authenticated
  const fetchUserLikes = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUserLikes(new Set());
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3001/api/user/liked-posts",
        {
          params: { limit: 1000 }, // Get all user's likes
        }
      );

      const likedPostIds = new Set(response.data.posts.map((post) => post.id));

      setUserLikes(likedPostIds);
    } catch (error) {
      console.error("Error fetching user likes:", error);
      setUserLikes(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load likes when auth state changes
  useEffect(() => {
    fetchUserLikes();
  }, [fetchUserLikes]);

  // Toggle like for a specific post
  const toggleLike = useCallback(
    async (postId) => {
      if (!isAuthenticated || !user) {
        throw new Error("Authentication required");
      }

      try {
        const response = await axios.post(
          `http://localhost:3001/api/posts/${postId}/like`
        );

        const { isLiked } = response.data;

        // Update local state immediately for optimistic UI
        setUserLikes((prev) => {
          const newLikes = new Set(prev);
          if (isLiked) {
            newLikes.add(postId);
          } else {
            newLikes.delete(postId);
          }
          return newLikes;
        });

        return { isLiked };
      } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  // Check if a post is liked
  const isPostLiked = useCallback(
    (postId) => {
      return userLikes.has(postId);
    },
    [userLikes]
  );

  // Clear all likes (for logout)
  const clearLikes = useCallback(() => {
    setUserLikes(new Set());
  }, []);

  // Register logout callback to clear likes when user logs out
  useEffect(() => {
    if (registerLogoutCallback && unregisterLogoutCallback) {
      registerLogoutCallback(clearLikes);

      return () => {
        unregisterLogoutCallback(clearLikes);
      };
    }
  }, [clearLikes, registerLogoutCallback, unregisterLogoutCallback]);

  return {
    userLikes,
    loading,
    toggleLike,
    isPostLiked,
    clearLikes,
    refreshLikes: fetchUserLikes,
  };
};
