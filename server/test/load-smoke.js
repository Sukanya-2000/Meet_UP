const base = process.env.LOAD_BASE_URL || 'http://127.0.0.1:5000'; const requests = Number(process.env.LOAD_REQUESTS || 200);
const started = performance.now(); let failures = 0;
await Promise.all(Array.from({ length: requests }, async () => { try { const response = await fetch(`${base}/api/health`); if (!response.ok) failures += 1; } catch { failures += 1; } }));
const duration = performance.now() - started; console.log(JSON.stringify({ requests, failures, durationMs: Math.round(duration), requestsPerSecond: Math.round(requests / (duration / 1000)) })); if (failures) process.exit(1);
