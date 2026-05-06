import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RequestBody {
  matchId: string;
  winnerUserId: string;
  loserUserId?: string;
  entryFee: number;
}

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

  let body: RequestBody;
  try {
    body = await req.json();
    if (!body.matchId || !body.winnerUserId || typeof body.entryFee !== "number") {
      throw new Error();
    }
  } catch {
    return new Response("Invalid request body", { status: 400, headers: cors });
  }

  const { matchId, winnerUserId, loserUserId, entryFee } = body;

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resolve caller identity (must be service role or match participant)
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await anon.auth.getUser();
  if (authErr || !user) {
    return new Response("Unauthorized", { status: 401, headers: cors });
  }

  // Verify match exists and is finished
  const { data: match, error: matchErr } = await svc
    .from("matches")
    .select("id, status, entry_fee, prize_pool")
    .eq("id", matchId)
    .single();

  if (matchErr || !match) {
    return new Response("Match not found", { status: 404, headers: cors });
  }

  if (match.status !== "finished") {
    return new Response("Match not finished", { status: 409, headers: cors });
  }

  // Calculate prize: winner gets entry fee * 2 (their fee + opponent's fee)
  const prize = entryFee * 2;

  // Award coins to winner
  const { data: winnerProfile, error: winnerErr } = await svc
    .from("profiles")
    .select("id, coins, wins")
    .eq("id", winnerUserId)
    .single();

  if (winnerErr || !winnerProfile) {
    return new Response("Winner profile not found", { status: 404, headers: cors });
  }

  const { error: updateWinnerErr } = await svc
    .from("profiles")
    .update({
      coins: winnerProfile.coins + prize,
      wins: winnerProfile.wins + 1,
    })
    .eq("id", winnerUserId);

  if (updateWinnerErr) {
    return new Response("Failed to award winner", { status: 500, headers: cors });
  }

  // Record winner transaction
  const { error: winnerTxErr } = await svc.from("transactions").insert({
    user_id: winnerUserId,
    type: "match_win",
    amount: prize,
    currency: "coins",
    metadata: { match_id: matchId, entry_fee: entryFee },
  });

  if (winnerTxErr) {
    console.error("Failed to record winner transaction:", winnerTxErr);
  }

  // Update loser stats if provided
  if (loserUserId) {
    const { data: loserProfile, error: loserErr } = await svc
      .from("profiles")
      .select("id, losses")
      .eq("id", loserUserId)
      .single();

    if (!loserErr && loserProfile) {
      const { error: updateLoserErr } = await svc
        .from("profiles")
        .update({ losses: loserProfile.losses + 1 })
        .eq("id", loserUserId);

      if (updateLoserErr) {
        console.error("Failed to update loser stats:", updateLoserErr);
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      winnerUserId,
      prize,
      winnerNewBalance: winnerProfile.coins + prize,
    }),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});
