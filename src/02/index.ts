import { sumReducer } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = '8';
const EX1_DAT = `
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
`;
/*
 * only 12 red cubes, 13 green cubes, and 14 blue cubes
 */
const CUBES = { r: 12, g: 13, b: 14 } as const;

const parser = (data: string) => {
    const gameStrings = data.split(`\n`).filter(Boolean);

    const games: Record<string, Array<Set<string>>> = {};
    gameStrings.forEach((gs) => {
        const [id, bags] = gs
            .split(':')
            .filter(Boolean)
            .map((s) => s.trim());

        games[parseInt(id.replaceAll(/[\D]/g, ''), 10)] = bags
            .replaceAll(/(lue|ed|reen)/g, '')
            .split(';')
            .map((g) => {
                const game = {};
                const parts = g
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .reduce((map, p) => {
                        const [amount, color] = p.split(' ');
                        map[color] = parseInt(amount, 10);
                        return map;
                    }, {});
                return parts;
            });
    });
    // console.log(games);
    return games;
};

const one = async (data: string): Promise<Res> => {
    const games = parser(data);
    // console.log(games);
    const possibleGames = Object.entries(games)
        .map(([id, game]) => {
            const isNotPossible = game.some((bag) => {
                return bag.r > CUBES.r || bag.g > CUBES.g || bag.b > CUBES.b;
            });
            if (isNotPossible) {
                return null;
            }
            return parseInt(id, 10);
        })
        .filter(Boolean);

    return possibleGames.reduce(sumReducer, 0);
};

const EX2_RES = '2286';
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const games = parser(data);

    const listOfBags = Object.values(games);

    const minsPerGame = listOfBags.map((bags) => {
        return bags.reduce(
            (max, bag) => {
                max.r = bag.r > max.r ? bag.r : max.r;
                max.g = bag.g > max.g ? bag.g : max.g;
                max.b = bag.b > max.b ? bag.b : max.b;
                return max;
            },
            { r: 0, g: 0, b: 0 }
        );
    });

    const powers = minsPerGame.map(({ r, g, b }) => r * g * b);

    return powers.reduce(sumReducer, 0);
};

export const run = async (day: string) => {
    const data = await prepare(day);

    if (!EX1_RES || !EX1_DAT) {
        console.error('Part 1 not ready yet');
        return;
    }

    const EX1_SOL = await one(EX1_DAT);

    if (EX1_SOL != EX1_RES) {
        const msg = `Part 1 failed!\nExpected: ${EX1_RES} - Received: ${EX1_SOL}`;
        console.error(msg);
        return;
    }

    console.log('PART 1:', await one(data));

    if (!EX2_RES || !EX2_DAT) {
        console.error('Part 2 not ready yet');
        return;
    }

    const EX2_SOL = await two(EX2_DAT);

    if (EX2_SOL != EX2_RES) {
        const msg = `Part 2 failed!\nExpected: ${EX2_RES} - Received: ${EX2_SOL}`;
        console.error(msg);
        return;
    }

    console.log('PART 2:', await two(data));

    console.log(`DONE: 🎉`);

    process.exit(0);
};
