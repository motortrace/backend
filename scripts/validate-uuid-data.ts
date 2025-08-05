import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function validateUuidData() {
  console.log('🔍 Validating UUID data before migration...');

  try {
    // Check UserProfile.supabaseUserId values
    console.log('\nChecking UserProfile.supabaseUserId values...');
    const userProfiles = await prisma.userProfile.findMany({
      select: { id: true, supabaseUserId: true }
    });

    const invalidUserProfiles = userProfiles.filter(
      profile => !UUID_REGEX.test(profile.supabaseUserId)
    );

    if (invalidUserProfiles.length > 0) {
      console.error('❌ Found invalid UUID values in UserProfile.supabaseUserId:');
      invalidUserProfiles.forEach(profile => {
        console.error(`  - ID: ${profile.id}, supabaseUserId: ${profile.supabaseUserId}`);
      });
      throw new Error('Invalid UUID values found in UserProfile.supabaseUserId');
    } else {
      console.log(`✅ All ${userProfiles.length} UserProfile.supabaseUserId values are valid UUIDs`);
    }

    // Check StaffMember.supabaseUserId values
    console.log('\nChecking StaffMember.supabaseUserId values...');
    const staffMembers = await prisma.staffMember.findMany({
      select: { id: true, supabaseUserId: true }
    });

    const invalidStaffMembers = staffMembers.filter(
      staff => !UUID_REGEX.test(staff.supabaseUserId)
    );

    if (invalidStaffMembers.length > 0) {
      console.error('❌ Found invalid UUID values in StaffMember.supabaseUserId:');
      invalidStaffMembers.forEach(staff => {
        console.error(`  - ID: ${staff.id}, supabaseUserId: ${staff.supabaseUserId}`);
      });
      throw new Error('Invalid UUID values found in StaffMember.supabaseUserId');
    } else {
      console.log(`✅ All ${staffMembers.length} StaffMember.supabaseUserId values are valid UUIDs`);
    }

    // Check if auth.users table exists and has UUID type for id column
    console.log('\nChecking auth.users table structure...');
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'id'
      `;
      
      if (Array.isArray(result) && result.length > 0) {
        const columnInfo = result[0] as any;
        console.log(`✅ auth.users.id column type: ${columnInfo.data_type}`);
        
        if (columnInfo.data_type !== 'uuid') {
          console.warn('⚠️  Warning: auth.users.id is not UUID type. This might cause issues.');
        }
      } else {
        console.warn('⚠️  Could not verify auth.users.id column type');
      }
    } catch (error) {
      console.warn('⚠️  Could not check auth.users table structure (this is normal for Supabase)');
    }

    console.log('\n🎉 UUID validation completed successfully!');
    console.log('✅ All supabaseUserId values are valid UUIDs');
    console.log('✅ Ready to proceed with migration');

  } catch (error) {
    console.error('❌ UUID validation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation if called directly
if (require.main === module) {
  validateUuidData()
    .then(() => {
      console.log('Validation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export { validateUuidData }; 