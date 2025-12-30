/**
 * Debug Script: Check Purchase Status
 * 
 * This script helps debug 403 Forbidden errors on the progress endpoint
 * by checking the Purchase table in the database.
 * 
 * Usage:
 *   node debug-purchase.js <userId> <courseId>
 * 
 * Example:
 *   node debug-purchase.js "user-123" "1d6266c6-fca0-487e-8101-4001e6056332"
 */

const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugPurchase(userId, courseId) {
  console.log('\n🔍 DEBUG: Purchase Status Check\n');
  console.log('━'.repeat(60));
  console.log(`User ID:   ${userId}`);
  console.log(`Course ID: ${courseId}`);
  console.log('━'.repeat(60));

  try {
    // 1. Check if user exists
    console.log('\n1️⃣ Checking if user exists...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      console.error('❌ USER NOT FOUND');
      console.log('   This userId does not exist in the database.');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name
    });

    // 2. Check if course exists
    console.log('\n2️⃣ Checking if course exists...');
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true }
    });

    if (!course) {
      console.error('❌ COURSE NOT FOUND');
      console.log('   This courseId does not exist in the database.');
      return;
    }

    console.log('✅ Course found:', {
      id: course.id,
      title: course.title,
      price: course.price
    });

    // 3. Check for specific purchase
    console.log('\n3️⃣ Checking for purchase...');
    const purchase = await prisma.purchase.findUnique({
      where: { 
        userId_courseId: { 
          userId, 
          courseId 
        } 
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        stripeSessionId: true,
        createdAt: true
      }
    });

    if (!purchase) {
      console.error('❌ PURCHASE NOT FOUND');
      console.log('   User has NOT purchased this course.');
    } else {
      console.log('✅ PURCHASE FOUND:', {
        id: purchase.id,
        stripeSessionId: purchase.stripeSessionId,
        purchasedAt: purchase.createdAt
      });
    }

    // 4. List all purchases for this user
    console.log('\n4️⃣ All purchases for this user:');
    const allUserPurchases = await prisma.purchase.findMany({
      where: { userId },
      select: {
        id: true,
        courseId: true,
        createdAt: true,
        course: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (allUserPurchases.length === 0) {
      console.log('   📭 No purchases found for this user.');
    } else {
      console.log(`   📚 Found ${allUserPurchases.length} purchase(s):\n`);
      allUserPurchases.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.course.title}`);
        console.log(`      Course ID: ${p.courseId}`);
        console.log(`      Purchased: ${p.createdAt}`);
        console.log(`      Match: ${p.courseId === courseId ? '✅ YES' : '❌ NO'}`);
        console.log('');
      });
    }

    // 5. Check for typos/formatting issues
    if (allUserPurchases.length > 0 && !purchase) {
      console.log('\n5️⃣ Checking for formatting issues...');
      const similarCourses = allUserPurchases.filter(p => 
        p.courseId.toLowerCase().includes(courseId.toLowerCase().substring(0, 10))
      );

      if (similarCourses.length > 0) {
        console.warn('⚠️  Found similar course IDs (possible typo):');
        similarCourses.forEach(p => {
          console.log(`   - ${p.courseId}`);
        });
      } else {
        console.log('   No similar course IDs found.');
      }
    }

    // 6. Summary
    console.log('\n━'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('━'.repeat(60));
    console.log(`User Exists:         ${user ? '✅ YES' : '❌ NO'}`);
    console.log(`Course Exists:       ${course ? '✅ YES' : '❌ NO'}`);
    console.log(`Purchase Exists:     ${purchase ? '✅ YES' : '❌ NO'}`);
    console.log(`User Total Purchases: ${allUserPurchases.length}`);
    console.log('━'.repeat(60));

    if (!purchase && user && course) {
      console.log('\n💡 SOLUTION:');
      console.log('   The user needs to purchase this course first.');
      console.log('\n   Option 1: Use the UI to purchase the course');
      console.log('   Option 2: Create a test purchase with this SQL:\n');
      console.log(`   INSERT INTO "Purchase" ("id", "userId", "courseId", "stripeSessionId", "createdAt")`);
      console.log(`   VALUES (`);
      console.log(`     gen_random_uuid(),`);
      console.log(`     '${userId}',`);
      console.log(`     '${courseId}',`);
      console.log(`     'test_session_' || gen_random_uuid(),`);
      console.log(`     NOW()`);
      console.log(`   );\n`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const userId = process.argv[2];
const courseId = process.argv[3];

if (!userId || !courseId) {
  console.error('❌ Usage: node debug-purchase.js <userId> <courseId>');
  console.error('\nExample:');
  console.error('  node debug-purchase.js "user-123" "1d6266c6-fca0-487e-8101-4001e6056332"');
  process.exit(1);
}

debugPurchase(userId, courseId);

