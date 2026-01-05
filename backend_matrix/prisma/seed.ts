import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if data already exists to avoid duplicates on redeployment
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('📊 Database already contains data. Skipping seeding to prevent duplicates.');
    console.log(`   👥 Existing users: ${existingUsers}`);

    // Still show summary of existing data
    const courses = await prisma.course.count();
    const lessons = await prisma.lesson.count();
    const purchases = await prisma.purchase.count();
    const progress = await prisma.userProgress.count();

    console.log('\n📊 Current Database Summary:');
    console.log(`   👥 Users: ${existingUsers}`);
    console.log(`   📚 Courses: ${courses}`);
    console.log(`   📖 Lessons: ${lessons}`);
    console.log(`   🛒 Purchases: ${purchases}`);
    console.log(`   📊 Progress entries: ${progress}`);

    return;
  }

  console.log('🧹 Clearing any existing data...');
  await prisma.userProgress.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users (20 users)
  console.log('👥 Creating users...');
  const users = [
    {
      email: 'alex.johnson@email.com',
      passwordHash: await bcrypt.hash('SecurePass123!', 10),
      name: 'Alex Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    {
      email: 'sarah.mitchell@email.com',
      passwordHash: await bcrypt.hash('Password456!', 10),
      name: 'Sarah Mitchell',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      email: 'mike.davis@email.com',
      passwordHash: await bcrypt.hash('MikeSecure789!', 10),
      name: 'Mike Davis',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    {
      email: 'emily.chen@email.com',
      passwordHash: await bcrypt.hash('EmilyPass321!', 10),
      name: 'Emily Chen',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
    {
      email: 'david.wilson@email.com',
      passwordHash: await bcrypt.hash('DavidSecure654!', 10),
      name: 'David Wilson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    {
      email: 'lisa.brown@email.com',
      passwordHash: await bcrypt.hash('LisaPass987!', 10),
      name: 'Lisa Brown',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    },
    {
      email: 'james.taylor@email.com',
      passwordHash: await bcrypt.hash('JamesSecure147!', 10),
      name: 'James Taylor',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    },
    {
      email: 'anna.garcia@email.com',
      passwordHash: await bcrypt.hash('AnnaPass258!', 10),
      name: 'Anna Garcia',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    },
    {
      email: 'robert.martinez@email.com',
      passwordHash: await bcrypt.hash('RobertSecure369!', 10),
      name: 'Robert Martinez',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    },
    {
      email: 'jennifer.anderson@email.com',
      passwordHash: await bcrypt.hash('JenniferPass741!', 10),
      name: 'Jennifer Anderson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    },
    {
      email: 'william.thomas@email.com',
      passwordHash: await bcrypt.hash('WilliamSecure852!', 10),
      name: 'William Thomas',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=William',
    },
    {
      email: 'maria.jose@email.com',
      passwordHash: await bcrypt.hash('MariaPass963!', 10),
      name: 'Maria Jose',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
    {
      email: 'christopher.lee@email.com',
      passwordHash: await bcrypt.hash('ChrisSecure159!', 10),
      name: 'Christopher Lee',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher',
    },
    {
      email: 'jessica.white@email.com',
      passwordHash: await bcrypt.hash('JessicaPass753!', 10),
      name: 'Jessica White',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    },
    {
      email: 'daniel.harris@email.com',
      passwordHash: await bcrypt.hash('DanielSecure246!', 10),
      name: 'Daniel Harris',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    },
    {
      email: 'olivia.clark@email.com',
      passwordHash: await bcrypt.hash('OliviaPass357!', 10),
      name: 'Olivia Clark',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    },
    {
      email: 'matthew.lewis@email.com',
      passwordHash: await bcrypt.hash('MatthewSecure468!', 10),
      name: 'Matthew Lewis',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew',
    },
    {
      email: 'sophia.walker@email.com',
      passwordHash: await bcrypt.hash('SophiaPass579!', 10),
      name: 'Sophia Walker',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    },
    {
      email: 'andrew.hall@email.com',
      passwordHash: await bcrypt.hash('AndrewSecure681!', 10),
      name: 'Andrew Hall',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew',
    },
    {
      email: 'isabella.young@email.com',
      passwordHash: await bcrypt.hash('IsabellaPass792!', 10),
      name: 'Isabella Young',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
    },
  ];

  const createdUsers = await Promise.all(
    users.map(user => prisma.user.create({ data: user }))
  );

  // 2. Create Courses (8 courses)
  console.log('📚 Creating courses...');
  const courses = [
    {
      title: 'Complete React Development Bootcamp',
      description: 'Master React from fundamentals to advanced concepts including hooks, context, and state management. Build real-world applications with modern React patterns.',
      price: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
      categoryId: 'frontend',
      instructorName: 'Sarah Mitchell',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      title: 'Python for Data Science & Machine Learning',
      description: 'Comprehensive Python programming course focused on data analysis, visualization, and machine learning algorithms using pandas, numpy, and scikit-learn.',
      price: 119.99,
      imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
      categoryId: 'data-science',
      instructorName: 'Dr. Michael Chen',
      createdAt: new Date('2024-01-20T14:30:00Z'),
    },
    {
      title: 'Modern JavaScript: From Fundamentals to Advanced',
      description: 'Deep dive into JavaScript ES6+, asynchronous programming, closures, prototypes, and modern development practices.',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
      categoryId: 'javascript',
      instructorName: 'Alex Johnson',
      createdAt: new Date('2024-02-01T09:15:00Z'),
    },
    {
      title: 'Node.js Backend Development with Express',
      description: 'Build scalable backend applications with Node.js, Express, MongoDB, and RESTful API design patterns.',
      price: 99.99,
      imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
      categoryId: 'backend',
      instructorName: 'Emily Chen',
      createdAt: new Date('2024-02-10T11:45:00Z'),
    },
    {
      title: 'Full-Stack Web Development with MERN',
      description: 'Complete full-stack development course covering MongoDB, Express.js, React, and Node.js with hands-on projects.',
      price: 149.99,
      imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=400&fit=crop',
      categoryId: 'fullstack',
      instructorName: 'David Wilson',
      createdAt: new Date('2024-02-15T16:20:00Z'),
    },
    {
      title: 'DevOps & CI/CD Pipeline Mastery',
      description: 'Learn Docker, Kubernetes, Jenkins, GitLab CI, and cloud deployment strategies for modern DevOps practices.',
      price: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=400&fit=crop',
      categoryId: 'devops',
      instructorName: 'Lisa Brown',
      createdAt: new Date('2024-03-01T13:10:00Z'),
    },
    {
      title: 'Mobile App Development with React Native',
      description: 'Build cross-platform mobile applications using React Native, Expo, and native device features.',
      price: 109.99,
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop',
      categoryId: 'mobile',
      instructorName: 'James Taylor',
      createdAt: new Date('2024-03-10T10:30:00Z'),
    },
    {
      title: 'AWS Cloud Architecture & Solutions',
      description: 'Master Amazon Web Services including EC2, S3, Lambda, RDS, and serverless architecture design patterns.',
      price: 139.99,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
      categoryId: 'cloud',
      instructorName: 'Anna Garcia',
      createdAt: new Date('2024-03-20T15:45:00Z'),
    },
  ];

  const createdCourses = await Promise.all(
    courses.map(course => prisma.course.create({ data: course }))
  );

  // 3. Create Lessons for each course
  console.log('📖 Creating lessons...');
  const lessonsData = [
    // React Course Lessons
    [
      { title: 'Introduction to React Fundamentals', content: 'Understanding components, JSX, and the virtual DOM', order: 1 },
      { title: 'State Management with Hooks', content: 'useState, useEffect, and custom hooks implementation', order: 2 },
      { title: 'Advanced React Patterns', content: 'Higher-order components, render props, and compound components', order: 3 },
      { title: 'Building Real-World Applications', content: 'Project setup, routing, and deployment strategies', order: 4 },
    ],
    // Python Course Lessons
    [
      { title: 'Python Basics and Data Types', content: 'Variables, lists, dictionaries, and control structures', order: 1 },
      { title: 'Data Analysis with Pandas', content: 'DataFrames, Series, and data manipulation techniques', order: 2 },
      { title: 'Data Visualization with Matplotlib', content: 'Creating charts, graphs, and statistical plots', order: 3 },
      { title: 'Machine Learning with Scikit-learn', content: 'Supervised and unsupervised learning algorithms', order: 4 },
      { title: 'Real-World Data Science Projects', content: 'End-to-end data analysis and model deployment', order: 5 },
    ],
    // JavaScript Course Lessons
    [
      { title: 'ES6+ Features and Modern JavaScript', content: 'Arrow functions, destructuring, and template literals', order: 1 },
      { title: 'Asynchronous JavaScript', content: 'Promises, async/await, and callback patterns', order: 2 },
      { title: 'Advanced JavaScript Concepts', content: 'Closures, prototypes, and object-oriented programming', order: 3 },
    ],
    // Node.js Course Lessons
    [
      { title: 'Node.js Fundamentals', content: 'Event loop, modules, and npm package management', order: 1 },
      { title: 'Building REST APIs with Express', content: 'Routing, middleware, and request handling', order: 2 },
      { title: 'Database Integration', content: 'MongoDB connection, queries, and data modeling', order: 3 },
      { title: 'Authentication and Security', content: 'JWT tokens, password hashing, and input validation', order: 4 },
    ],
    // MERN Stack Course Lessons
    [
      { title: 'MongoDB Database Design', content: 'Schema design, relationships, and indexing strategies', order: 1 },
      { title: 'Express.js API Development', content: 'RESTful routes, error handling, and validation', order: 2 },
      { title: 'React Frontend Integration', content: 'API calls, state management, and user authentication', order: 3 },
      { title: 'Full-Stack Project Deployment', content: 'Production setup, environment configuration, and monitoring', order: 4 },
    ],
    // DevOps Course Lessons
    [
      { title: 'Containerization with Docker', content: 'Docker images, containers, and Docker Compose', order: 1 },
      { title: 'CI/CD Pipeline Setup', content: 'GitLab CI, Jenkins, and automated testing', order: 2 },
      { title: 'Kubernetes Orchestration', content: 'Pods, services, and deployment strategies', order: 3 },
      { title: 'Cloud Deployment Strategies', content: 'AWS, GCP, and Azure deployment patterns', order: 4 },
    ],
    // React Native Course Lessons
    [
      { title: 'React Native Fundamentals', content: 'Components, navigation, and Expo development', order: 1 },
      { title: 'Native Device Features', content: 'Camera, location, and device APIs integration', order: 2 },
      { title: 'App Store Deployment', content: 'Building, testing, and publishing mobile apps', order: 3 },
    ],
    // AWS Course Lessons
    [
      { title: 'AWS Core Services', content: 'EC2, S3, and VPC configuration and management', order: 1 },
      { title: 'Serverless Architecture', content: 'Lambda functions, API Gateway, and DynamoDB', order: 2 },
      { title: 'AWS Solutions Architecture', content: 'Scalability, security, and cost optimization', order: 3 },
      { title: 'Advanced AWS Services', content: 'RDS, ElastiCache, and CloudFormation templates', order: 4 },
    ],
  ];

  const allLessons: any[] = [];
  for (let i = 0; i < createdCourses.length; i++) {
    const course = createdCourses[i];
    const courseLessons = lessonsData[i];

    if (!course || !courseLessons) continue;

    for (const lessonData of courseLessons) {
      const lesson = await prisma.lesson.create({
        data: {
          ...lessonData,
          courseId: course.id,
          videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_${(i % 5) + 1}_10MB.mp4`,
          createdAt: new Date(course.createdAt.getTime() + (lessonData.order * 24 * 60 * 60 * 1000)), // Spread lessons over days
        },
      });
      allLessons.push(lesson);
    }
  }

  // 4. Create Purchases (15 purchases - some users buy multiple courses)
  console.log('🛒 Creating purchases...');
  const purchases = [
    // Alex Johnson buys 3 courses
    { userId: createdUsers[0]!.id, courseId: createdCourses[0]!.id, stripeSessionId: 'cs_test_alex_react_' + Date.now() },
    { userId: createdUsers[0]!.id, courseId: createdCourses[2]!.id, stripeSessionId: 'cs_test_alex_js_' + Date.now() },
    { userId: createdUsers[0]!.id, courseId: createdCourses[4]!.id, stripeSessionId: 'cs_test_alex_mern_' + Date.now() },

    // Sarah Mitchell buys 2 courses
    { userId: createdUsers[1]!.id, courseId: createdCourses[1]!.id, stripeSessionId: 'cs_test_sarah_python_' + Date.now() },
    { userId: createdUsers[1]!.id, courseId: createdCourses[3]!.id, stripeSessionId: 'cs_test_sarah_node_' + Date.now() },

    // Mike Davis buys 2 courses
    { userId: createdUsers[2]!.id, courseId: createdCourses[0]!.id, stripeSessionId: 'cs_test_mike_react_' + Date.now() },
    { userId: createdUsers[2]!.id, courseId: createdCourses[5]!.id, stripeSessionId: 'cs_test_mike_devops_' + Date.now() },

    // Emily Chen buys 2 courses
    { userId: createdUsers[3]!.id, courseId: createdCourses[6]!.id, stripeSessionId: 'cs_test_emily_reactnative_' + Date.now() },
    { userId: createdUsers[3]!.id, courseId: createdCourses[7]!.id, stripeSessionId: 'cs_test_emily_aws_' + Date.now() },

    // David Wilson buys 1 course
    { userId: createdUsers[4]!.id, courseId: createdCourses[3]!.id, stripeSessionId: 'cs_test_david_node_' + Date.now() },

    // Lisa Brown buys 1 course
    { userId: createdUsers[5]!.id, courseId: createdCourses[1]!.id, stripeSessionId: 'cs_test_lisa_python_' + Date.now() },

    // James Taylor buys 2 courses
    { userId: createdUsers[6]!.id, courseId: createdCourses[4]!.id, stripeSessionId: 'cs_test_james_mern_' + Date.now() },
    { userId: createdUsers[6]!.id, courseId: createdCourses[6]!.id, stripeSessionId: 'cs_test_james_reactnative_' + Date.now() },

    // Anna Garcia buys 1 course
    { userId: createdUsers[7]!.id, courseId: createdCourses[5]!.id, stripeSessionId: 'cs_test_anna_devops_' + Date.now() },

    // Robert Martinez buys 1 course
    { userId: createdUsers[8]!.id, courseId: createdCourses[2]!.id, stripeSessionId: 'cs_test_robert_js_' + Date.now() },
  ];

  const createdPurchases = await Promise.all(
    purchases.map(purchase => prisma.purchase.create({
      data: {
        ...purchase,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      }
    }))
  );

  // 5. Create User Progress (progress tracking for purchased courses)
  console.log('📊 Creating user progress...');
  const progressEntries: any[] = [];

  // For each purchase, create some progress
  for (const purchase of createdPurchases) {
    const courseLessons = allLessons.filter(lesson => lesson.courseId === purchase.courseId);

    // Simulate realistic progress: 70% complete on average
    const lessonsToComplete = Math.floor(courseLessons.length * (0.5 + Math.random() * 0.5)); // 50-100% completion

    for (let i = 0; i < lessonsToComplete; i++) {
      const lesson = courseLessons[i];
      if (!lesson) continue; // Skip if lesson doesn't exist

      const isCompleted = Math.random() > 0.3; // 70% chance of completion

      progressEntries.push({
        userId: purchase.userId,
        lessonId: lesson.id,
        completed: isCompleted,
        completedAt: isCompleted ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // Completed within last week
      });
    }
  }

  await Promise.all(
    progressEntries.map(progress => prisma.userProgress.create({ data: progress }))
  );

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users created: ${createdUsers.length}`);
  console.log(`   📚 Courses created: ${createdCourses.length}`);
  console.log(`   📖 Lessons created: ${allLessons.length}`);
  console.log(`   🛒 Purchases created: ${createdPurchases.length}`);
  console.log(`   📊 Progress entries created: ${progressEntries.length}`);

  console.log('\n🔑 Test Credentials:');
  console.log('Email: alex.johnson@email.com');
  console.log('Password: SecurePass123!');
  console.log('Has purchased: React Development, JavaScript, MERN Stack');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
