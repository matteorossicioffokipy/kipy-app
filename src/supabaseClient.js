import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tisfpjvwmkzbwedpuoww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpc2ZwanZ3bWt6YndlZHB1b3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTkwNzIsImV4cCI6MjA5MjE3NTA3Mn0.Mv_0KxpRqwTbKceom8dRNCRW5WVWnFd1b2YuqW-rSPQ'; // deve essere la stringa lunga copiata prima

export const supabase = createClient(supabaseUrl, supabaseKey);