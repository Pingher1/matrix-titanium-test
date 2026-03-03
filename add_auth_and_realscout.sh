#!/usr/bin/env bash
# add_auth_and_realscout.sh
# Adds RealScout onboarding + passcode login, Puppeteer fallback, and Kronos publish script
# Usage: ./add_auth_and_realscout.sh [PROJECT_ROOT]
# Example: ./add_auth_and_realscout.sh /smythfs/<team>/<project>/avatar-creator

set -euo pipefail

PROJECT_ROOT="${1:-.}"
echo "Project root:" "$PROJECT_ROOT"

if [ ! -d "$PROJECT_ROOT" ]; then
  echo "Project root does not exist: $PROJECT_ROOT"
  exit 1
fi

# Helper: write file
write() {
  local path="$1"; shift
  mkdir -p "$(dirname "$path")"
  cat > "$path" <<'EOF'
EOF
}

echo "Creating client and server files..."

# 1) Client: LoginSplash.tsx
mkdir -p "$PROJECT_ROOT/src/components"
cat > "$PROJECT_ROOT/src/components/LoginSplash.tsx" <<'LOGIN'
import React from "react";
import StageScene from "./StageScene"; // optional: replace with your AvatarCanvas or StageScene component

export default function LoginSplash() {
 const realScoutOnboard = () => {
 const callback = encodeURIComponent(`${window.location.origin}/auth/realscout/callback`);
 // RealScout onboarding link — if their form accepts a return_url param 
 const url = `https://therichardsonteam.realscout.com/onboarding?return_url=${callback}`;
 window.open(url, "_blank");
 };

 return (
 <div style={{width:"100vw", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(180deg,#02030a,#0b1020)"}}>
 <div style={{maxWidth:1100, width:"100%", display:"flex", gap:24}}>
 <div style={{flex:1, color:"white", padding:24}}>
 <h1 style={{fontSize:48, margin:0}}>KRONOS Creator Hub</h1>
 <p style={{opacity:0.85}}>Create avatars, stories, and experiences — link your RealScout onboarding for seamless registration.</p>
 <div style={{marginTop:24, display:"flex", gap:12}}>
 <button onClick={realScoutOnboard} style={{padding:"12px 20px", borderRadius:10, background:"#ff5aa2", color:"white", border:"none"}}>Register with RealScout</button>
 <a href="/signup" style={{padding:"12px 20px", borderRadius:10, background:"#2f8cff", color:"white", textDecoration:"none"}}>Create Local Account</a>
 </div>
 </div>
 <div style={{flex:"0 0 520px", height:420, borderRadius:16, overflow:"hidden", background:"#111"}}>
 <StageScene />
 </div>
 </div>
 </div>
 );
}
LOGIN

# 2) Client: PasscodeModal.tsx
cat > "$PROJECT_ROOT/src/components/PasscodeModal.tsx" <<'PASS'
import React, { useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function PasscodeModal({ onClose, email }: { onClose: ()=>void; email?: string }) {
 const [pass1, setPass1] = useState("");
 const [pass2, setPass2] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const submit = async () => {
 setError("");
 if (!pass1 || pass1.length < 4) { setError("Passcode too short"); return; }
 if (pass1 !== pass2) { setError("Passcodes do not match"); return; }
 setLoading(true);
 try {
 const res = await apiFetch("/auth/passcode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: pass1 }) });
 const j = await res.json();
 if (!j.ok) throw new Error(j.error || "failed");
 onClose();
 } catch (err:any) {
 setError(String(err.message || err));
 } finally { setLoading(false); }
 };

 return (
 <div style={{position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.6)"}}>
 <div style={{background:"#fff", padding:24, borderRadius:8, width:420}}>
 <h3>Set a passcode</h3>
 <p>Choose a 4-12 digit passcode to use for quick login.</p>
 <input type="password" value={pass1} onChange={(e)=>setPass1(e.target.value)} placeholder="Enter passcode" style={{width:"100%", padding:8, marginBottom:8}} />
 <input type="password" value={pass2} onChange={(e)=>setPass2(e.target.value)} placeholder="Confirm passcode" style={{width:"100%", padding:8, marginBottom:12}} />
 {error && <div style={{color:"red", marginBottom:8}}>{error}</div>}
 <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
 <button onClick={onClose}>Cancel</button>
 <button onClick={submit} disabled={loading} style={{background:"#2f8cff", color:"#fff"}}>{loading? "Saving..." : "Save Passcode"}</button>
 </div>
 </div>
 </div>
 );
}
PASS

# 3) Client: apiClient (wrapper using sessionStorage API key)
mkdir -p "$PROJECT_ROOT/src/lib"
cat > "$PROJECT_ROOT/src/lib/apiClient.ts" <<'API'
export function getApiKey(): string | null {
 return sessionStorage.getItem("kronos_api_key") || null;
}

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
 const apiKey = getApiKey();
 const headers = new Headers(init?.headers || {});
 if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);
 const combined = { ...init, headers };
 return fetch(input, combined);
}
API

# 4) Server: auth routes & user service stubs
mkdir -p "$PROJECT_ROOT/server/src/auth"
mkdir -p "$PROJECT_ROOT/server/src/user"

cat > "$PROJECT_ROOT/server/src/auth/realscoutCallback.ts" <<'CB'
import { Router } from "express";
import jwt from "jsonwebtoken";
import { createOrLinkUser } from "../user/userService";

const router = Router();

/**
 * RealScout callback:
 * Example: GET /auth/realscout/callback?status=ok&email=user@example.com 
 * If RealScout supports returning user email or token, use it; otherwise use Puppeteer fallback.
 */
router.get("/auth/realscout/callback", async (req, res) => {
 try {
 const { status, email } = req.query;
 if (String(status || "") !== "ok" || !email) {
 return res.redirect("/login?error=rs_failed");
 }
 const user = await createOrLinkUser({ email: String(email), source: "realscout" });
 const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
 res.cookie("session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
 return res.redirect("/dashboard");
 } catch (err) {
 console.error("realscout callback error", err);
 return res.redirect("/login?error=server");
 }
});

export default router;
CB

cat > "$PROJECT_ROOT/server/src/auth/passcode.ts" <<'PASSV'
import { Router } from "express";
import bcrypt from "bcrypt";
import { saveUserPasscode, findUserById } from "../user/userService";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/auth/passcode", requireAuth, async (req, res) => {
 try {
 const userId = (req as any).user.id;
 const { passcode } = req.body;
 if (!passcode || String(passcode).length < 4) return res.status(400).json({ ok: false, error: "invalid_passcode" });
 const hash = await bcrypt.hash(String(passcode), 12);
 await saveUserPasscode(userId, hash);
 res.json({ ok: true });
 } catch (err) {
 console.error("passcode save error", err);
 res.status(500).json({ ok: false, error: "server_error" });
 }
});

router.post("/auth/passcode-login", async (req, res) => {
 try {
 const { email, passcode } = req.body;
 if (!email || !passcode) return res.status(400).json({ ok: false, error: "missing" });
 const user = await findUserById(email);
 if (!user) return res.status(404).json({ ok: false, error: "no_user" });
 const valid = await bcrypt.compare(String(passcode), user.passcode_hash || "");
 if (!valid) return res.status(401).json({ ok: false, error: "invalid" });
 const token = require("jsonwebtoken").sign({ sub: user.id }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
 res.cookie("session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
 res.json({ ok: true });
 } catch (err) {
 console.error("passcode login error", err);
 res.status(500).json({ ok: false, error: "server_error" });
 }
});

export default router;
PASSV

# 5) Server: userService stubs (Postgres-ready)
cat > "$PROJECT_ROOT/server/src/user/userService.ts" <<'USR'
/*
 userService - simple DB stub implementations.
 Replace with Postgres/ORM (knex/TypeORM/Sequelize) in production.
*/

import fs from "fs";
import path from "path";
const DATA = path.join(process.cwd(), "..", "server", "data", "users.json");

// helpers
function read() {
 try { return JSON.parse(fs.readFileSync(DATA, "utf8")); } catch (e) { return { users: [] }; }
}
function write(obj:any) { fs.mkdirSync(path.dirname(DATA), { recursive: true }); fs.writeFileSync(DATA, JSON.stringify(obj, null, 2)); }

export async function createOrLinkUser({ email, source }: { email:string; source:string }) {
 const db = read();
 let u = db.users.find((x:any) => x.email === email);
 if (!u) {
 u = { id: `u_${Date.now()}`, email, source, createdAt: new Date().toISOString() };
 db.users.push(u);
 write(db);
 }
 return u;
}

export async function saveUserPasscode(userId: string, hash: string) {
 const db = read();
 const u = db.users.find((x:any) => x.id === userId);
 if (!u) throw new Error("user not found");
 u.passcode_hash = hash;
 u.updatedAt = new Date().toISOString();
 write(db);
 return true;
}

export async function findUserById(emailOrId: string) {
 const db = read();
 let u = db.users.find((x:any) => x.id === emailOrId || x.email === emailOrId);
 return u || null;
}
USR

# 6) Server middleware stub requireAuth (reads cookie JWT)
mkdir -p "$PROJECT_ROOT/server/src/middleware"
cat > "$PROJECT_ROOT/server/src/middleware/auth.ts" <<'AUTH'
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
 const token = req.cookies?.session || req.header("Authorization")?.replace(/^Bearer /, "");
 if (!token) return res.status(401).json({ error: "unauthenticated" });
 try {
 const payload:any = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
 (req as any).user = { id: payload.sub, email: payload.email };
 next();
 } catch (err) {
 return res.status(401).json({ error: "invalid_token" });
 }
}
AUTH

# 7) Puppeteer fallback script
mkdir -p "$PROJECT_ROOT/server/src/automation"
cat > "$PROJECT_ROOT/server/src/automation/realscoutRegister.js" <<'PUPP'
/*
 Puppeteer fallback for RealScout onboarding (use only if no API available).
 WARNING: Use only according to RealScout terms of service.
*/
const puppeteer = require("puppeteer");

async function registerRealScout({ email, firstName, lastName }) {
 const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
 const page = await browser.newPage();
 await page.goto('https://therichardsonteam.realscout.com/onboarding', { waitUntil: 'networkidle2' });
 // NOTE: Replace selectors with actual form inputs 
 try {
 await page.type('input[name="email"]', email);
 await page.type('input[name="first_name"]', firstName);
 await page.type('input[name="last_name"]', lastName);
 await page.click('button[type="submit"]');
 await page.waitForNavigation({ timeout: 20000 });
 const success = await page.$('.success') !== null;
 const screenshot = await page.screenshot();
 await browser.close();
 return { success, screenshot: screenshot.toString('base64') };
 } catch (err) {
 await browser.close();
 throw err;
 }
}

if (require.main === module) {
 const [,, email, firstName, lastName] = process.argv;
 registerRealScout({ email, firstName, lastName }).then(r => {
 console.log("result", r);
 }).catch(err => {
 console.error("error", err);
 });
}

module.exports = { registerRealScout };
PUPP

# 8) Kronos publish helper
cat > "$PROJECT_ROOT/kronos-publish.js" <<'KPUB'
/*
 kronos-publish.js 
 Usage: node kronos-publish.js /path/to/module KRONOS_API_URL KRONOS_API_KEY
*/
const fs = require('fs');
const path = require('path');
const axios = require('axios');
