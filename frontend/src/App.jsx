import React, { useState, useEffect } from "react";
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
  const [error, setError] = useState(null);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("http://localhost:3001/api/posts");
      console.log("API Response:", response.data);

      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    console.log("New post created:", newPost);
    // Add the new post to the beginning of the posts array
    setPosts((prevPosts) => [newPost.post || newPost, ...prevPosts]);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPosts();
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
              error={error}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
