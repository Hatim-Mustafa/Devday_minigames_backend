const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

const connectDB = async () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      'Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
    process.exit(1);
  }

  console.log('Supabase connected');
};

module.exports = { connectDB, supabase };
