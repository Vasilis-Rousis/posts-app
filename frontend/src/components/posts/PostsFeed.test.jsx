import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PostsFeed from "./PostsFeed";

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the useLikes hook
const mockUseLikes = {
  isPostLiked: vi.fn(),
  toggleLike: vi.fn(),
  getLikeCount: vi.fn(),
  initializeLikeCounts: vi.fn(),
  loading: false,
};

vi.mock("../../hooks/useLikes", () => ({
  useLikes: () => mockUseLikes,
}));

describe("PostsFeed", () => {
  const mockPosts = [
    {
      id: 1,
      title: "First Post",
      body: "This is the first post content",
      createdAt: "2024-01-01T00:00:00Z",
      user: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
      },
      likesCount: 5,
    },
    {
      id: 2,
      title: "Second Post",
      body: "This is the second post content",
      createdAt: "2024-01-02T00:00:00Z",
      user: {
        id: 2,
        name: "Jane Smith",
        username: "janesmith",
      },
      likesCount: 3,
    },
  ];

  const defaultProps = {
    posts: mockPosts,
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    viewMode: "all",
    isAuthenticated: false,
    onRefresh: vi.fn(),
    onLoadMore: vi.fn(),
    onViewModeToggle: vi.fn(),
    onPostRemoved: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });
    mockUseLikes.isPostLiked.mockReturnValue(false);
    mockUseLikes.getLikeCount.mockImplementation((postId) => {
      const post = mockPosts.find((p) => p.id === postId);
      return post ? post.likesCount : 0;
    });
    mockUseLikes.toggleLike.mockResolvedValue({ isLiked: true, likesCount: 6 });
  });

  it("renders loading state", () => {
    render(<PostsFeed {...defaultProps} loading={true} />);
    expect(
      screen.getByText("Loading posts from database...")
    ).toBeInTheDocument();
  });

  it("renders error state", () => {
    const errorMessage = "Failed to load posts";
    render(<PostsFeed {...defaultProps} error={errorMessage} />);
    expect(screen.getByText("Error Loading Posts")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("renders empty state for all posts", () => {
    render(<PostsFeed {...defaultProps} posts={[]} />);
    expect(screen.getByText("No Posts Yet")).toBeInTheDocument();
    expect(
      screen.getByText(/Be the first to create a post/)
    ).toBeInTheDocument();
  });

  it("renders empty state for liked posts", () => {
    render(<PostsFeed {...defaultProps} posts={[]} viewMode="liked" />);
    expect(screen.getByText("No Liked Posts Yet")).toBeInTheDocument();
    expect(
      screen.getByText(/Posts you like will appear here/)
    ).toBeInTheDocument();
  });

  it("renders posts list", () => {
    render(<PostsFeed {...defaultProps} />);

    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(
      screen.getByText("This is the first post content")
    ).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    // Use getAllByText to handle potential multiple matches
    const johndoeElements = screen.getAllByText(/johndoe/i);
    expect(johndoeElements.length).toBeGreaterThan(0);

    expect(screen.getByText("Second Post")).toBeInTheDocument();
    expect(
      screen.getByText("This is the second post content")
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    const janesmithElements = screen.getAllByText(/janesmith/i);
    expect(janesmithElements.length).toBeGreaterThan(0);
  });

  it("shows correct header for all posts mode", () => {
    render(<PostsFeed {...defaultProps} viewMode="all" />);
    expect(screen.getByText("Posts Feed")).toBeInTheDocument();
  });

  it("shows correct header for liked posts mode", () => {
    render(<PostsFeed {...defaultProps} viewMode="liked" />);
    expect(screen.getByText("Your Liked Posts")).toBeInTheDocument();
  });

  it("shows view toggle button when authenticated", () => {
    render(<PostsFeed {...defaultProps} isAuthenticated={true} />);
    expect(screen.getByText("Show Liked")).toBeInTheDocument();
  });

  it("does not show view toggle button when not authenticated", () => {
    render(<PostsFeed {...defaultProps} isAuthenticated={false} />);
    expect(screen.queryByText("Show Liked")).not.toBeInTheDocument();
  });

  it("calls onViewModeToggle when toggle button is clicked", async () => {
    const user = userEvent.setup();
    const onViewModeToggle = vi.fn();

    render(
      <PostsFeed
        {...defaultProps}
        isAuthenticated={true}
        onViewModeToggle={onViewModeToggle}
      />
    );

    const toggleButton = screen.getByText("Show Liked");
    await user.click(toggleButton);

    expect(onViewModeToggle).toHaveBeenCalledWith("liked");
  });

  it("calls onRefresh when refresh button is clicked", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(<PostsFeed {...defaultProps} onRefresh={onRefresh} />);

    const refreshButton = screen.getByText("Refresh");
    await user.click(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });

  it("shows loading more state", () => {
    render(<PostsFeed {...defaultProps} loadingMore={true} />);
    expect(screen.getByText("Loading more posts...")).toBeInTheDocument();
  });

  it("shows end of posts message when no more posts", () => {
    render(<PostsFeed {...defaultProps} hasMore={false} />);
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  it("shows auth dialog when unauthenticated user clicks like", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(<PostsFeed {...defaultProps} isAuthenticated={false} />);

    const likeButtons = screen.getAllByRole("button", { name: /5/ });
    await user.click(likeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });
  });

  it("toggles like when authenticated user clicks like button", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: "Test User" },
    });

    render(<PostsFeed {...defaultProps} isAuthenticated={true} />);

    const likeButtons = screen.getAllByRole("button", { name: /5/ });
    await user.click(likeButtons[0]);

    await waitFor(() => {
      expect(mockUseLikes.toggleLike).toHaveBeenCalledWith(1);
    });
  });

  it("handles like error gracefully", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: "Test User" },
    });
    mockUseLikes.toggleLike.mockRejectedValue(new Error("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<PostsFeed {...defaultProps} isAuthenticated={true} />);

    const likeButtons = screen.getAllByRole("button", { name: /5/ });
    await user.click(likeButtons[0]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error toggling like:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("removes post from feed when unliked in liked mode", async () => {
    const user = userEvent.setup();
    const onPostRemoved = vi.fn();

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: "Test User" },
    });
    mockUseLikes.isPostLiked.mockReturnValue(true);
    mockUseLikes.toggleLike.mockResolvedValue({
      isLiked: false,
      likesCount: 4,
    });

    render(
      <PostsFeed
        {...defaultProps}
        isAuthenticated={true}
        viewMode="liked"
        onPostRemoved={onPostRemoved}
      />
    );

    const likeButtons = screen.getAllByRole("button", { name: /5/ });
    await user.click(likeButtons[0]);

    await waitFor(() => {
      expect(mockUseLikes.toggleLike).toHaveBeenCalledWith(1);
    });

    // Wait for the post removal timeout
    await new Promise((resolve) => setTimeout(resolve, 200));

    await waitFor(() => {
      expect(onPostRemoved).toHaveBeenCalledWith(1);
    });
  });
});
