import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import CreatePost from "./CreatePost";

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("axios");

describe("CreatePost", () => {
  const mockOnPostCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    render(<CreatePost onPostCreated={mockOnPostCreated} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows sign in message when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(<CreatePost onPostCreated={mockOnPostCreated} />);
    expect(screen.getByText("Sign in to create a post")).toBeInTheDocument();
  });

  it("shows welcome message when authenticated", () => {
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    render(<CreatePost onPostCreated={mockOnPostCreated} />);
    expect(screen.getByText("Welcome back, John Doe!")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    render(<CreatePost onPostCreated={mockOnPostCreated} />);

    expect(screen.getByLabelText("Post Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByText("Create Post")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    render(<CreatePost onPostCreated={mockOnPostCreated} />);

    const titleInput = screen.getByLabelText("Post Title");
    const bodyInput = screen.getByLabelText("Description");

    // Type something and then clear to trigger validation
    await user.type(titleInput, "a");
    await user.clear(titleInput);

    await user.type(bodyInput, "a");
    await user.clear(bodyInput);

    // Move focus away to trigger blur validation
    await user.tab();

    await waitFor(
      () => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(screen.getByText("Description is required")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("validates minimum title length", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    render(<CreatePost onPostCreated={mockOnPostCreated} />);

    const titleInput = screen.getByLabelText("Post Title");
    await user.type(titleInput, "Hi");

    await waitFor(() => {
      expect(
        screen.getByText("Title must be at least 3 characters")
      ).toBeInTheDocument();
    });
  });

  it("validates minimum description length", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    render(<CreatePost onPostCreated={mockOnPostCreated} />);

    const descriptionInput = screen.getByLabelText("Description");
    await user.type(descriptionInput, "Short");

    await waitFor(() => {
      expect(
        screen.getByText("Description must be at least 10 characters")
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    const mockResponse = {
      data: {
        post: {
          id: 1,
          title: "Test Post",
          body: "This is a test post description that is long enough.",
          user: mockUser,
        },
      },
    };

    axios.post.mockResolvedValue(mockResponse);

    render(<CreatePost onPostCreated={mockOnPostCreated} />);

    const titleInput = screen.getByLabelText("Post Title");
    const descriptionInput = screen.getByLabelText("Description");
    const submitButton = screen.getByText("Create Post");

    await user.type(titleInput, "Test Post");
    await user.type(
      descriptionInput,
      "This is a test post description that is long enough."
    );
    await user.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3001/api/posts",
        {
          title: "Test Post",
          body: "This is a test post description that is long enough.",
          userId: 1,
        }
      );
      expect(mockOnPostCreated).toHaveBeenCalledWith(mockResponse.data);
      expect(
        screen.getByText("Post created successfully!")
      ).toBeInTheDocument();
    });
  });

  it("handles submission error", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    axios.post.mockRejectedValue(new Error("Network error"));

    render(<CreatePost onPostCreated={mockOnPostCreated} />);

    const titleInput = screen.getByLabelText("Post Title");
    const descriptionInput = screen.getByLabelText("Description");
    const submitButton = screen.getByText("Create Post");

    await user.type(titleInput, "Test Post");
    await user.type(
      descriptionInput,
      "This is a test post description that is long enough."
    );
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to create post. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("resets form after successful submission", async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, name: "John Doe" };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
    });

    const mockResponse = {
      data: {
        post: {
          id: 1,
          title: "Test Post",
          body: "This is a test post description that is long enough.",
          user: mockUser,
        },
      },
    };

    axios.post.mockResolvedValue(mockResponse);

    render(<CreatePost onPostCreated={mockOnPostCreated} />);

    const titleInput = screen.getByLabelText("Post Title");
    const descriptionInput = screen.getByLabelText("Description");
    const submitButton = screen.getByText("Create Post");

    await user.type(titleInput, "Test Post");
    await user.type(
      descriptionInput,
      "This is a test post description that is long enough."
    );
    await user.click(submitButton);

    await waitFor(() => {
      expect(titleInput.value).toBe("");
      expect(descriptionInput.value).toBe("");
    });
  });
});
