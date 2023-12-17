export const toInt = (v: string) => parseInt(v, 10);
export const sumReducer = (sum: number, x: string | number): number => (sum += toInt(`${x}`));

export function transposeMatrix(matrix: T[][]): T[][] {
    // Create a new matrix with the dimensions swapped
    const transposed = new Array(matrix[0].length)
        .fill(0)
        .map(() => new Array(matrix.length).fill(0));

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            // Swap the row and column indices
            transposed[j][i] = matrix[i][j];
        }
    }

    return transposed;
}

export function arraysAreEqual<T = unknown>(arr1?: T[], arr2?: T[]) {
    // Check if the arrays are the same length
    if (arr1?.length !== arr2?.length) {
        return false;
    }

    // Check each element in the arrays
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    // If all checks pass, the arrays are the same
    return true;
}

export const parseMatrix = (
    v: string,
    transform: (char: string) => unknown = (char: string) => char
) => {
    return v
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split('').map(transform));
};

export const printMatrix = (m: unknown[][], replace: (s: string) => string = (s: string) => s) => {
    console.log(m.map((l) => l.map(replace).join('')).join('\n'));
    console.log('');
};

type Direction =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left';

export type Coords = {
    [key in Direction]?: [number, number];
};

export const getAdjacentCoords = (
    r: number,
    c: number,
    maxRow: number,
    maxCol: number,
    diagonal = false
) => {
    const coords: Coords = {};
    // top
    if (r - 1 >= 0) {
        coords['top'] = [r - 1, c];
    }

    // bottom
    if (r + 1 <= maxRow) {
        coords['bottom'] = [r + 1, c];
    }

    // left
    if (c - 1 >= 0) {
        coords['left'] = [r, c - 1];
    }

    // right
    if (c + 1 <= maxCol) {
        coords['right'] = [r, c + 1];
    }

    if (!diagonal) return coords;

    // top-right
    if (r - 1 >= 0 && c + 1 <= maxCol) {
        coords['top-right'] = [r - 1, c + 1];
    }

    // top-left
    if (r - 1 >= 0 && c - 1 >= 0) {
        coords['top-left'] = [r - 1, c - 1];
    }

    // bottom-right
    if (r + 1 <= maxRow && c + 1 <= maxCol) {
        coords['bottom-right'] = [r + 1, c + 1];
    }

    // bottom-left
    if (r + 1 <= maxRow && c - 1 >= 0) {
        coords['bottom-left'] = [r + 1, c - 1];
    }

    return coords;
};

export const intersection = <T>(array1: T[], array2: T[]) =>
    array1.filter((n) => array2.indexOf(n) !== -1);

export const trim = (s: string, idx?: number, arr?: string[]) => s.trim();
