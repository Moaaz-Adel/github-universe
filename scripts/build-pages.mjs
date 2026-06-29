import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const apiDir = join(root, "src", "app", "api");
const disabledApiDir = join(root, "src", "app", "_api-disabled");

if (existsSync(disabledApiDir)) {
  console.error(
    "Cannot build Pages export while src/app/_api-disabled exists.",
  );
  process.exit(1);
}

const hasApiDir = existsSync(apiDir);
let status = 1;

try {
  if (hasApiDir) {
    renameSync(apiDir, disabledApiDir);
  }

  const result = spawnSync("pnpm", ["build"], {
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_GITHUB_PAGES: "true",
    },
    stdio: "inherit",
  });

  status = result.status ?? 1;
} finally {
  if (hasApiDir && existsSync(disabledApiDir)) {
    renameSync(disabledApiDir, apiDir);
  }
}

process.exit(status);
