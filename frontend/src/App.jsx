import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  Server,
  Database,
  Palette,
  Heart,
  MessageCircle,
  Share,
  User,
  Settings,
  Plus,
  Search,
  Home,
  Star,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Separator } from "./components/ui/separator";

function App() {
  const [likedPosts, setLikedPosts] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make API call
        const response = await axios.get("http://localhost:3001/api/posts");

        console.log("API Response:", response.data);

        // Set posts state
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    console.log("Posts state updated:", posts);
  }, [posts]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="pt-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading posts from API...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-96 text-center border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <h3 className="font-semibold text-red-900 mb-2">
              Error Loading Posts
            </h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  PostsApp
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Create Post Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">

                </div>
              </div>
              </CardHeader>
          </Card>

          {/* Posts Feed */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Latest posts
              </h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{posts.length} posts</Badge>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">
                    No posts found. Make sure your backend is running!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {post.user?.name
                                ? post.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-base">
                                {post.user?.name || "Unknown User"}
                              </CardTitle>
                              {post.likesCount > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <CardDescription>
                              @{post.user?.username || "user"} •{" "}
                              {new Date(post.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {post.body}
                      </p>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={
                              likedPosts[post.id] ? "text-red-500" : ""
                            }
                          >
                            <Heart
                              className={`w-4 h-4 mr-2 ${
                                likedPosts[post.id] ? "fill-current" : ""
                              }`}
                            />
                            {(post.likesCount || 0) +
                              (likedPosts[post.id] ? 1 : 0)}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Comments
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                        <Badge variant="secondary">ID: {post.id}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
