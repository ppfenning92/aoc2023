import { Coords, getAroundCell as getAdjacentCoords } from '.';

describe('getAroundCell', () => {
    const matrix: number[][] = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ];

    const maxRow = matrix.length - 1;
    const maxCol = matrix[0].length - 1;

    it('should get surrounding cells without diagonals', () => {
        const result: Coords = getAdjacentCoords(1, 1, maxRow, maxCol);
        expect(result).toEqual({
            top: [0, 1],
            bottom: [2, 1],
            left: [1, 0],
            right: [1, 2],
        });
    });

    it('should get surrounding cells with diagonals', () => {
        const result: Coords = getAdjacentCoords(1, 1, maxRow, maxCol, true);
        expect(result).toEqual({
            'top': [0, 1],
            'bottom': [2, 1],
            'left': [1, 0],
            'right': [1, 2],
            'top-right': [0, 2],
            'top-left': [0, 0],
            'bottom-right': [2, 2],
            'bottom-left': [2, 0],
        });
    });

    it('should handle edge cases at the top-left corner', () => {
        const result: Coords = getAdjacentCoords(0, 0, maxRow, maxCol, true);
        expect(result).toEqual({
            'bottom': [1, 0],
            'right': [0, 1],
            'bottom-right': [1, 1],
        });
    });

    it('should handle edge cases at the bottom-right corner', () => {
        const result: Coords = getAdjacentCoords(maxRow, maxCol, maxRow, maxCol, true);
        expect(result).toEqual({
            'top': [maxRow - 1, maxCol],
            'left': [maxRow, maxCol - 1],
            'top-left': [maxRow - 1, maxCol - 1],
        });
    });
});
