import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Star,
  Settings,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

const PostsFeed = ({ posts, loading, error, onRefresh }) => {
  const [likedPosts, setLikedPosts] = useState({});

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    // TODO: Make API call to update like in database
    console.log(`Toggle like for post ${postId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Posts Feed</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="animate-pulse">
              Loading...
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading posts from database...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Posts Feed</h2>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-lg font-bold">!</span>
            </div>
            <h3 className="font-semibold text-red-900 mb-2">
              Error Loading Posts
            </h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Posts Feed</h2>

        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share something with the community!
            </p>
            <Badge variant="secondary">Database connected ✅</Badge>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-md transition-all duration-200 hover:border-gray-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-gray-100">
                      <AvatarImage
                        src={post.user?.avatar}
                        alt={post.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
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
                        <CardTitle className="text-base text-gray-900">
                          {post.user?.name || "Unknown User"}
                        </CardTitle>
                        {(post.likesCount || 0) > 5 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-orange-300 text-orange-600"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        @{post.user?.username || "user"} •{" "}
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{post.body}</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={`transition-colors ${
                          likedPosts[post.id]
                            ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                            : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 transition-transform hover:scale-110 ${
                            likedPosts[post.id] ? "fill-current" : ""
                          }`}
                        />
                        {(post.likesCount || 0) + (likedPosts[post.id] ? 1 : 0)}
                      </Button>

                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsFeed;
