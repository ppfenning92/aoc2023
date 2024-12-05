type Node = {
    x: number;
    y: number;
    direction: number;
    straightSteps: number;
};

function dijkstraHeatLoss(grid: string[]): number {
    const rows = grid.length;
    const cols = grid[0].length;

    const start: Node = { x: 0, y: 0, direction: 0, straightSteps: 1 }; // Start at top-left, direction right
    const end: Node = { x: rows - 1, y: cols - 1, direction: -1, straightSteps: -1 }; // End at bottom-right

    // Priority queue
    const pq: [number, Node][] = [[0, start]];
    const visited = new Set<string>();

    while (pq.length > 0) {
        pq.sort((a, b) => a[0] - b[0]); // Sort by heat loss
        const [heatLoss, node] = pq.shift()!;

        const nodeId = `${node.x},${node.y},${node.direction}`;
        if (visited.has(nodeId) || node.x < 0 || node.x >= rows || node.y < 0 || node.y >= cols) {
            continue;
        }

        visited.add(nodeId);

        if (node.x === end.x && node.y === end.y) {
            return heatLoss;
        }

        for (const turn of [-1, 0, 1]) {
            const newDirection = (node.direction + turn + 4) % 4;
            const newStraightSteps = turn === 0 ? node.straightSteps + 1 : 1;
            if (newStraightSteps <= 3) {
                const dx = newDirection === 1 ? 1 : newDirection === 3 ? -1 : 0;
                const dy = newDirection === 0 ? 1 : newDirection === 2 ? -1 : 0;

                const newX = node.x + dx;
                const newY = node.y + dy;
                if (newX >= 0 && newX < rows && newY >= 0 && newY < cols) {
                    const newHeatLoss = heatLoss + parseInt(grid[newX][newY], 10);
                    pq.push([
                        newHeatLoss,
                        {
                            x: newX,
                            y: newY,
                            direction: newDirection,
                            straightSteps: newStraightSteps,
                        },
                    ]);
                }
            }
        }
    }

    return Infinity; // If no path is found
}

// Example usage
const grid = [
    '2413432311323',
    '3215453535623',
    '3255245654254',
    '3446585845452',
    '4546657867536',
    '1438598798454',
    '4457876987766',
    '3637877979653',
    '4654967986887',
    '4564679986453',
    '1224686865563',
    '2546548887735',
    '4322674655533',
];

console.log(dijkstraHeatLoss(grid));
