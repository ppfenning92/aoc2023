import { Stack } from 'typescript-collections';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { firstRadiationDependencies, re } from 'mathjs';

const EX1_RES = 19114;
const EX1_DAT = `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}
`;

type Category = 'x' | 'm' | 'a' | 's';
type RuleString = `${Category}${Op}${number}:${State | string}` | Name;
const STATES = ['A', 'R'] as const;
type State = (typeof STATES)[number];
type Op = '<' | '>' | '=';

type RatingsString = `{${string}}`;
type RatingString = `${Category}=${number}`;

type Rule =
    | {
          category: Category;
          op: Op;
          value: number;
          next: State | string;
      }
    | { next: State | string };

type Condition = {
    category: Category;
    op: Op;
    value: number;
};
type Workflow = Record<string, Rule[]>;
type Rating = Record<Category, number>;

const parse = (data: string): [Rating[], Workflow] => {
    const [workflowString, ratingsString] = data.trim().split('\n\n');

    const ratings: Rating[] = ratingsString.split('\n').map((line) => {
        const ratingsStrings = (line as RatingsString)
            .replaceAll(/[{}]/g, '')
            .split(',') as RatingString[];
        return ratingsStrings
            .map((ratingString: RatingString) => {
                const [category, valueString] = ratingString.split('=') as [Category, string];
                const value = parseInt(valueString, 10);
                return { category, value };
            })
            .reduce((acc, rating) => ({ ...acc, [rating.category]: rating.value }), {} as Rating);
    });

    const workflow: Workflow = {};
    workflowString.split('\n').forEach((line) => {
        const [name, rulesString] = line.replaceAll(/[{}]/g, ' ').trim().split(' ') as [
            string,
            string,
        ];
        const rules: Rule[] = rulesString.split(',').map((ruleString) => {
            if (!ruleString.includes(':')) {
                return { next: ruleString as State };
            }
            const [_, next] = ruleString.split(':') as [RuleString, State | string];
            const [category, valueString] = ruleString.split(/<|>|=/) as [Category, string];
            const value = parseInt(valueString, 10);
            const op = ruleString.includes('<') ? '<' : ruleString.includes('>') ? '>' : '=';
            return { category, op, value, next };
        });

        workflow[name] = rules;
    });

    return [ratings, workflow];
};

const evaluate = (rating: Rating, category: Category, op: Op, value: number): boolean => {
    switch (op) {
        case '<':
            return rating[category] < value;
        case '>':
            return rating[category] > value;
        case '=':
            return rating[category] === value;
        default:
            throw new Error('Invalid operator');
    }
};
const one = async (data: string): Promise<Res> => {
    const [ratings, workflow] = parse(data) as [Rating[], Workflow];

    const acceptedRatings = ratings
        .map((rating) => {
            let state: State | null = null;

            let rules = workflow['in'];
            if (!rules) {
                throw new Error('No rules for in');
            }

            while (!state) {
                for (const rule of rules) {
                    if (!('op' in rule)) {
                        // simple state
                        if (rule.next === 'A' || rule.next === 'R') {
                            state = rule.next;
                        } else {
                            rules = workflow[rule.next];
                        }
                        break;
                    }

                    const { category, op, value, next } = rule;

                    const check = evaluate(rating, category, op, value);

                    if (check) {
                        if (next === 'A' || next === 'R') {
                            state = next;
                        } else {
                            rules = workflow[next];
                        }
                        break;
                    }
                }
            }
            if (state === 'A') {
                return rating;
            }
        })
        .filter(Boolean);

    return acceptedRatings.reduce((acc, rating) => {
        return acc + rating.x + rating.m + rating.a + rating.s;
    }, 0);
};

const EX2_RES = 167_409_079_868_000;
const EX2_DAT = EX1_DAT;


const findPathsToA = (workflow: Workflow, startKey = 'in', path: Condition[], paths: Condition[][] = []) => {
  const { category, op, value, next: truhy } = workflow[startKey][0] as Rule;
  
  path.push([{ category, op, value }]);

  if (truhy === 'A') {
    paths.push([...path]);
  } else if (workflow[truhy]) {
      findPathsToA(workflow, truhy, path, paths);
  }
    
  
  
  path.pop()
  return paths;


}
const two = async (data: string): Promise<Res> => {
    const workflow = (parse(data) as [Rating[], Workflow])[1];

    let canSimplify = true;
    while (canSimplify) {
        const finalWorkflows = Object.entries(workflow).reduce(
            (acc, [name, rules]) => {
                if (rules.length === 2) {
                    const [rule1, rule2] = rules;
                    if (
                        'op' in rule1 &&
                        !('op' in rule2) &&
                        STATES.includes(rule1.next) &&
                        STATES.includes(rule2.next) &&
                        rule1.next === rule2.next
                    ) {
                        acc[name] = rule1.next;
                    }
                }
                return acc;
            },
            {} as Record<string, State>
        );
        if (Object.keys(finalWorkflows).length === 0) {
            canSimplify = false;
        }

        Object.entries(finalWorkflows).forEach(([name, state]) => {
            Object.values(workflow).forEach((rules) => {
                rules.forEach((rule) => {
                    if ('next' in rule && rule.next === name) {
                        rule.next = state;
                    }
                });
            });

            delete workflow[name];
        });
    }

    // find all paths to state 'A'
    const paths = string[][]
    const stack = new Stack<string[]>();
    stack.push(['in']);

    while (!stack.isEmpty()) {
      
    }


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
