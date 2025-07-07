import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Loader2,
  RefreshCw,
  CheckCircle,
  Grid3X3,
  HeartHandshake,
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
import { useAuth } from "../../contexts/AuthContext";
import { useLikes } from "../../hooks/useLikes";
import AuthDialog from "../auth/AuthDialog";

const PostsFeed = ({
  posts,
  loading,
  loadingMore,
  error,
  hasMore,
  viewMode = "all",
  isAuthenticated,
  onRefresh,
  onLoadMore,
  onViewModeToggle,
}) => {
  const { user } = useAuth();
  const {
    isPostLiked,
    toggleLike,
    getLikeCount,
    initializeLikeCounts,
    loading: likesLoading,
  } = useLikes();

  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [likeLoadingStates, setLikeLoadingStates] = useState({});

  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Initialize like counts when posts change
  useEffect(() => {
    if (posts && posts.length > 0) {
      initializeLikeCounts(posts);
    }
  }, [posts, initializeLikeCounts]);

  // Handle like button click - simplified!
  const handleLikeClick = useCallback(
    async (postId) => {
      if (!isAuthenticated) {
        setIsAuthDialogOpen(true);
        return;
      }

      try {
        // Set loading state for this specific post
        setLikeLoadingStates((prev) => ({ ...prev, [postId]: true }));

        // The useLikes hook handles all the optimistic updates and API calls
        await toggleLike(postId);

      } catch (error) {
        console.error("Error toggling like:", error);
      } finally {
        // Clear loading state
        setLikeLoadingStates((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [isAuthenticated, toggleLike]
  );

  const handleToggleViewMode = () => {
    const newMode = viewMode === "all" ? "liked" : "all";
    onViewModeToggle(newMode);
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

  const getHeaderText = () => {
    if (viewMode === "liked") {
      return "Your Liked Posts";
    }
    return "Posts Feed";
  };

  const getEmptyStateMessage = () => {
    if (viewMode === "liked") {
      return {
        title: "No Liked Posts Yet",
        message:
          "Posts you like will appear here. Start exploring and like some posts!",
      };
    }
    return {
      title: "No Posts Yet",
      message:
        "Be the first to create a post! Share your thoughts with the community.",
    };
  };

  // Initial loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {getHeaderText()}
          </h2>
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
          <h2 className="text-2xl font-bold text-gray-900">
            {getHeaderText()}
          </h2>
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

  const emptyState = getEmptyStateMessage();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {getHeaderText()}
          </h2>
          <div className="flex items-center space-x-2">
            {/* View Toggle Button - Only show when authenticated */}
            {isAuthenticated && (
              <Button
                variant={viewMode === "all" ? "outline" : "default"}
                size="sm"
                onClick={handleToggleViewMode}
                className={`transition-colors ${
                  viewMode === "liked"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {viewMode === "all" ? (
                  <>
                    <HeartHandshake className="w-4 h-4 mr-2" />
                    Show Liked
                  </>
                ) : (
                  <>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Show All
                  </>
                )}
              </Button>
            )}

            {/* Refresh Button */}
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
                {viewMode === "liked" ? (
                  <HeartHandshake className="w-8 h-8 text-gray-400" />
                ) : (
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {emptyState.title}
              </h3>
              <p className="text-gray-600 mb-4">{emptyState.message}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              // Use the useLikes hook to get reactive like state
              const displayLikeCount = getLikeCount(post.id);
              const isLiked = isAuthenticated && isPostLiked(post.id);
              const isLikeLoading = likeLoadingStates[post.id];

              return (
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
                            onClick={() => handleLikeClick(post.id)}
                            disabled={isLikeLoading || likesLoading}
                            className={`transition-colors ${
                              isLiked
                                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                                : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                            }`}
                          >
                            {isLikeLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Heart
                                className={`w-4 h-4 mr-2 transition-transform hover:scale-110 ${
                                  isLiked ? "fill-current" : ""
                                }`}
                              />
                            )}
                            {displayLikeCount}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

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
                    {viewMode === "liked"
                      ? "You've seen all your liked posts!"
                      : "You're all caught up!"}
                  </p>
                  <p className="text-green-700 text-sm">
                    {viewMode === "liked"
                      ? "Like more posts to see them here."
                      : "You've seen all available posts."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Invisible element to trigger loading more */}
            {hasMore && !loadingMore && (
              <div ref={loadMoreRef} className="h-1" />
            )}
          </div>
        )}
      </div>

      {/* Authentication Dialog - Show when unauthenticated user tries to like */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        defaultMode="login"
      />
    </>
  );
};

export default PostsFeed;
