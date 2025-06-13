import { copyFile, mkdir, readdir, rm, writeFile } from "fs/promises";

const ADDONS_DIR = "./addons";
const STATIC_DIR = "./static";
const OUTPUT_DIR = "./dist";
const META_FILE = `${OUTPUT_DIR}/all`;

const fields = [
  "meta"
];

const metas = [];

main();

async function main() {
  try {
    await rm(OUTPUT_DIR, { recursive: true });
  } catch {}
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  const files = (await readdir(ADDONS_DIR)).filter(file => file.endsWith(".js"));
  
  for (const file of files) {
    const id = file.substring(0, file.length-3);
    const mdl = await import(`${ADDONS_DIR}/${file}`);
    const addon = mdl.default ? await resolve(mdl.default) : {};
    for (const field of fields) {
      const resolved = await resolve(mdl[field]);
      if (resolved || resolved === false) addon[field] = resolved;
    }
    metas.push(addon.meta);
    const targetDir = `${OUTPUT_DIR}/${id}`;
    await writeFile(targetDir, JSON.stringify(addon));
    console.log(`Successfully built: ${addon.meta.name} (${id})`);
  }
  
  await writeFile(META_FILE, JSON.stringify(metas));
  console.log(`Successfully built meta file at ${META_FILE}`);
  
  await copyDirContent(STATIC_DIR, OUTPUT_DIR);
  console.log("Successfully copied static files");
}

async function resolve(obj) {
  if (obj && typeof obj === "function") return await obj();
  else return obj;
}

async function copyDirContent(dir, targetDir) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const src = `${dir}/${file.name}`;
    const target = `${targetDir}/${file.name}`;
    if (file.isDirectory()) {
      await mkdir(target, { recursive: true });
      await copyDirContent(src, target);
    } else {
      await copyFile(src, target);
    }
  }
}