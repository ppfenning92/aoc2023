import { Queue } from 'typescript-collections';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

// const EX1_RES = 32_000_000;
// const EX1_DAT = `broadcaster -> a, b, c
// %a -> b
// %b -> c
// %c -> inv
// &inv -> a
// `;
const EX1_RES = 11_687_500;
const EX1_DAT = `broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`;

type Pulse = 'low' | 'high';

type Module = {
    type: 'FlipFlop' | 'Conjunction' | 'Broadcast' | 'Dummy';
    name: string;
    destination: { mod: Module }[];
};

class FlipFlop implements Module {
    public readonly type = 'FlipFlop';
    public destination: { mod: Module }[] = [];
    public state: 0 | 1 = 0;

    constructor(public readonly name: string) {}
}

class Broadcast implements Module {
    public readonly type = 'Broadcast';
    public readonly destination: { mod: Module }[] = [];
    constructor(public readonly name: string) {}
}

class Dummy implements Module {
    public readonly type = 'Dummy';
    public destination: { mod: Module }[] = [];
    constructor(public readonly name: string) {}
}
class Conjunction implements Module {
    public readonly type = 'Conjunction';
    public destination: { mod: Module }[] = [];
    public state = new Map<string, Pulse>();

    constructor(public readonly name: string) {}
}

const parse = (data: string) => {
    const mods: { [key: string]: Module } = {};

    const mods_conns = data
        .trim()
        .split('\n')
        .map((line) => {
            return line.split('->').map((s) => s.trim());
        });

    for (const [module] of mods_conns) {
        const modName = module.replace(/\W/g, '');
        if (module.startsWith('%')) {
            mods[modName] = new FlipFlop(modName);
        }
        if (module.startsWith('&')) {
            mods[modName] = new Conjunction(modName);
        }

        if (!module.startsWith('%') && !module.startsWith('&') && module === 'broadcaster') {
            mods[modName] = new Broadcast(modName);
        }
    }

    for (const [module, conn] of mods_conns) {
        const mod = mods[module.replace(/\W/g, '')];
        for (const destination of conn.split(',')) {
            const dest = destination.trim();
            // console.log('dest', dest);

            let destMod: Module | undefined;

            if (dest in mods) {
                destMod = mods[dest];
            } else {
                mods[dest] = new Dummy(dest);
                destMod = mods[dest];
                // throw new Error(`Module ${dest} not found`);
            }
            mod.destination.push({ mod: destMod, ...('mem' in destMod ? { mem: 'low' } : {}) });
        }
    }

    return mods;
};

class Counter {
    low = 0;
    high = 0;

    public count(input: Pulse) {
        if (input === 'low') {
            this.low++;
        }
        if (input === 'high') {
            this.high++;
        }
    }
}

const isBroadcast = (mod: Module): mod is Broadcast => mod.type === 'Broadcast';
const isFlipFlop = (mod: Module): mod is FlipFlop => mod.type === 'FlipFlop';
const isConjunction = (mod: Module): mod is Conjunction => mod.type === 'Conjunction';
const isDummy = (mod: Module): mod is Dummy => mod.type === 'Dummy';

const one = async (data: string): Promise<Res> => {
    const mods = parse(data);
    // console.log(mods);
    const queue = new Queue<{ mod: string; pulse: Pulse; from: string }>();
    const emit = (origin: string, pulse: Pulse, from: string) => {
        COUNTER?.count(pulse);

        const emitter = mods[origin];

        if (isBroadcast(emitter)) {
            for (const { mod } of emitter.destination) {
                console.log('emit', origin, pulse, mod.name);
                queue.add({ mod: mod.name, pulse, from: emitter.name });
            }
        }
        if (isFlipFlop(emitter)) {
            if (pulse === 'high') {
                return;
            }
            const output = emitter.state === 0 ? 'high' : 'low';
            emitter.state = emitter.state === 0 ? 1 : 0;

            for (const { mod } of emitter.destination) {
                console.log('emit', origin, output, mod.name);
                queue.add({ mod: mod.name, pulse: output, from: emitter.name });
            }
        }

        if (isConjunction(emitter)) {
            emitter.state.set(from, pulse);
            // console.log('state', emitter.state);
            console.log('------------------------ state', emitter.name, from, emitter.state, pulse);

            const output = [...emitter.state.values()].every((p) => p === 'high') ? 'low' : 'high';

            for (const { mod } of emitter.destination) {
                console.log('emit', origin, output, mod.name);
                queue.add({ mod: mod.name, pulse: output, from: emitter.name });
            }
        }

        if (isDummy(emitter)) {
            return;
        }
    };
    const COUNTER = new Counter();

    for (let i = 0; i < 1; i++) {
        queue.add({ from: 'button', mod: 'broadcaster', pulse: 'low' });

        while (!queue.isEmpty()) {
            const { mod, pulse, from } = queue.dequeue()!;
            emit(mod, pulse, from);
        }
    }
    console.log(COUNTER);
    return COUNTER.low * COUNTER.high;
};

const EX2_RES = '';
const EX2_DAT = '';

const two = async (data: string): Promise<Res> => {
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
