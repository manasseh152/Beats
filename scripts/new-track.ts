import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const [, , folder, ...nameParts] = process.argv;

if (!folder || !["sketches", "wip"].includes(folder)) {
  console.error("Usage: bun run scripts/new-track.ts <sketches|wip> [name]");
  process.exit(1);
}

const rawName = nameParts.join("-") || "untitled";
const safeName = rawName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

let fileName: string;
if (folder === "sketches") {
  const date = new Date().toISOString().slice(0, 10);
  fileName = `${date}-${safeName}.strudel`;
} else {
  fileName = `${safeName}.strudel`;
}

const dir = join("tracks", folder);
await mkdir(dir, { recursive: true });

const filePath = join(dir, fileName);
const absPath = join(process.cwd(), filePath);

const content = `// ${safeName}
// Created: ${new Date().toISOString().slice(0, 10)}

s("bd sd:1 bd [sd:1 hh]")
  .bank("RolandTR909")
  .cpm(90)
`;

await writeFile(filePath, content);
console.log(`Created: ${absPath}`);
