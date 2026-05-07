// supabase client config
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("WARNING: supabase env vars not set. check .env file");
}

const supabase = createClient(supabaseUrl || "http://localhost", supabaseKey || "key");

module.exports = supabase;
