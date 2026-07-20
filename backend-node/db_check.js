import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

async function run() {
  const { data, error } = await supabase.from('safira_investigations').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    data.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: ${row.title}`);
      console.log(`Analysis items: ${row.analysis?.length || 0}`);
      console.log(`Root Cause items: ${row.root_cause?.length || 0}`);
      if (row.root_cause) {
        row.root_cause.forEach((rc, i) => {
          console.log(`  rc[${i}] (length ${rc.length}): ${rc.slice(0, 60)}...`);
        });
      }
      console.log('---');
    });
  }
}
run();
