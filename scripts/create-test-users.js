import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key. Make sure to run this script with --env-file=.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
  { email: 'admin@aura.ai', password: 'AuraAdmin2026!', role: 'Admin' },
  { email: 'pro@aura.ai', password: 'AuraPro2026!', role: 'Pro User' },
  { email: 'test@aura.ai', password: 'AuraTest2026!', role: 'Basic User' }
];

async function createUsers() {
  console.log("🚀 Starting Test User Creation...");

  for (const user of testUsers) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (error) {
      if (error.message.includes('User already registered') || error.status === 400) {
         console.log(`✅ ${user.role} (${user.email}) already exists.`);
      } else {
         console.error(`❌ Failed to create ${user.role} (${user.email}):`, error.message);
      }
    } else {
      console.log(`✅ Successfully created ${user.role}: ${user.email}`);
    }
  }

  console.log("🎉 Test users setup complete!");
}

createUsers();
