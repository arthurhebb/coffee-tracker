import { createClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/pushover";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("coffee_logs")
    .insert({
      drink_type: body.drink_type,
      size: body.size,
      caffeine_mg: body.caffeine_mg,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Check today's total caffeine
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayLogs } = await supabase
    .from("coffee_logs")
    .select("caffeine_mg")
    .gte("logged_at", today.toISOString());

  const totalCaffeine = (todayLogs ?? []).reduce(
    (sum, log) => sum + log.caffeine_mg,
    0
  );

  // Notify at key thresholds
  if (totalCaffeine >= 400) {
    await sendPushNotification(
      "Caffeine Limit Reached!",
      `You've hit ${totalCaffeine}mg today. The FDA recommends staying under 400mg. Maybe switch to water?`,
      1
    );
  } else if (totalCaffeine >= 300) {
    await sendPushNotification(
      "Getting Close...",
      `${totalCaffeine}mg so far today. You're ${400 - totalCaffeine}mg away from the daily limit.`
    );
  }

  return Response.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("coffee_logs")
    .delete()
    .eq("id", parseInt(id));

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
