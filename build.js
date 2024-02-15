import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "fs";
import fsExtra from "fs-extra";

const DIST_DIR = "./dist";
const ADDONS_DIR = "./src/addons";
const STATIC_FILES_DIR = "./src/static";
const ADDONS_OUTPUT_DIR = `${DIST_DIR}/addons`;
const METAS_OUTPUT = `${DIST_DIR}/addons.json`;

const metas = [];

async function build() {
  if (existsSync(DIST_DIR)) {
    rmSync(DIST_DIR, { recursive: true });
    console.log(`Deleted existing ${DIST_DIR} directory`);
  }
  mkdirSync(DIST_DIR);
  mkdirSync(ADDONS_OUTPUT_DIR);

  const addonFiles = readdirRecursively(ADDONS_DIR).filter(f => f.endsWith(".js"));
  for (const file of addonFiles) {
    const addon = await import(file);
    const innerPath = file.replace(`${ADDONS_DIR}/`, "");
    if (!addon.data && !addon.build) throw Error(`${innerPath}: No data or build method specified!`);
    const outputPath = `${ADDONS_OUTPUT_DIR}/${replaceExtension(innerPath, "js", "json")}`;
    const builder = new AddonBuilder({
      ...addon.data,
      path: outputPath.slice(DIST_DIR.length, outputPath.length)
    });
    addon.build?.(builder);
    metas.push(builder.getMetaJSON());
    writeFileSync(outputPath, JSON.stringify(builder.getJSON()));
    console.log(`Built addon: ${innerPath}`);
  }

  writeFileSync(
    METAS_OUTPUT,
    JSON.stringify(metas)
  );
  console.log(`Added metadata of ${metas.length} addons in ${METAS_OUTPUT}`);

  let copiedStaticFiles = 0;
  fsExtra.copySync(STATIC_FILES_DIR, DIST_DIR, { filter: (_src, dst) => {
    if (existsSync(dst) && lstatSync(dst).isFile()) {
      console.error(`${dst} already exists, can't copy static file!`);
      return false;
    }
    copiedStaticFiles++;
    return true;
  } });
  console.log(`Copied ${copiedStaticFiles} static files`);
}
build();

// Utils

function readdirRecursively(path) {
  let files = [];
  readdirSync(path).forEach(file => {
    const absolute = `${path}/${file}`;
    if (statSync(absolute).isDirectory()) files = files.concat(
    readdirRecursively(absolute)
    );
    else files.push(absolute);
  });
  return files;
}

function replaceExtension(name, currentExtension, newExtension) {
  if (!name.endsWith(currentExtension)) return name;
  const withoutExtension = name.slice(0, -(currentExtension.length));
  return withoutExtension+newExtension;
}

// Addon builder class

const ADDON_META_FIELDS = [
  "name",
  "description",
  "thumbnail",
  "authors",
  "path"
];

class AddonBuilder {
  #json = {};

  constructor(initialJSON) {
    if (!initialJSON?.path) throw Error("AddonBuilder needs to be constructed with a 'path' field in json.");
    this.applyJSON(initialJSON);
  }

  applyJSON(newJSON) {
    this.#json = {
      ...this.#json,
      ...newJSON
    }
  }

  setName(name) {
    this.#json.name = name;
  }

  setDescription(description) {
    this.#json.description = description;
  }

  setThumbnail(thumbnail) {
    this.#json.thumbnail = thumbnail;
  }

  setAuthors(authors) {
    this.#json.authors = [].concat(authors);
  }

  getMetaJSON() {
    const metaEntries = Object.entries(this.#json).filter(
      ([key]) => ADDON_META_FIELDS.includes(key)
    );
    return Object.fromEntries(metaEntries);
  }

  getJSON() {
    const copy = { ...this.#json }
    delete copy.path;
    return copy;
  }
}