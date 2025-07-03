const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    }
  );
};

// Optional Authentication Middleware (for public endpoints that can show user-specific data if logged in)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null; // No user logged in
    return next();
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, user) => {
      if (err) {
        req.user = null; // Invalid token, treat as no user
      } else {
        req.user = user; // Valid token, user is logged in
      }
      next();
    }
  );
};

// =============================================================================
// HEALTH CHECK & TEST ROUTES (PUBLIC)
// =============================================================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Posts API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const likeCount = await prisma.like.count();

    res.json({
      message: "Database connection successful",
      data: {
        users: userCount,
        posts: postCount,
        likes: likeCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// =============================================================================
// AUTHENTICATION ROUTES (PUBLIC)
// =============================================================================

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required (name, username, email, password)",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// =============================================================================
// POSTS ROUTES (PUBLIC VIEWING, PROTECTED ACTIONS)
// =============================================================================

// Get all posts with pagination - PUBLIC but shows user-specific data if logged in
app.get("/api/posts", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { body: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const posts = await prisma.post.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        }, // Always include likes for social proof
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add isLiked flag for current user (if logged in)
    const postsWithLikeStatus = posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.user,
      isLiked:
        req.user && post.likes
          ? post.likes.some((like) => like.userId === req.user.userId)
          : false,
      likesCount: post._count.likes,
    }));

    // Get total count for pagination
    const totalPosts = await prisma.post.count({ where });

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNext: skip + parseInt(limit) < totalPosts,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Get a single post by ID - PUBLIC but shows user-specific data if logged in
app.get("/api/posts/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        likes: req.user
          ? {
              select: {
                userId: true,
              },
            }
          : false, // Only include likes if user is authenticated
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      ...post,
      isLiked:
        req.user && post.likes
          ? post.likes.some((like) => like.userId === req.user.userId)
          : false,
      likesCount: post._count.likes,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Create a new post - PROTECTED
app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    if (title.length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters long" });
    }

    if (body.length < 10) {
      return res
        .status(400)
        .json({ message: "Body must be at least 10 characters long" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        body,
        userId: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: {
        ...post,
        isLiked: false,
        likesCount: 0,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});

// Update a post (only by the author) - PROTECTED
app.put("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts" });
    }

    // Validation
    if (title && title.length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters long" });
    }

    if (body && body.length < 10) {
      return res
        .status(400)
        .json({ message: "Body must be at least 10 characters long" });
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(body && { body }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    res.json({
      message: "Post updated successfully",
      post: {
        ...updatedPost,
        isLiked: updatedPost.likes.some(
          (like) => like.userId === req.user.userId
        ),
        likesCount: updatedPost._count.likes,
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post (only by the author) - PROTECTED
app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    // Delete post (likes will be deleted automatically due to cascade)
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// =============================================================================
// LIKES ROUTES (PROTECTED)
// =============================================================================

// Like/Unlike a post (toggle) - PROTECTED
app.post("/api/posts/:postId/like", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId),
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      res.json({ message: "Post unliked", isLiked: false });
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          userId: userId,
          postId: parseInt(postId),
        },
      });

      res.json({ message: "Post liked", isLiked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
});

// Get user's liked posts - PROTECTED
app.get("/api/user/liked-posts", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const likedPosts = await prisma.like.findMany({
      where: {
        userId: req.user.userId,
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const posts = likedPosts.map((like) => ({
      ...like.post,
      isLiked: true,
      likesCount: like.post._count.likes,
    }));

    // Get total count
    const totalLiked = await prisma.like.count({
      where: { userId: req.user.userId },
    });

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLiked / limit),
        totalPosts: totalLiked,
        hasNext: skip + parseInt(limit) < totalLiked,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ message: "Error fetching liked posts" });
  }
});

// Remove all likes for current user - PROTECTED
app.delete(
  "/api/user/liked-posts/clear",
  authenticateToken,
  async (req, res) => {
    try {
      const deletedCount = await prisma.like.deleteMany({
        where: {
          userId: req.user.userId,
        },
      });

      res.json({
        message: "All likes cleared successfully",
        deletedCount: deletedCount.count,
      });
    } catch (error) {
      console.error("Error clearing likes:", error);
      res.status(500).json({ message: "Error clearing likes" });
    }
  }
);

// =============================================================================
// USER ROUTES (PROTECTED)
// =============================================================================

// Get current user profile - PROTECTED
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        website: true,
        addressCity: true,
        companyName: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// Get user's own posts - PROTECTED
app.get("/api/user/posts", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { userId: req.user.userId },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const postsWithLikeStatus = posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.user,
      isLiked: post.likes.some((like) => like.userId === req.user.userId),
      likesCount: post._count.likes,
    }));

    const totalPosts = await prisma.post.count({
      where: { userId: req.user.userId },
    });

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNext: skip + parseInt(limit) < totalPosts,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Error fetching user posts" });
  }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// =============================================================================
// SERVER START
// =============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/api/test-db`);
  console.log("📋 API Endpoints:");
  console.log("   🌐 PUBLIC:");
  console.log("   - GET /api/posts (view all posts)");
  console.log("   - GET /api/posts/:id (view single post)");
  console.log("   - POST /api/auth/register");
  console.log("   - POST /api/auth/login");
  console.log("   🔒 PROTECTED:");
  console.log("   - POST /api/posts (create post)");
  console.log("   - PUT /api/posts/:id (update post)");
  console.log("   - DELETE /api/posts/:id (delete post)");
  console.log("   - POST /api/posts/:id/like (like/unlike)");
  console.log("   - GET /api/user/profile");
  console.log("   - GET /api/user/posts");
  console.log("   - GET /api/user/liked-posts");
  console.log("   - DELETE /api/user/liked-posts/clear");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
