import fs from "node:fs";
import path from "node:path";

const customDomain = process.env.CUSTOM_DOMAIN?.trim();
if (!customDomain) {
  process.exit(0);
}

const outputDirectory = path.join(process.cwd(), "out");
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "CNAME"), `${customDomain}\n`);
