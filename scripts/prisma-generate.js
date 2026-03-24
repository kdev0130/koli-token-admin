const { existsSync } = require('fs');
const { spawnSync } = require('child_process');

const candidates = ['prisma/schema.prisma', 'schema.prisma'];
const schemaPath = candidates.find((path) => existsSync(path));

if (!schemaPath) {
  console.error('Prisma schema not found. Checked:', candidates.join(', '));
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', 'generate', `--schema=${schemaPath}`], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
