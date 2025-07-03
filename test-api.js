// Node.js API Test Script for Posts App
const https = require("https");
const http = require("http");

const baseUrl = "http://localhost:3001/api";

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const { method = "GET", headers = {}, body } = options;

    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }

    req.end();
  });
}

// Test functions
async function runTests() {
  console.log("🧪 Testing Posts App API...");
  console.log("==========================\n");

  try {
    // Test 1: Health Check
    console.log("1️⃣ Testing Health Check...");
    const health = await makeRequest(`${baseUrl}/health`);
    console.log("✅ Health Check:", JSON.stringify(health.data, null, 2));

    // Test 2: Database Connection
    console.log("\n2️⃣ Testing Database Connection...");
    const dbTest = await makeRequest(`${baseUrl}/test-db`);
    console.log("✅ Database Test:", JSON.stringify(dbTest.data, null, 2));

    // Test 3: Register New User
    console.log("\n3️⃣ Registering New User...");
    const registerData = {
      name: "Node.js Test User 12345678",
      username: "nodetest12345678",
      email: "node12345678@test.com",
      password: "password123",
    };

    const register = await makeRequest(`${baseUrl}/auth/register`, {
      method: "POST",
      body: registerData,
    });

    if (register.status === 201 && register.data.token) {
      console.log("✅ Registration successful!");
      console.log("User:", JSON.stringify(register.data.user, null, 2));

      const token = register.data.token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      // Test 4: Get Posts
      console.log("\n4️⃣ Getting Posts (Protected Route)...");
      const posts = await makeRequest(`${baseUrl}/posts?limit=3`, {
        headers: authHeaders,
      });
      console.log("✅ Posts retrieved:", JSON.stringify(posts.data, null, 2));

      // Test 5: Create Post
      console.log("\n5️⃣ Creating New Post...");
      const postData = {
        title: "Node.js API Test Post",
        body: "This post was created by the Node.js test script to verify everything works correctly!",
      };

      const createPost = await makeRequest(`${baseUrl}/posts`, {
        method: "POST",
        headers: authHeaders,
        body: postData,
      });

      if (createPost.status === 201) {
        console.log(
          "✅ Post created:",
          JSON.stringify(createPost.data.post, null, 2)
        );

        const postId = createPost.data.post.id;

        // Test 6: Like the Post
        console.log("\n6️⃣ Liking the Created Post...");
        const like = await makeRequest(`${baseUrl}/posts/${postId}/like`, {
          method: "POST",
          headers: authHeaders,
        });
        console.log("✅ Post liked:", JSON.stringify(like.data, null, 2));

        // Test 7: Get Liked Posts
        console.log("\n7️⃣ Getting Liked Posts...");
        const likedPosts = await makeRequest(`${baseUrl}/user/liked-posts`, {
          headers: authHeaders,
        });
        console.log(
          "✅ Liked posts:",
          JSON.stringify(likedPosts.data, null, 2)
        );
      }

      // Test 8: Get User Profile
      console.log("\n8️⃣ Getting User Profile...");
      const profile = await makeRequest(`${baseUrl}/user/profile`, {
        headers: authHeaders,
      });
      console.log("✅ User profile:", JSON.stringify(profile.data, null, 2));
    } else {
      console.log(
        "❌ Registration failed:",
        JSON.stringify(register.data, null, 2)
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }

  console.log("\n✅ API Testing Complete!");
}

// Run the tests
runTests();
