import { demoBackend } from './demo-backend';
import { supabaseBackend } from './supabase-backend';
import type { Backend } from './types';

// Connected when both Supabase values are set at build time (board/.env locally, repository
// variables on GitHub). Without them the app runs as a demo saved in the browser.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const backend: Backend = url && key ? supabaseBackend(url, key) : demoBackend();
