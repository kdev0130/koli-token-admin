const { existsSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const candidates = [];
for (let depth = 0; depth <= 3; depth += 1) {
  const base = path.resolve(process.cwd(), '../'.repeat(depth));
  candidates.push(path.join(base, 'prisma', 'schema.prisma'));
  candidates.push(path.join(base, 'schema.prisma'));
}

let schemaPath = candidates.find((candidate) => existsSync(candidate));

if (!schemaPath) {
  const cwd = process.cwd();
  const prismaDir = path.join(cwd, 'prisma');
  if (existsSync(prismaDir)) {
    const prismaFiles = readdirSync(prismaDir);
    if (prismaFiles.includes('schema.prisma')) {
      schemaPath = path.join(prismaDir, 'schema.prisma');
    }
  }
}

if (!schemaPath) {
  console.error('Prisma schema not found. Checked:', candidates.join(', '));
  try {
    const cwd = process.cwd();
    console.error('Current working directory:', cwd);
    console.error('CWD contents:', readdirSync(cwd));
    const prismaDir = path.join(cwd, 'prisma');
    if (existsSync(prismaDir)) {
      console.error('Prisma dir contents:', readdirSync(prismaDir));
    }
  } catch (error) {
    console.error('Debug listing failed:', error && error.message ? error.message : String(error));
  }
  process.exit(1);
}

const cwdSchemaPath = path.join(process.cwd(), 'schema.prisma');
try {
  const schemaContents = readFileSync(schemaPath, 'utf8');
  writeFileSync(cwdSchemaPath, schemaContents, 'utf8');
} catch (error) {
  console.error('Failed to copy Prisma schema to CWD:', error && error.message ? error.message : String(error));
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', 'generate', `--schema=${cwdSchemaPath}`], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
