const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Fetch users from JSONPlaceholder
    console.log("📥 Fetching users from JSONPlaceholder...");
    const usersResponse = await fetch(
      "https://jsonplaceholder.typicode.com/users"
    );
    const users = await usersResponse.json();

    // Fetch posts from JSONPlaceholder
    console.log("📥 Fetching posts from JSONPlaceholder...");
    const postsResponse = await fetch(
      "https://jsonplaceholder.typicode.com/posts"
    );
    const posts = await postsResponse.json();

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Insert users
    console.log("👥 Inserting users...");
    const defaultPassword = await bcrypt.hash("password123", 10);

    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          website: user.website,
          addressStreet: user.address?.street,
          addressSuite: user.address?.suite,
          addressCity: user.address?.city,
          addressZipcode: user.address?.zipcode,
          addressLat: user.address?.geo?.lat,
          addressLng: user.address?.geo?.lng,
          companyName: user.company?.name,
          companyCatchPhrase: user.company?.catchPhrase,
          companyBs: user.company?.bs,
          password: defaultPassword, // Default password for all users
        },
      });
    }

    // Insert posts
    console.log("📝 Inserting posts...");
    for (const post of posts) {
      await prisma.post.create({
        data: {
          id: post.id,
          title: post.title,
          body: post.body,
          userId: post.userId,
        },
      });
    }

    // Add some sample likes for demonstration
    console.log("❤️ Adding sample likes...");
    const sampleLikes = [
      { userId: 1, postId: 1 },
      { userId: 1, postId: 5 },
      { userId: 1, postId: 10 },
      { userId: 2, postId: 1 },
      { userId: 2, postId: 2 },
      { userId: 3, postId: 1 },
      { userId: 3, postId: 15 },
      { userId: 3, postId: 20 },
    ];

    for (const like of sampleLikes) {
      await prisma.like.create({
        data: like,
      });
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(
      `📊 Inserted: ${users.length} users, ${posts.length} posts, ${sampleLikes.length} likes`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
