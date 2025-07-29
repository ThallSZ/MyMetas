import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://tpswemjkcvrtehuzbfcm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwc3dlbWprY3ZydGVodXpiZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTQ1MjYsImV4cCI6MjA2OTMzMDUyNn0.AzeuhxAl7xxjWmXUkHIi4ngnSHDgLoPyAHIEw2zlKPI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    ...(Platform.OS !== 'web' && { storage: AsyncStorage }),
  },
});