
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createEstimatesBucket() {
  const { error } = await supabase.storage.createBucket('estimates', {
    public: true, // or false for private
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: 20 * 1024 * 1024 // 20MB
  });
  if (error) {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Bucket "estimates" created successfully!');
  }
}

createEstimatesBucket();