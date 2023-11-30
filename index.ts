import minimist from "minimist";

const args = minimist(Bun.argv.slice(2), { string: ["day"] });

const loadModule = async () => {
  try {
    const path = `./src/${args["day"]}`;
    console.log("loading module", path);

    return await import(path);
  } catch (e) {
    console.error("Cannot load module.");
    throw e;
  }
};

const { one, two } = await loadModule();

console.log("Part 1");
await one();

console.log("Part 2");
await two();
