import { createClient } from '@supabase/supabase-js';

// Configura tu cliente de Supabase
const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SECRET || '';

export const supabase = createClient(url, key);
