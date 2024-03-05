import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { load } from "https://deno.land/std@0.218.0/dotenv/mod.ts";

const env = await load();

export const supabase = createClient(env.DATABASE_URL, env.ANON)


