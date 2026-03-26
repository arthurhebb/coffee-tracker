import { createClient } from "@/lib/supabase/server";
import CoffeeTracker from "@/components/CoffeeTracker";

export default async function Home() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayLogs } = await supabase
    .from("coffee_logs")
    .select("*")
    .gte("logged_at", today.toISOString())
    .order("logged_at", { ascending: false });

  const { data: weekLogs } = await supabase
    .from("coffee_logs")
    .select("*")
    .gte("logged_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("logged_at", { ascending: false });

  return <CoffeeTracker todayLogs={todayLogs ?? []} weekLogs={weekLogs ?? []} />;
}
