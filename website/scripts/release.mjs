import './render.mjs';
await import('./package-offline.mjs');
await import('./check-content.mjs');
console.log('Offline candidate ready: index.html and the single-file exhibition were rebuilt; content checks passed.');
console.log('This command does not update dist/ or run TypeScript and unit tests. For deployment, run pnpm test and pnpm build, then pnpm package and pnpm check:content; review and stage only the intended changes before committing and tagging.');
