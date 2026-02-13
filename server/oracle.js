const axios = require('axios');

// THE RESONANCE NODES (From U.A.C.I. Section 6)
const NODES = {
    MARKET_ALPHA: 'https://www.zillow.com', // Just checking connectivity
    MARKET_BETA: 'https://www.realtor.com'
};

async function oraclePulse() {
    const report = {
        timestamp: new Date(),
        nodes: []
    };

    console.log("📡 ORACLE: Initiating Resonance Check...");

    // We cycle through the nodes
    for (const [name, url] of Object.entries(NODES)) {
        try {
            // "The Gentle Knock" - Just a HEAD request to see if they are alive
            const start = Date.now();
            await axios.head(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });
            const latency = Date.now() - start;

            console.log(`✅ ${name}: ONLINE (${latency}ms)`);
            report.nodes.push({ name, status: 'ONLINE', latency });

        } catch (error) {
            console.log(`⚠️ ${name}: BLOCKED/OFFLINE (${error.message})`);
            report.nodes.push({ name, status: 'OFFLINE', error: error.message });
        }
    }

    return report;
}

module.exports = { oraclePulse };
