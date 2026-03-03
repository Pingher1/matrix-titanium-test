#!/usr/bin/env node
// collect_project_snapshot_json.js
// Usage: node collect_project_snapshot_json.js /path/to/project [--include-node-modules]
// Produces: /tmp/project_snapshot_<timestamp>.json
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

function nowTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
}

function safeRead(filePath, maxLines = 200) {
    try {
        const s = fs.readFileSync(filePath, "utf8");
        const lines = s.split(/\r?\n/).slice(0, maxLines);
        return lines.join("\n");
    } catch (e) {
        return null;
    }
}

function redactEnv(content) {
    if (!content) return null;
    return content
        .split(/\r?\n/)
        .map(line => {
            if (/^\s*#/.test(line) || !/=/.test(line)) return line;
            const key = line.split("=")[0];
            return `${key}=<REDACTED>`;
        })
        .join("\n");
}

function run(cmd) {
    try { return execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] }).toString().trim(); }
    catch (e) { return null; }
}

async function main() {
    const argv = process.argv.slice(2);
    const projectDir = argv[0] || ".";
    const includeNodeModules = argv.includes("--include-node-modules");

    const out = {
        snapshotGeneratedAt: new Date().toISOString(),
        host: run("hostname -f") || run("hostname") || null,
        cwd: path.resolve(projectDir),
        user: run("whoami") || null,
        nodeVersion: run("node -v") || null,
        npmVersion: run("npm -v") || null,
        yarnVersion: run("yarn -v") || null,
        git: {},
        duTop: null,
        treeDirsDepth3: [],
        envRedacted: {},
        samples: {},
        filesFound: [],
    };

    // Git info 
    const gitDir = path.join(projectDir, ".git");
    if (fs.existsSync(gitDir)) {
        out.git.head = run(`git -C ${projectDir} rev-parse HEAD`);
        out.git.branch = run(`git -C ${projectDir} rev-parse --abbrev-ref HEAD`);
        out.git.status = run(`git -C ${projectDir} status --porcelain`);
        out.git.lastCommits = run(`git -C ${projectDir} --no-pager log -n10 --pretty=format:"%H | %an | %ad | %s" --date=iso`);
    } else {
        out.git = null;
    }

    // du summary (best-effort)
    out.duTop = run(`du -sh ${projectDir}/* 2>/dev/null | sort -h | head -n50`) || null;

    // directory tree depth3 
    const findDirs = run(`cd ${projectDir} && find . -maxdepth 3 -type d -printf "%p\\n" 2>/dev/null | sed 's|^\\./||'`) || "";
    out.treeDirsDepth3 = findDirs.split(/\r?\n/).filter(Boolean);

    // Redact .env files 
    const files = fs.readdirSync(projectDir);
    for (const f of files) {
        if (f.startsWith(".env")) {
            const content = safeRead(path.join(projectDir, f), 300);
            out.envRedacted[f] = redactEnv(content);
        }
    }

    // Copy sample files (first200 lines)
    const sampleList = [
        "server/src/index.ts",
        "server/src/index.js",
        "client/package.json",
        "server/package.json",
        "client/src/App.tsx",
        "client/src/main.tsx",
        "SMYTHOS_NOTES.md",
        "NOTES.md",
        "README.md",
    ];

    for (const s of sampleList) {
        const full = path.join(projectDir, s);
        if (fs.existsSync(full)) {
            out.samples[s] = safeRead(full, 300);
            out.filesFound.push(s);
        }
    }

    // Capture top-level package.json if exists 
    const pkg = path.join(projectDir, "package.json");
    if (fs.existsSync(pkg)) {
        try {
            const pj = JSON.parse(fs.readFileSync(pkg, "utf8"));
            // remove big/sensitive bits if present 
            delete pj.private;
            out.rootPackageJson = pj;
        } catch (e) { out.rootPackageJson = null; }
    }

    // Optionally include node_modules size or flag 
    if (!includeNodeModules) {
        out.nodeModulesIncluded = false;
    } else {
        out.nodeModulesIncluded = true;
        out.nodeModulesSize = run(`du -sh ${path.join(projectDir, "node_modules")} 2>/dev/null | awk '{print $1}'`) || null;
    }

    // Save to JSON 
    const timestamp = nowTimestamp();
    const outPath = `/tmp/project_snapshot_${timestamp}.json`;
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
    // compute SHA256 
    const fileBuf = fs.readFileSync(outPath);
    const hash = crypto.createHash("sha256").update(fileBuf).digest("hex");
    console.log(`Snapshot written to ${outPath}`);
    console.log(`SHA256: ${hash}`);
    process.exit(0);
}

main().catch(e => { console.error("Snapshot failed:", e); process.exit(1); });
