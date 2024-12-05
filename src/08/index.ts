import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { lcm } from 'mathjs';
//
// const EX1_RES = '2';
// const EX1_DAT = `RL
//
// AAA = (BBB, CCC)
// BBB = (DDD, EEE)
// CCC = (ZZZ, GGG)
// DDD = (DDD, DDD)
// EEE = (EEE, EEE)
// GGG = (GGG, GGG)
// ZZZ = (ZZZ, ZZZ)
// `;
const EX1_RES = '6';
const EX1_DAT = `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)
`;
type Node = string;
type Cmd = 'L' | 'R';
const parser = (data: string): [Cmd[], Record<Node, { L: Node; R: Node }>] => {
    const [cmds, map] = data.split('\n\n').map((s) => s.trim());

    const graph = map
        .split('\n')
        .map((line) => line.split(' = '))
        .reduce(
            (adj, [key, lr]) => {
                const [L, R] = lr.replaceAll(/[^\s|\w]/g, '').split(' ');
                adj[key] = { L, R };
                return adj;
            },
            {} as Record<Node, { L: Node; R: Node }>
        );
    return [cmds.split('') as Cmd[], graph];
};

const one = async (data: string): Promise<Res> => {
    const [cmds, graph] = parser(data);

    let steps = 0;
    let current: string = 'AAA';

    while (current !== 'ZZZ') {
        const idx = steps % cmds.length;
        steps++;
        current = graph[current][cmds[idx]];
    }
    return steps;
};

const EX2_RES = '6';
const EX2_DAT = `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`;

const two = async (data: string): Promise<Res> => {
    const [cmds, graph] = parser(data);
    const startingNodes = Object.keys(graph).filter((key) => key.match('A$'));

    const currentNodes = [...startingNodes];

    const stepsToEndNode = currentNodes.map((node) => {
        //   ^?
        let current = node;
        let steps = 0;

        while (!current.match('Z$')) {
            const idx = steps % cmds.length;
            steps++;
            current = graph[current][cmds[idx]];
        }

        return steps;
    });

    return lcm(...stepsToEndNode);
    //      ^?
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
