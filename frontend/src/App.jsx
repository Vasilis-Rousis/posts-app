import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Post Components
import CreatePost from "./components/posts/CreatePost";
import PostsFeed from "./components/posts/PostsFeed";

// Auth Context
import { useAuth } from "./contexts/AuthContext";

function App() {
  // Auth state
  const { isAuthenticated, user } = useAuth();

  // State Management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState("all"); // "all" or "liked"

  const stateRef = useRef();
  stateRef.current = {
    currentPage,
    loadingMore,
    hasMore,
    postsLength: posts.length,
    viewMode,
  };

  // Fetch posts from API with pagination
  const fetchPosts = async (page = 1, shouldAppend = false, mode = "all") => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Determine which endpoint to call based on mode
      let url;
      let headers = {};

      if (mode === "liked") {
        // For liked posts, we need authentication
        if (!isAuthenticated) {
          setError("You need to be logged in to view liked posts");
          setLoading(false);
          setLoadingMore(false);
          return;
        }
        url = "http://localhost:3001/api/user/liked-posts";
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // For all posts
        url = "http://localhost:3001/api/posts";
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
        },
        headers,
      });

      const newPosts = response.data.posts || [];
      const pagination = response.data.pagination;

      if (shouldAppend) {
        // Append new posts to existing posts (infinite scroll)
        setPosts((prevPosts) => {
          return [...prevPosts, ...newPosts];
        });
      } else {
        // Replace posts (initial load or refresh)
        setPosts(newPosts);
      }

      setCurrentPage(pagination.currentPage);
      setHasMore(pagination.hasNext);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreRef = useRef();
  loadMoreRef.current = async () => {
    const currentState = stateRef.current;

    if (currentState.loadingMore || !currentState.hasMore) {
      return;
    }

    await fetchPosts(currentState.currentPage + 1, true, currentState.viewMode);
  };

  const loadMorePosts = useCallback(() => {
    return loadMoreRef.current();
  }, []);

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    // Only add to posts if we're viewing all posts
    if (viewMode === "all") {
      setPosts((prevPosts) => [newPost.post || newPost, ...prevPosts]);
    }
    // If we're viewing liked posts, don't add the new post since it's not liked yet
  };

  // Handle refresh - reset to first page with current view mode
  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchPosts(1, false, viewMode);
  };

  // Handle view mode toggle
  const handleViewModeToggle = (newMode) => {
    if (newMode !== viewMode) {
      setViewMode(newMode);
      setCurrentPage(1);
      setHasMore(true);
      setPosts([]); // Clear existing posts
      fetchPosts(1, false, newMode);
    }
  };

  // Fetch posts when component mounts or when auth state changes
  useEffect(() => {
    fetchPosts(1, false, viewMode);
  }, [isAuthenticated]); // Re-fetch when auth state changes

  // Reset to "all" view when user logs out
  useEffect(() => {
    if (!isAuthenticated && viewMode === "liked") {
      setViewMode("all");
      setCurrentPage(1);
      setHasMore(true);
      fetchPosts(1, false, "all");
    }
  }, [isAuthenticated, viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <CreatePost onPostCreated={handlePostCreated} />
            <PostsFeed
              posts={posts}
              loading={loading}
              loadingMore={loadingMore}
              error={error}
              hasMore={hasMore}
              viewMode={viewMode}
              isAuthenticated={isAuthenticated}
              onRefresh={handleRefresh}
              onLoadMore={loadMorePosts}
              onViewModeToggle={handleViewModeToggle}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
