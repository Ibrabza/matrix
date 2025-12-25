import type { CourseDetail } from '../types/types';

// Mock course details data
const mockCourseDetails: Record<string, CourseDetail> = {
  '1': {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the core concepts of React including components, state, props, and hooks.',
    fullDescription: `This comprehensive course will take you from React beginner to confident developer. You'll learn how to build modern, interactive user interfaces using React's component-based architecture.

Starting with the fundamentals, we'll cover JSX syntax, component creation, and the virtual DOM. Then we'll dive deep into state management with useState and useReducer, side effects with useEffect, and context for global state.

By the end of this course, you'll be able to build complete React applications with routing, form handling, API integration, and best practices for performance optimization.`,
    instructor: 'Sarah Johnson',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    category: 'Frontend',
    progress: 75,
    duration: '8h 30m',
    totalDuration: '8 hours 30 minutes',
    lessonsCount: 24,
    lastWatchedLessonId: 'lesson-3-2',
    lastWatchedLessonTitle: 'Introduction to Hooks',
    enrolledStudents: 12453,
    rating: 4.8,
    reviewsCount: 2341,
    updatedAt: 'December 2024',
    level: 'Beginner',
    prerequisites: ['Basic JavaScript knowledge', 'HTML & CSS fundamentals', 'Code editor installed'],
    whatYouWillLearn: [
      'Build reusable React components',
      'Manage state with hooks',
      'Handle user events and forms',
      'Fetch data from APIs',
      'Implement client-side routing',
      'Optimize React app performance',
    ],
    modules: [
      {
        id: 'module-1',
        title: 'Getting Started with React',
        lessons: [
          { id: 'lesson-1-1', title: 'Course Introduction', duration: '5:30', isCompleted: true, isLocked: false },
          { id: 'lesson-1-2', title: 'Setting Up Your Development Environment', duration: '12:45', isCompleted: true, isLocked: false },
          { id: 'lesson-1-3', title: 'Understanding JSX', duration: '18:20', isCompleted: true, isLocked: false },
          { id: 'lesson-1-4', title: 'Your First React Component', duration: '22:15', isCompleted: true, isLocked: false },
        ],
      },
      {
        id: 'module-2',
        title: 'Components & Props',
        lessons: [
          { id: 'lesson-2-1', title: 'Function vs Class Components', duration: '15:00', isCompleted: true, isLocked: false },
          { id: 'lesson-2-2', title: 'Props and Data Flow', duration: '20:30', isCompleted: true, isLocked: false },
          { id: 'lesson-2-3', title: 'Children Props', duration: '14:15', isCompleted: true, isLocked: false },
          { id: 'lesson-2-4', title: 'PropTypes and TypeScript', duration: '25:00', isCompleted: true, isLocked: false },
        ],
      },
      {
        id: 'module-3',
        title: 'State & Hooks',
        lessons: [
          { id: 'lesson-3-1', title: 'Understanding State', duration: '18:45', isCompleted: true, isLocked: false },
          { id: 'lesson-3-2', title: 'Introduction to Hooks', duration: '22:30', isCompleted: false, isLocked: false },
          { id: 'lesson-3-3', title: 'useState Deep Dive', duration: '28:00', isCompleted: false, isLocked: false },
          { id: 'lesson-3-4', title: 'useEffect for Side Effects', duration: '32:15', isCompleted: false, isLocked: false },
          { id: 'lesson-3-5', title: 'Custom Hooks', duration: '24:00', isCompleted: false, isLocked: false },
        ],
      },
      {
        id: 'module-4',
        title: 'Advanced Patterns',
        lessons: [
          { id: 'lesson-4-1', title: 'Context API', duration: '26:30', isCompleted: false, isLocked: false },
          { id: 'lesson-4-2', title: 'useReducer for Complex State', duration: '30:00', isCompleted: false, isLocked: false },
          { id: 'lesson-4-3', title: 'Performance Optimization', duration: '35:45', isCompleted: false, isLocked: false },
          { id: 'lesson-4-4', title: 'React DevTools', duration: '15:00', isCompleted: false, isLocked: false },
        ],
      },
      {
        id: 'module-5',
        title: 'Building a Complete App',
        lessons: [
          { id: 'lesson-5-1', title: 'Project Setup', duration: '20:00', isCompleted: false, isLocked: true },
          { id: 'lesson-5-2', title: 'Routing with React Router', duration: '28:30', isCompleted: false, isLocked: true },
          { id: 'lesson-5-3', title: 'Form Handling', duration: '32:00', isCompleted: false, isLocked: true },
          { id: 'lesson-5-4', title: 'API Integration', duration: '38:45', isCompleted: false, isLocked: true },
          { id: 'lesson-5-5', title: 'Deployment', duration: '18:00', isCompleted: false, isLocked: true },
        ],
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Node.js Backend Development',
    description: 'Master server-side JavaScript with Node.js. Create RESTful APIs and connect databases.',
    fullDescription: `Become a proficient backend developer with this comprehensive Node.js course. Learn to build scalable server-side applications, RESTful APIs, and integrate with databases.

We'll start with Node.js fundamentals including the event loop, modules, and npm. Then progress to building Express.js applications with middleware, routing, and error handling.

The course covers authentication with JWT, database integration with MongoDB and PostgreSQL, and deployment strategies for production environments.`,
    instructor: 'Michael Chen',
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
    category: 'Backend',
    progress: 45,
    duration: '12h 15m',
    totalDuration: '12 hours 15 minutes',
    lessonsCount: 36,
    lastWatchedLessonId: 'lesson-2-3',
    lastWatchedLessonTitle: 'Express Middleware',
    enrolledStudents: 8932,
    rating: 4.7,
    reviewsCount: 1567,
    updatedAt: 'November 2024',
    level: 'Intermediate',
    prerequisites: ['JavaScript ES6+', 'Basic command line usage', 'Understanding of HTTP'],
    whatYouWillLearn: [
      'Build RESTful APIs with Express',
      'Implement authentication & authorization',
      'Work with MongoDB and PostgreSQL',
      'Handle file uploads and streaming',
      'Deploy to cloud platforms',
      'Write unit and integration tests',
    ],
    modules: [
      {
        id: 'module-1',
        title: 'Node.js Fundamentals',
        lessons: [
          { id: 'lesson-1-1', title: 'What is Node.js?', duration: '10:00', isCompleted: true, isLocked: false },
          { id: 'lesson-1-2', title: 'The Event Loop', duration: '18:30', isCompleted: true, isLocked: false },
          { id: 'lesson-1-3', title: 'Modules and npm', duration: '22:00', isCompleted: true, isLocked: false },
        ],
      },
      {
        id: 'module-2',
        title: 'Express.js Basics',
        lessons: [
          { id: 'lesson-2-1', title: 'Setting Up Express', duration: '15:00', isCompleted: true, isLocked: false },
          { id: 'lesson-2-2', title: 'Routing', duration: '20:00', isCompleted: true, isLocked: false },
          { id: 'lesson-2-3', title: 'Express Middleware', duration: '25:30', isCompleted: false, isLocked: false },
          { id: 'lesson-2-4', title: 'Error Handling', duration: '18:00', isCompleted: false, isLocked: false },
        ],
      },
      {
        id: 'module-3',
        title: 'Database Integration',
        lessons: [
          { id: 'lesson-3-1', title: 'MongoDB with Mongoose', duration: '35:00', isCompleted: false, isLocked: false },
          { id: 'lesson-3-2', title: 'PostgreSQL with Prisma', duration: '40:00', isCompleted: false, isLocked: false },
          { id: 'lesson-3-3', title: 'Database Migrations', duration: '22:00', isCompleted: false, isLocked: false },
        ],
      },
    ],
  },
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCourseById = async (id: string): Promise<CourseDetail | null> => {
  await delay(1200); // Simulate network delay
  return mockCourseDetails[id] || null;
};

export const getAllCourseIds = (): string[] => {
  return Object.keys(mockCourseDetails);
};

