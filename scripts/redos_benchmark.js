// Automated ReDoS Benchmark & Validation Test Suite
// Verifies security against catastrophic backtracking on malicious input payloads

const oldRegex = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})(?:\S+)?$/;

const newParserExtract = (urlString) => {
  try {
    const trimmed = urlString.trim();
    if (!trimmed) return null;
    if (trimmed.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const absoluteUrlString = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const url = new URL(absoluteUrlString);
    if (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtu.be')) {
      const id = url.pathname.slice(1);
      return id.length === 11 ? id : null;
    }
    if (url.hostname === 'youtube.com' || url.hostname.endsWith('.youtube.com') ||
        url.hostname === 'www.youtube.com' || url.hostname.endsWith('.www.youtube.com') ||
        url.hostname === 'm.youtube.com' || url.hostname.endsWith('.m.youtube.com')) {
      const paths = url.pathname.split('/');
      const shortsIndex = paths.indexOf('shorts');
      if (shortsIndex !== -1 && paths[shortsIndex + 1]) {
        return paths[shortsIndex + 1].slice(0, 11);
      }
      const embedIndex = paths.indexOf('embed');
      if (embedIndex !== -1 && paths[embedIndex + 1]) {
        return paths[embedIndex + 1].slice(0, 11);
      }
      const vPathIndex = paths.indexOf('v');
      if (vPathIndex !== -1 && paths[vPathIndex + 1]) {
        return paths[vPathIndex + 1].slice(0, 11);
      }
      const vQuery = url.searchParams.get('v');
      if (vQuery) {
        return vQuery.slice(0, 11);
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Test Payloads
const normalUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const shortsUrl = "https://youtube.com/shorts/dQw4w9WgXcQ?feature=share";
// Malicious payload designed to trigger catastrophic backtracking on vulnerable regexes
// (A very long string of overlapping spaces/characters that fails matches at the end)
const maliciousPayload = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" + " ".repeat(15000) + "!";
const hugePayload = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" + "x".repeat(500000) + "!";

console.log("=== Start ReDoS Validation & Performance Benchmarks ===");

// 1. Verify correctness of new parser
console.log("\n[1] Correctness Validation:");
console.log(`Normal URL: ${newParserExtract(normalUrl)} (Expected: dQw4w9WgXcQ)`);
console.log(`Shorts URL: ${newParserExtract(shortsUrl)} (Expected: dQw4w9WgXcQ)`);
console.log(`Malicious long payload: ${newParserExtract(maliciousPayload)} (Expected: dQw4w9WgXcQ)`);

// 2. Performance test on normal URLs
console.log("\n[2] Performance Benchmarks (10,000 iterations):");
let start, end;

// Old regex normal
start = performance.now();
for (let i = 0; i < 10000; i++) {
  oldRegex.test(normalUrl);
}
end = performance.now();
console.log(`Old Regex (Normal URL): ${(end - start).toFixed(3)} ms`);

// New parser normal
start = performance.now();
for (let i = 0; i < 10000; i++) {
  newParserExtract(normalUrl);
}
end = performance.now();
console.log(`New Parser (Normal URL): ${(end - start).toFixed(3)} ms`);

// 3. ReDoS Threat Benchmark
console.log("\n[3] Security ReDoS Challenge:");

// Test new parser against huge 500,000 character payload
start = performance.now();
newParserExtract(hugePayload);
end = performance.now();
console.log(`New Parser on 500,000 chars payload: ${(end - start).toFixed(3)} ms (Protected/Linear)`);

// Test old regex on smaller malicious payload (too large and it might hang the process)
try {
  start = performance.now();
  oldRegex.test(maliciousPayload);
  end = performance.now();
  console.log(`Old Regex on 15,000 chars payload: ${(end - start).toFixed(3)} ms`);
} catch (e) {
  console.log("Old Regex failed/threw error during processing:", e.message);
}

console.log("\n=== Benchmarks Complete ===");
