import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const SHARED_SECRET = process.env.TURN_SHARED_SECRET;
const TURN_HOST = process.env.TURN_HOST || process.env.NEXT_PUBLIC_TURN_HOST || "localhost";
const TTL = Number(process.env.TURN_CREDENTIAL_TTL || 600);

if (!SHARED_SECRET) {
    console.log("TURN_SHARED_SECRET not configured.");
    process.exit(1);
}

const userId = "jarvis";
const expiry = Math.floor(Date.now() / 1000) + TTL;
const username = `${expiry}:${userId}`;

const credential = crypto
    .createHmac("sha1", String(SHARED_SECRET))
    .update(username)
    .digest("base64");

console.log(JSON.stringify({
    username,
    credential,
    ttl: TTL,
    urls: [`turn:${TURN_HOST}:3478`, `turn:${TURN_HOST}:3478?transport=tcp`],
}, null, 2));
