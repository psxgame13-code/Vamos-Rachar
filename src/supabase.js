import { createClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://jmsdrsgfizmkeiqqujfj.supabase.co";

const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_MeSrPbMJRr019BJNJNxRMQ_yAw9eQVE";

export const supabase = createClient(url, key);