import { Presets, SingleBar } from 'cli-progress';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { printMatrix } from '../utils';
import sharp from 'sharp';
const EX1_RES = '16';
const EX1_DAT = `
...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........
`;
type Rock = '#';
type Garden = '.';

type Map = (Rock | Garden)[][];

const parse = (data: string): { start: [number, number]; map: Map } => {
    const res: { start: [number, number]; map: Map } = { start: [0, 0], map: [] as Map };
    res.map = data
        .trim()
        .split('\n')
        .map(
            (line, rowIdx) =>
                line.split('').map((tile, colIdx) => {
                    if (tile === 'S') {
                        res.start = [rowIdx, colIdx] as [number, number];
                        return '.';
                    }

                    return tile;
                }) as (Rock | Garden)[]
        );

    return res;
};

const isGarden = (tile: Rock | Garden): tile is Garden => tile === '.';

const coordinatesToString = ([row, col]: [number, number]) => `${row}-${col}`;

const one = async (data: string, steps: number): Promise<Res> => {
    const { start, map } = parse(data);

    const currentPossiblePositions = new Set<string>([coordinatesToString(start)]);

    for (let i = 0; i < steps; i++) {
        const newPossiblePositions = new Set<string>();

        currentPossiblePositions.forEach((coordinates) => {
            const [row, col] = coordinates.split('-').map(Number);

            if (isGarden(map[row - 1]?.[col])) {
                newPossiblePositions.add(coordinatesToString([row - 1, col]));
            }

            if (isGarden(map[row + 1]?.[col])) {
                newPossiblePositions.add(coordinatesToString([row + 1, col]));
            }

            if (isGarden(map[row]?.[col - 1])) {
                newPossiblePositions.add(coordinatesToString([row, col - 1]));
            }

            if (isGarden(map[row]?.[col + 1])) {
                newPossiblePositions.add(coordinatesToString([row, col + 1]));
            }
        });

        currentPossiblePositions.clear();
        newPossiblePositions.forEach((pos) => currentPossiblePositions.add(pos));
    }
    for (const coordinates of currentPossiblePositions) {
        const [row, col] = coordinates.split('-').map(Number);
        map[row][col] = '0';
    }
    printMatrix(map);
    return currentPossiblePositions.size.toString();
};

const EX2_DAT = EX1_DAT;

const isRock = (
    [row, col]: [number, number],
    rocks: [number, number][],
    [baseRowCount, baseColCount]: [number, number]
): boolean => {
    const nCol = Math.floor(col / baseColCount);
    const nRow = Math.floor(row / baseRowCount);
    for (const [rockRow, rockCol] of rocks) {
        if (rockCol + nCol * baseColCount === col && rockRow + nRow * baseRowCount === row) {
            return true;
        }
    }
    return false;
};
//           1
// 01234567890
// .....###.#.
//   2        -1       --          1         2         3
// 2109876543210987654321012345678901234567890123456789012
// .....###.#......###.#......###.#......###.#......###.#.
// -17 -6 5 16 27
const two = async (data: string, steps: number, sol?: number): Promise<Res> => {
    const { start, map } = parse(data);
    const input = Uint8Array.from([255, 0, 255, 0, 128, 0]); // or Uint8ClampedArray
    const image = sharp(input, {
        // because the input does not contain its dimensions or how many channels it has
        // we need to specify it in the constructor options
        raw: {
            width: 2,
            height: 1,
            channels: 3,
        },
    });
    await image.toFile('my-two-pixels.png');
    printMatrix(map);
    const mapTimesNine = map.map((row) => [...row, ...row, ...row]);
    mapTimesNine.push(...mapTimesNine, ...mapTimesNine);
    // mapTimesNine.push(...mapTimesNine);
    printMatrix(mapTimesNine);

    await sharp(
        Uint8Array.from(
            mapTimesNine
                .map((row) =>
                    row.map((tile) => {
                        return tile === '#' ? [0, 0, 0, 0.7] : [255, 0, 255, 1];
                    })
                )
                .flat(2)
        ),
        {
            // raw: {
            //     width: mapTimesNine[0].length,
            //     height: mapTimesNine.length,
            //     channels: 4,
            // },
            create: {
                width: mapTimesNine[0].length,
                height: mapTimesNine.length,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 1 },
            },
            // background: { r: 0, g: 0, b: 0 },
        }
    )
        .png()
        .toFile('map.png');
    // const rocks: [number, number][] = [];
    // for (let row = 0; row < map.length; row++) {
    //     for (let col = 0; col < map[row].length; col++) {
    //         if (map[row][col] === '#') {
    //             rocks.push([row, col]);
    //         }
    //     }
    // }
    //
    // let currentPossiblePositions = new Set<string>([coordinatesToString(start)]);
    // const progressBar = new SingleBar(
    //     {
    //         format: '{bar} || {percentage}% | {duration}s | {value}/{total} Steps',
    //     },
    //     Presets.shades_grey
    // );
    //
    // progressBar.start(steps, 0);
    // for (let step = 0; step < steps; step++) {
    //     progressBar.update(step + 1);
    //     const newPossiblePositions = new Set<string>();
    //
    //     for (const coordinates of currentPossiblePositions) {
    //         const [row, col] = coordinates.split('-').map(Number);
    //
    //         for (const [deltaRow, deltaCol] of [
    //             [0, 1],
    //             [1, 0],
    //             [0, -1],
    //             [-1, 0],
    //         ]) {
    //             const newRow = row + deltaRow;
    //             const newCol = col + deltaCol;
    //             if (isRock([newRow, newCol], rocks, [map.length, map[0].length])) {
    //                 continue;
    //             }
    //
    //             newPossiblePositions.add(coordinatesToString([newRow, newCol]));
    //         }
    //     }
    //     currentPossiblePositions = newPossiblePositions;
    // }
    // progressBar.stop();
    // const res = currentPossiblePositions.size;
    //
    // if (sol) {
    //     console.log(`Expected: ${sol} - Received: ${res}`);
    //     return res === sol ? 1 : 0;
    // }
    // return res;
};

export const run = async (day: string) => {
    const data = await prepare(day);

    if (!EX1_RES || !EX1_DAT) {
        console.error('Part 1 not ready yet');
        return;
    }

    const EX1_SOL = await one(EX1_DAT, 6);

    if (EX1_SOL != EX1_RES) {
        const msg = `Part 1 failed!\nExpected: ${EX1_RES} - Received: ${EX1_SOL}`;
        console.error(msg);
        return;
    }

    console.log('PART 1:', await one(data, 64));
    //
    // if (
    //     [
    //         await two(EX2_DAT, 6, 16),
    //         await two(EX2_DAT, 10, 50),
    //         await two(EX2_DAT, 50, 1594),
    //         await two(EX2_DAT, 64, 3722),
    //         await two(EX2_DAT, 100, 6536),
    //         await two(EX2_DAT, 500, 167004),
    //         await two(EX2_DAT, 1000, 668697),
    //         await two(EX2_DAT, 5000, 16733044),
    //     ].some((res) => !res)
    // ) {
    //     const msg = `Part 2 failed!`;
    //     console.error(msg);
    //     return;
    // }

    console.log('PART 2:', await two(data, 26501365));

    console.log(`DONE: 🎉`);

    process.exit(0);
};
