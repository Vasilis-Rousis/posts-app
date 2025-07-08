import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const useLikes = () => {
  const [userLikes, setUserLikes] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const {
    isAuthenticated,
    user,
    registerLogoutCallback,
    unregisterLogoutCallback,
  } = useAuth();

  const fetchUserLikes = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUserLikes(new Set());
      setLikeCounts(new Map());
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3001/api/user/liked-posts",
        {
          params: { limit: 1000 },
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

  const initializeLikeCounts = useCallback((posts) => {
    const counts = new Map();
    posts.forEach((post) => {
      counts.set(post.id, post.likesCount || 0);
    });
    setLikeCounts(counts);
  }, []);

  // Load likes when auth state changes
  useEffect(() => {
    fetchUserLikes();
  }, [fetchUserLikes]);

  const toggleLike = useCallback(
    async (postId) => {
      if (!isAuthenticated || !user) {
        throw new Error("Authentication required");
      }

      // Get current state
      const wasLiked = userLikes.has(postId);
      const currentCount = likeCounts.get(postId) || 0;

      try {
        // --- UI change flow (before actual api call, only for reactivity)---
        // Optimistically update UI immediately
        setUserLikes((prev) => {
          const newLikes = new Set(prev);
          if (wasLiked) {
            newLikes.delete(postId);
          } else {
            newLikes.add(postId);
          }
          return newLikes;
        });

        // Optimistically update like count
        setLikeCounts((prev) => {
          const newCounts = new Map(prev);
          if (wasLiked) {
            newCounts.set(postId, Math.max(0, currentCount - 1));
          } else {
            newCounts.set(postId, currentCount + 1);
          }
          return newCounts;
        });

        // Make API call
        const response = await axios.post(
          `http://localhost:3001/api/posts/${postId}/like`
        );

        const { isLiked, likesCount } = response.data;

        // --- Reconcile/ Sync with actual server side data (true data) ---
        // Update with actual response from server
        setUserLikes((prev) => {
          const newLikes = new Set(prev);
          if (isLiked) {
            newLikes.add(postId);
          } else {
            newLikes.delete(postId);
          }
          return newLikes;
        });

        // Update with actual like count from server
        if (typeof likesCount === "number") {
          setLikeCounts((prev) => {
            const newCounts = new Map(prev);
            newCounts.set(postId, likesCount);
            return newCounts;
          });
        }

        return { isLiked, likesCount };
      } catch (error) {
        // --- Revert like count if issue with server response ---
        setUserLikes((prev) => {
          const newLikes = new Set(prev);
          if (wasLiked) {
            newLikes.add(postId);
          } else {
            newLikes.delete(postId);
          }
          return newLikes;
        });

        setLikeCounts((prev) => {
          const newCounts = new Map(prev);
          newCounts.set(postId, currentCount);
          return newCounts;
        });

        console.error("Error toggling like:", error);
        throw error;
      }
    },
    [isAuthenticated, user, userLikes, likeCounts]
  );

  const isPostLiked = useCallback(
    (postId) => {
      return userLikes.has(postId);
    },
    [userLikes]
  );

  const getLikeCount = useCallback(
    (postId) => {
      return likeCounts.get(postId) || 0;
    },
    [likeCounts]
  );

  const clearLikes = useCallback(() => {
    setUserLikes(new Set());
    setLikeCounts(new Map());
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
    likeCounts,
    loading,
    toggleLike,
    isPostLiked,
    getLikeCount,
    clearLikes,
    refreshLikes: fetchUserLikes,
    initializeLikeCounts,
  };
};
