import { createClient } from "@supabase/supabase-js";

// These values were recovered verbatim from the deployed JS bundle
// (assets/index-6Mhln4o0.js). The URL and the JWT below are the Supabase
// *anon* public key — role: "anon" in its payload — which Supabase and
// Bolt.new are designed to ship inside client bundles; it is meant to be
// public and is protected by the project's Row Level Security policies on
// the server side, not by secrecy. No service-role key or other private
// credential was found anywhere in the public bundle.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://0ec90b57d6e95fcbda19832f.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
