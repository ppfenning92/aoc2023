export const prepare = async (day: string): Promise<string> => {
  const path = `./src/${day}/input.txt`;
  try {
    return await Bun.file(path).text();
  } catch (e) {
    console.warn("challenge not found, trying to download");
  }

  const aoc_token = process.env["AOC_TOKEN"];

  if (!aoc_token) {
    throw new Error('Please export your "AOC_TOKEN".');
  }
  return await fetch(
    `https://adventofcode.com/2023/day/${parseInt(day, 10)}/input`,
    { headers: { cookie: `session=${aoc_token}` } },
  ).then(async (res) => {
    const text = await res.text();
    Bun.write(path, text);
    return text;
  });
};
