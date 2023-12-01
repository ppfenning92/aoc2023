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

const data = await Bun.file(`${PATH}/input.txt`).text();
const { one, two } = await loadModule();

console.log("Part 1");
await one();
await one(data);

console.log("Part 2");
await two();
await two(data);
