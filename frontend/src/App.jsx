import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Post Components
import CreatePost from "./components/posts/CreatePost";
import PostsFeed from "./components/posts/PostsFeed";

function App() {
  // State Management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const stateRef = useRef();
  stateRef.current = {
    currentPage,
    loadingMore,
    hasMore,
    postsLength: posts.length,
  };


  // Fetch posts from API with pagination
  const fetchPosts = async (page = 1, shouldAppend = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await axios.get("http://localhost:3001/api/posts", {
        params: {
          page: page,
          limit: 10,
        },
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

    await fetchPosts(currentState.currentPage + 1, true);
  };

  const loadMorePosts = useCallback(() => {
    return loadMoreRef.current();
  }, []);

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    // Add the new post to the beginning of the posts array
    setPosts((prevPosts) => [newPost.post || newPost, ...prevPosts]);
  };

  // Handle refresh - reset to first page
  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

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
              onRefresh={handleRefresh}
              onLoadMore={loadMorePosts}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
