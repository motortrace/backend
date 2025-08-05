import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewAccounts() {
  console.log('👥 Viewing all accounts and their roles...\n');

  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Failed to fetch auth users:', authError);
      return;
    }

    console.log('🔐 SUPABASE AUTH USERS:');
    console.log('========================');
    authUsers.users.forEach(user => {
      const role = user.user_metadata?.role || 'no role';
      const name = user.user_metadata?.name || 'no name';
      console.log(`• ${user.email} (${role})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${name}`);
      console.log(`  Created: ${user.created_at}`);
      console.log('');
    });

    // Get all UserProfiles
    const userProfiles = await prisma.userProfile.findMany();
    console.log('👤 USER PROFILES:');
    console.log('=================');
    userProfiles.forEach(profile => {
      console.log(`• ID: ${profile.id}`);
      console.log(`  SupabaseUserID: ${profile.supabaseUserId}`);
      console.log(`  Name: ${profile.name || 'no name'}`);
      console.log(`  Phone: ${profile.phone || 'no phone'}`);
      console.log(`  Registration Complete: ${profile.isRegistrationComplete}`);
      console.log('');
    });

    // Get all StaffMembers
    const staffMembers = await prisma.staffMember.findMany();
    console.log('👨‍💼 STAFF MEMBERS:');
    console.log('==================');
    staffMembers.forEach(staff => {
      // Find the corresponding auth user to get role
      const authUser = authUsers.users.find(u => u.id === staff.supabaseUserId);
      const role = authUser?.user_metadata?.role || 'unknown role';
      const name = authUser?.user_metadata?.name || 'no name';
      
      console.log(`• ID: ${staff.id}`);
      console.log(`  SupabaseUserID: ${staff.supabaseUserId}`);
      console.log(`  Role: ${role}`);
      console.log(`  Name: ${name}`);
      console.log(`  Created: ${staff.createdAt}`);
      console.log('');
    });

    // Get all Customers
    const customers = await prisma.customer.findMany();
    console.log('👥 CUSTOMERS:');
    console.log('=============');
    customers.forEach(customer => {
      console.log(`• ID: ${customer.id}`);
      console.log(`  UserProfileID: ${customer.userProfileId || 'WALK-IN (no profile)'}`);
      console.log(`  Name: ${customer.name}`);
      console.log(`  Email: ${customer.email || 'no email'}`);
      console.log(`  Phone: ${customer.phone || 'no phone'}`);
      console.log(`  Type: ${customer.userProfileId ? 'APP USER' : 'WALK-IN'}`);
      console.log('');
    });

    console.log('📊 SUMMARY:');
    console.log('============');
    console.log(`• Auth Users: ${authUsers.users.length}`);
    console.log(`• User Profiles: ${userProfiles.length}`);
    console.log(`• Staff Members: ${staffMembers.length}`);
    console.log(`• Customers: ${customers.length}`);

  } catch (error) {
    console.error('❌ Error viewing accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  viewAccounts()
    .then(() => {
      console.log('\n✅ Account viewing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Account viewing failed:', error);
      process.exit(1);
    });
}

export { viewAccounts }; 