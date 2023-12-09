import { execSync } from 'child_process';

export const prepare = async (day: string): Promise<string> => {
    const path = `./src/${day}/input.txt`;
    try {
        return await Bun.file(path).text();
    } catch (e) {
        console.warn('challenge not found, trying to download');
    }

    const aoc_token_raw = process.env['AOC_TOKEN'];
    const aoc_token = aoc_token_raw?.startsWith('op://')
        ? execSync(`op read "${aoc_token_raw}"`)
        : aoc_token_raw;
    if (!aoc_token) {
        throw new Error('Please export your "AOC_TOKEN".');
    }
    return await fetch(`https://adventofcode.com/2023/day/${parseInt(day, 10)}/input`, {
        headers: { cookie: `session=${aoc_token}` },
    }).then(async (res) => {
        if (res.status !== 200) {
            console.error('Cannot download challenge data.');
            console.warn(await res.text());
            process.exit(1);
        }
        const text = await res.text();
        Bun.write(path, text);
        return text;
    });
};
