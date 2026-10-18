import './render.mjs';
await import('./package-offline.mjs');
await import('./check-content.mjs');
console.log('Release candidate ready: index.html, dist/ and the single-file exhibition were rebuilt and verified.');
console.log('Next: pnpm test, then git add -A, commit, tag (e.g. v1.0.1) and push --follow-tags.');
