import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test accounts for each role
const roleAccounts = [
  {
    email: 'admin@motortrace.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    phone: '+1234567890'
  },
  {
    email: 'manager@motortrace.com',
    password: 'manager123',
    role: 'manager',
    name: 'Service Manager',
    phone: '+1234567891'
  },
  {
    email: 'advisor@motortrace.com',
    password: 'advisor123',
    role: 'service_advisor',
    name: 'Service Advisor',
    phone: '+1234567892'
  },
  {
    email: 'inventory@motortrace.com',
    password: 'inventory123',
    role: 'inventory_manager',
    name: 'Inventory Manager',
    phone: '+1234567893'
  },
  {
    email: 'technician@motortrace.com',
    password: 'tech123',
    role: 'technician',
    name: 'Lead Technician',
    phone: '+1234567894'
  },
  {
    email: 'customer@motortrace.com',
    password: 'customer123',
    role: 'customer',
    name: 'John Customer',
    phone: '+1234567895'
  }
];

async function createRoleAccounts() {
  console.log('👥 Creating role accounts...');

  try {
    // Check if we have Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('📋 Manual Setup Required:');
      console.log('1. Go to Supabase Dashboard → Authentication → Users');
      console.log('2. Create users with these credentials:');
      roleAccounts.forEach(account => {
        console.log(`   • ${account.role.toUpperCase()}: ${account.email} / ${account.password}`);
        console.log(`     Role: ${account.role}, Name: ${account.name}`);
      });
      console.log('\n3. Set SUPABASE_SERVICE_ROLE_KEY environment variable for automatic creation');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    for (const account of roleAccounts) {
      console.log(`\n📝 Creating ${account.role} account: ${account.email}`);

      // Step 1: Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          role: account.role,
          name: account.name,
          phone: account.phone
        }
      });

      if (authError) {
        console.error(`❌ Failed to create auth user for ${account.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user?.id}`);

      // Step 2: Create UserProfile for all users
      const userProfile = await prisma.userProfile.create({
        data: {
          supabaseUserId: authData.user!.id,
          name: account.name,
          phone: account.phone,
          isRegistrationComplete: true
        }
      });

      console.log(`✅ UserProfile created: ${userProfile.id}`);

      // Step 3: Create Customer for customer role
      if (account.role === 'customer') {
        const customer = await prisma.customer.create({
          data: {
            userProfileId: userProfile.id,
            name: account.name,
            phone: account.phone
          }
        });
        console.log(`✅ Customer created: ${customer.id}`);
      }

      // Step 4: Create StaffMember for staff roles
      if (account.role !== 'customer') {
        const staffMember = await prisma.staffMember.create({
          data: {
            supabaseUserId: authData.user!.id
          }
        });
        console.log(`✅ StaffMember created: ${staffMember.id}`);
      }

      console.log(`🎉 ${account.role} account setup complete!`);
    }

    console.log('\n🎉 All role accounts created successfully!');
    console.log('\n📋 Account Summary:');
    roleAccounts.forEach(account => {
      console.log(`  • ${account.role.toUpperCase()}: ${account.email} / ${account.password}`);
    });

  } catch (error) {
    console.error('❌ Failed to create role accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createRoleAccounts()
    .then(() => {
      console.log('\n✅ Role accounts creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Role accounts creation failed:', error);
      process.exit(1);
    });
}

export { createRoleAccounts }; 