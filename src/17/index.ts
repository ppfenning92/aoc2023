import { PriorityQueue, Stack } from 'typescript-collections';
import { parseMatrix, toInt } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = '102';
const EX1_DAT = `
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533
`;
type Node = {
    x: number;
    y: number;
    direction: number;
    straightSteps: number;
    heatLoss: number;
    path: string[];
};

function dijkstraHeatLoss(grid: number[][]): [number, string[]] {
    const rows = grid.length;
    const cols = grid[0].length;

    const start: Node = {
        x: 0,
        y: 0,
        direction: 0,
        straightSteps: 0,
        heatLoss: 0,
        path: ['(0, 0)'],
    };
    const end: Node = {
        x: rows - 1,
        y: cols - 1,
        direction: -1,
        straightSteps: -1,
        heatLoss: 0,
        path: [],
    };

    const pq: [number, Node][] = [[start.heatLoss, start]];
    const visited = new Set<string>();

    while (pq.length > 0) {
        pq.sort((a, b) => a[0] - b[0]);
        const [_, currentNode] = pq.shift()!;

        if (currentNode.x === end.x && currentNode.y === end.y) {
            return [currentNode.heatLoss, currentNode.path];
        }

        for (const turn of [-1, 0, 1]) {
            // Skip if turning back in the opposite direction
            if (currentNode.straightSteps >= 3) continue;

            const newDirection = (currentNode.direction + turn + 4) % 4;
            const newStraightSteps = turn === 0 ? currentNode.straightSteps + 1 : 1;

            const dx = newDirection === 1 ? 1 : newDirection === 3 ? -1 : 0;
            const dy = newDirection === 0 ? 1 : newDirection === 2 ? -1 : 0;

            const newX = currentNode.x + dx;
            const newY = currentNode.y + dy;

            if (newX < 0 || newX >= rows || newY < 0 || newY >= cols) continue;

            const newHeatLoss = currentNode.heatLoss + grid[newX][newY];
            const newNodeId = `${newX},${newY},${newDirection}`;

            if (!visited.has(newNodeId)) {
                const newPath = [...currentNode.path, `(${newX}, ${newY})`];
                pq.push([
                    newHeatLoss,
                    {
                        x: newX,
                        y: newY,
                        direction: newDirection,
                        straightSteps: newStraightSteps,
                        heatLoss: newHeatLoss,
                        path: newPath,
                    },
                ]);
                visited.add(newNodeId);
            }
        }
    }

    return [Infinity, []]; // If no path is found
}
const one = async (data: string): Promise<Res> => {
    const city = parseMatrix(data) as string[][];

    const [res, path] = dijkstraHeatLoss(city.map((row) => row.map(toInt)));
    console.log(path);
    // minus last
    //
    if (res <= 1225 || res >= 1295) {
        return [res, 'nope...'];
    }
    // 1263
    console.log(res);

    return res; //.reduce((acc, node) => acc + node.weight, 0).toString();
};
`
2>>34^>>>1323
32v>>>35v5623
32552456v>>54
3446585845v52
4546657867v>6
14385987984v4
44578769877v6
36378779796v>
465496798688v
456467998645v
12246868655<v
25465488877v5
43226746555v>
`;
const EX2_RES = '';
const EX2_DAT = '';

const two = async (data: string): Promise<Res> => {
    console.log(data);

    return '';
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
    } else {
        console.log('TEST 1:', EX1_SOL);
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
