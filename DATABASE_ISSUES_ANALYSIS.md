# Database Issues & Fake Values Analysis

## 🔍 **Fake/Mock Values Found:**

### **1. Google Authentication (MOCK)**
**Location:** `src/modules/auth/supabase/authSupabase.controller.ts`
```typescript
// ❌ CURRENTLY USING MOCK DATA
const mockUser = {
  id: `google-${Date.now()}`,
  email: 'google-user@example.com',
  role: role,
  isRegistrationComplete: false
};
const mockToken = 'mock-jwt-token';
```

### **2. User Management (PLACEHOLDER)**
**Location:** `src/modules/users/users.controller.ts`
```typescript
// ❌ PLACEHOLDER DATA
users: [] // Placeholder for actual user data
user: null // Placeholder for actual user data
```

### **3. Onboarding (NOT SAVING TO DB)**
**Location:** `src/modules/auth/supabase/authSupabase.controller.ts`
```typescript
// ❌ NOT SAVING TO DATABASE
// TODO: Save onboarding data to Prisma database
// For now, just return success
```

## 🗄️ **Database Schema Issues:**

### **Problem: Two Separate Databases**

**Current Setup:**
- **Supabase Database** → `SUPABASE_URL` (auth.users table only)
- **Prisma Database** → `DATABASE_URL` (business tables)

**Issue:** Your Prisma schema is not applied to Supabase's database!

### **Where Business Roles Are Stored:**

**Currently:** Nowhere! The roles are only in Supabase's `user_metadata` but not in your business database.

**Should be:** In the `UserProfile` table in your business database.

## 🔧 **Solutions:**

### **Option 1: Use Supabase Database for Everything (Recommended)**

**Step 1: Update Environment Variables**
```bash
# Remove these from .env
# DATABASE_URL=...
# DIRECT_URL=...

# Keep only Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Step 2: Update Prisma Schema**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("SUPABASE_URL").replace("https://", "postgresql://postgres:postgres@").replace(".supabase.co", ".supabase.co:5432/postgres")
  directUrl = env("SUPABASE_URL").replace("https://", "postgresql://postgres:postgres@").replace(".supabase.co", ".supabase.co:5432/postgres")
}
```

**Step 3: Add UserProfile Model**
```prisma
model UserProfile {
  id             String        @id @default(cuid())
  supabaseUserId String        @unique // Links to auth.users.id
  email          String        @unique
  name           String?
  phone          String?
  role           UserRole       @default(CUSTOMER)
  profileImage   String?
  isRegistrationComplete Boolean @default(false)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

### **Option 2: Keep Separate Databases**

**Step 1: Update Prisma Schema**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Step 2: Sync Roles Between Databases**
- Store roles in both Supabase `user_metadata` AND Prisma `UserProfile`
- Keep them in sync with triggers or application logic

## 🚀 **Implementation Steps:**

### **1. Set Up Database**
```bash
# Run the setup script
npx ts-node scripts/setup-database.ts
```

### **2. Fix Google Authentication**
Replace mock Google auth with real Supabase Google OAuth:
```typescript
// In authSupabase.service.ts
async signInWithGoogle(idToken: string, role?: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  // ... real implementation
}
```

### **3. Implement Real User Management**
```typescript
// In users.controller.ts
export async function getUsers(req: AuthenticatedRequest, res: Response) {
  const users = await prisma.userProfile.findMany({
    include: { vehicles: true, workOrders: true }
  });
  res.json({ users });
}
```

### **4. Save Onboarding Data**
```typescript
// In authSupabase.controller.ts
const userProfile = await prisma.userProfile.upsert({
  where: { supabaseUserId: req.user.id },
  update: { name, phone: contact, isRegistrationComplete: true },
  create: { supabaseUserId: req.user.id, email: req.user.email, name, phone: contact }
});
```

## 📊 **Database Structure After Fix:**

```
Supabase Database:
├── auth.users (authentication)
│   ├── id
│   ├── email
│   └── user_metadata.role
│
└── public.* (business tables)
    ├── UserProfile
    ├── Customer
    ├── Vehicle
    ├── WorkOrder
    └── ...
```

## 🔍 **Where to Find Business Roles:**

**After the fix:**
1. **Supabase Dashboard** → Authentication → Users → user_metadata.role
2. **Database** → public.UserProfile.role
3. **API Response** → /auth/me endpoint

## ⚠️ **Important Notes:**

1. **Backup your data** before running schema changes
2. **Test in development** first
3. **Update your mobile app** to handle the new response format
4. **Migrate existing users** to the new UserProfile table

## 🎯 **Next Steps:**

1. **Choose your database strategy** (Option 1 or 2)
2. **Run the setup script** to apply schema changes
3. **Test the onboarding flow** with real database storage
4. **Implement real Google authentication**
5. **Update user management** to use real data 