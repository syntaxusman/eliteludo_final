import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Daily reward amounts ───────────────────────────────────────────────────────

const REWARDS = [100, 150, 200, 300, 400, 500, 1000]; // Day 1-7 amounts

// ── Handler ─────────────────────────────────────────────────────────────────────

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401, headers: cors });
  }

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resolve caller identity
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await anon.auth.getUser();
  if (authErr || !user) {
    return new Response("Unauthorized", { status: 401, headers: cors });
  }

  // Fetch daily reward record
  const { data: daily, error: dailyErr } = await svc
    .from("daily_rewards")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (dailyErr || !daily) {
    return new Response("Daily reward record not found", { status: 404, headers: cors });
  }

  // Check if already collected today
  const now = new Date();
  const lastCollected = daily.last_collected_at ? new Date(daily.last_collected_at) : null;
  const isSameDay =
    lastCollected &&
    lastCollected.getFullYear() === now.getFullYear() &&
    lastCollected.getMonth() === now.getMonth() &&
    lastCollected.getDate() === now.getDate();

  if (isSameDay) {
    return new Response(
      JSON.stringify({
        success: false,
        reason: "already_collected",
        nextAvailable: getNextAvailableTime(),
      }),
      { status: 409, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  // Check if streak is broken (more than 24 hours since last collection)
  let streakActive = daily.streak_active;
  if (lastCollected) {
    const hoursSince = (now.getTime() - lastCollected.getTime()) / (1000 * 60 * 60);
    if (hoursSince > 48) {
      streakActive = false;
    }
  }

  // Determine reward for the current visible day, then store the next day.
  let dayNumber = daily.day_number;
  if (!streakActive) {
    dayNumber = 1; // Reset to day 1
  }
  const rewardAmount = REWARDS[dayNumber - 1];
  const nextDayNumber = dayNumber >= 7 ? 7 : dayNumber + 1;

  // Update daily rewards
  const { error: updateErr } = await svc
    .from("daily_rewards")
    .update({
      day_number: nextDayNumber,
      last_collected_at: now.toISOString(),
      streak_active: true,
    })
    .eq("user_id", user.id);

  if (updateErr) {
    return new Response("Failed to update daily rewards", { status: 500, headers: cors });
  }

  // Add coins to profile
  const { data: profile, error: profileErr } = await svc
    .from("profiles")
    .select("coins")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    return new Response("Profile not found", { status: 404, headers: cors });
  }

  const nextBalance = profile.coins + rewardAmount;
  const { error: coinsErr } = await svc
    .from("profiles")
    .update({ coins: nextBalance })
    .eq("id", user.id);

  if (coinsErr) {
    return new Response("Failed to add coins", { status: 500, headers: cors });
  }

  // Record transaction
  const { error: txErr } = await svc.from("transactions").insert({
    user_id: user.id,
    type: "daily_reward",
    amount: rewardAmount,
    currency: "coins",
    metadata: { day_number: dayNumber, streak_reset: !streakActive },
  });

  if (txErr) {
    console.error("Failed to record transaction:", txErr);
  }

  return new Response(
    JSON.stringify({
      success: true,
      dayNumber,
      rewardAmount,
      balance: nextBalance,
      streakActive: true,
      nextAvailable: getNextAvailableTime(),
    }),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});

function getNextAvailableTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
