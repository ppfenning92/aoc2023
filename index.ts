import minimist from "minimist";

const args = minimist(Bun.argv.slice(2), { string: ["day"] });

const PATH = `./src/${args["day"]}`;
const loadModule = async () => {
  try {
    console.log("loading module", PATH);

    return await import(PATH);
  } catch (e) {
    console.error("Cannot load module.");
    throw e;
  }
};

const { run } = await loadModule();
console.log(`
Run #${new Date().getTime()} ...
            `);
await run(args["day"]);

console.log(`
###########################
            `);
