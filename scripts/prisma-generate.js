const { existsSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const candidates = [];
for (let depth = 0; depth <= 3; depth += 1) {
  const base = path.resolve(process.cwd(), '../'.repeat(depth));
  candidates.push(path.join(base, 'prisma', 'schema.prisma'));
  candidates.push(path.join(base, 'schema.prisma'));
}

const schemaPath = candidates.find((candidate) => existsSync(candidate));

if (!schemaPath) {
  console.error('Prisma schema not found. Checked:', candidates.join(', '));
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', 'generate', `--schema=${schemaPath}`], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
