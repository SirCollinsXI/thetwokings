import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MIN_SCORE_MS = 1_000;
const MAX_SCORE_MS = 3_600_000;
const MAX_AVATAR_LENGTH = 150_000;
const MAX_BODY_BYTES = 200_000;

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}
function text(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}
function validUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function validAvatar(value: unknown) {
  if (typeof value !== "string" || value.length > MAX_AVATAR_LENGTH || !value.startsWith("data:image/png;base64,")) return false;
  return /^[A-Za-z0-9+/]*={0,2}$/.test(value.slice("data:image/png;base64,".length));
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ success: false, message: "Methode nicht erlaubt." }, 405);
  try {
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > MAX_BODY_BYTES) return response({ success: false, message: "Anfrage zu groß." }, 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return response({ success: false, message: "Anfrage zu groß." }, 413);
    const body = JSON.parse(raw);
    const name = text(body.name, 15) || "Anonym";
    const comment = text(body.comment, 120);
    const score = Math.round(Number(body.score));
    const levelsCompleted = Number(body.levelsCompleted);
    const sessionId = body.sessionId;
    const started = Date.parse(String(body.sessionStartedAt ?? ""));
    const clientVersion = text(body.clientVersion, 20);
    const gameType = text(body.gameType, 10);
    if (!['bogen', 'trex'].includes(gameType)) return response({ success: false, message: 'Ungültiger Spieltyp.' }, 400);
    if (!validUuid(sessionId)) return response({ success: false, message: "Ungültige Spielsession." }, 400);
    if (!Number.isFinite(score) || score < MIN_SCORE_MS || score > MAX_SCORE_MS) return response({ success: false, message: "Unplausible Spielzeit." }, 400);
    if (levelsCompleted !== 10) return response({ success: false, message: "Kampagne nicht vollständig." }, 400);
    if (!validAvatar(body.avatarDataUrl)) return response({ success: false, message: "Avatar ungültig oder zu groß." }, 400);
    if (!Number.isFinite(started)) return response({ success: false, message: "Ungültiger Session-Start." }, 400);
    const realElapsed = Date.now() - started;
    if (realElapsed < 1_000 || realElapsed > 6 * 60 * 60 * 1_000) return response({ success: false, message: "Sessiondauer nicht plausibel." }, 400);
    // Gemeldete Spielzeit darf nicht weit über der echten Sessiondauer liegen. 3-s-Strafen erzeugen bewusst Toleranz.
    if (score > realElapsed + 30 * 60 * 1_000) return response({ success: false, message: "Spielzeit nicht plausibel." }, 400);
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return response({ success: false, message: "Serverkonfiguration fehlerhaft." }, 500);
    const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.from("leaderboard").insert({ name, score, avatarDataUrl: body.avatarDataUrl, comment, session_id: sessionId, completed_at: new Date().toISOString(), client_version: clientVersion, verified: true, game_type: gameType });
    if (error) {
      if (error.code === "23505") return response({ success: false, message: "Diese Spielsession wurde bereits gespeichert." }, 409);
      console.error(error); return response({ success: false, message: "Score konnte nicht gespeichert werden." }, 500);
    }
    return response({ success: true, message: "Score gespeichert." });
  } catch (error) {
    console.error(error); return response({ success: false, message: "Anfrage konnte nicht verarbeitet werden." }, 400);
  }
});
