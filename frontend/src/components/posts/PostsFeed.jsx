import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Loader2,
  RefreshCw,
  CheckCircle,
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

const PostsFeed = ({
  posts,
  loading,
  loadingMore,
  error,
  hasMore,
  onRefresh,
  onLoadMore,
}) => {
  const [likedPosts, setLikedPosts] = useState({});
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore) {
        onLoadMoreRef.current();
      }
    },
    [hasMore, loadingMore]
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };

    // Create new observer
    observerRef.current = new IntersectionObserver(handleObserver, options);

    // Observe the load more element if it exists
    if (loadMoreRef.current && hasMore && !loadingMore) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, hasMore, loadingMore]);

  // Separate effect to handle element reference changes
  useEffect(() => {
    if (observerRef.current && loadMoreRef.current && hasMore && !loadingMore) {
      observerRef.current.disconnect();
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [posts.length, hasMore, loadingMore]);

  // Initial loading state
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
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={onRefresh} className="bg-red-600 hover:bg-red-700">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Posts Feed</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to create a post! Share your thoughts with the
              community.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          post.user?.name || "User"
                        )}&background=6366f1&color=fff`}
                        alt={post.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {(post.user?.name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.user?.name || "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{post.user?.username || "user"} •{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2 break-words whitespace-normal">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-700 leading-relaxed break-words whitespace-normal">
                      {post.body}
                    </CardDescription>
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

          {/* Loading more indicator */}
          {loadingMore && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Loading more posts...</p>
              </CardContent>
            </Card>
          )}

          {/* End of posts indicator */}
          {!hasMore && posts.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-green-800 font-medium">
                  You're all caught up!
                </p>
                <p className="text-green-700 text-sm">
                  You've seen all available posts.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Invisible element to trigger loading more */}
          {hasMore && !loadingMore && <div ref={loadMoreRef} className="h-1" />}
        </div>
      )}
    </div>
  );
};

export default PostsFeed;
