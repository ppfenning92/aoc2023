type CompactTrench = { row: number; col: number }[];

function calculateArea(trench: CompactTrench): number {
    // Determine the bounding box of the shape
    let minRow = Infinity,
        maxRow = -Infinity;
    let minCol = Infinity,
        maxCol = -Infinity;

    for (const point of trench) {
        if (point.row < minRow) minRow = point.row;
        if (point.row > maxRow) maxRow = point.row;
        if (point.col < minCol) minCol = point.col;
        if (point.col > maxCol) maxCol = point.col;
    }

    let totalArea = 0;

    // Iterate through each row within the bounding box
    for (let row = minRow; row <= maxRow; row++) {
        let startCol = -1,
            endCol = -1;

        // Find the start and end columns for each row segment inside the shape
        for (let i = 0; i < trench.length; i++) {
            const current = trench[i];
            const next = trench[(i + 1) % trench.length];

            if ((row >= current.row && row < next.row) || (row >= next.row && row < current.row)) {
                const col = current.col;
                if (startCol === -1 || col < startCol) startCol = col;
                if (endCol === -1 || col > endCol) endCol = col;
            }
        }

        if (startCol !== -1 && endCol !== -1) {
            // Add the number of grid squares in this row segment
            totalArea += endCol - startCol;
        }
    }

    return totalArea;
}

// Example usage
const myTrench: CompactTrench = [
    { row: 0, col: 0 },
    { row: 0, col: 3 },
    { row: 3, col: 3 },
    { row: 3, col: 1 },
    { row: 1, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: 0 }, // Closing the loop
];

console.log('Area:', calculateArea(myTrench));
