const newGrid = (size) => {
    let arr = new Array(size);

    for (let i = 0; i < size; i++) {
        arr[i] = new Array(size);
    }

    for (let i = 0; i < Math.pow(size, 2); i++) {
        arr[Math.floor(i / size)][i % size] = CONSTANT.UNASSIGNED;
    }

    return arr;
}
// check duplicate number in col
const isColSafe = (grid, col, value) => {
    for (let row = 0; row < CONSTANT.GRID_SIZE; row++) {
        if (grid[row][col] === value) return false;
    }
    return true;
}
// check duplicate number in row
const isRowSafe = (grid, row, value) => {
    for (let col = 0; col < CONSTANT.GRID_SIZE; col++) {
        if (grid[row][col] === value) return false;
    }
    return true;
}
// check duplicate number in 3x3 box
const isBoxSafe = (grid, box_row, box_col, value) => {
    for (let row = 0; row < CONSTANT.BOX_SIZE; row++) {
        for (let col = 0; col < CONSTANT.BOX_SIZE; col++) {
            if (grid[row + box_row][col + box_col] === value) return false
        }
    }
    return true;
}
//check in row,col and 3x3 box
const isSafe = (grid, row, col, value) => {
    return isColSafe(grid, col, value)
        && isRowSafe(grid, row, value)
        && isBoxSafe(grid, row - row % 3, col - col % 3, value)
        && value !== CONSTANT.UNASSIGNED;
}
//find unassigned cell
const findUnassignedPos = (grid, pos) => {
    for (let row = 0; row < CONSTANT.GRID_SIZE; row++) {
        for (let col = 0; col < CONSTANT.GRID_SIZE; col++) {
            if (grid[row][col] === CONSTANT.UNASSIGNED) {
                pos.row = row;
                pos.col = col;
                return true;
            }
        }
    }
    return false;
}
//shuffle arr
const shuffleArray = (arr) => {
    let currIndex = arr.length;

    while (currIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currIndex);
        currIndex--;

        let temp = arr[currIndex];
        arr[currIndex] = arr[randomIndex];
        arr[randomIndex] = temp;
    }
    return arr;
}
//check puzzule is complete
const isFullGird = (grid) => {
    return grid.every((row, i) => {
        return row.every((value, j) => {
            return value !== CONSTANT.UNASSIGNED;
        })
    })
}

const sudokuCreate = (grid) => {
    let unassignedPos = {
        row: -1,
        col: -1
    }

    if (!findUnassignedPos(grid, unassignedPos)) return true;

    let numberList = shuffleArray([...CONSTANT.NUMBERS]);

    let row = unassignedPos.row;
    let col = unassignedPos.col;

    numberList.forEach((num, i) => {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;

            if (isFullGird(grid)) {
                return true;
            } else {
                if (sudokuCreate(grid)) {
                    return true;
                }
            }
            grid[row][col] = CONSTANT.UNASSIGNED;
        }
    });
    return isFullGird(grid);
}

const sudokuCheck = (grid) => {
    let unassignedPos = {
        row: -1,
        col: -1
    }

    if (!findUnassignedPos(grid, unassignedPos)) return true;

    grid.forEach((row, i) => {
        row.forEach((num, j) => {
            if (isSafe(grid, i, j, num)) {
                if (isFullGird(grid)) {
                    return true;
                } else {
                    if (sudokuCreate(grid)) {
                        return true;
                    }
                }
            }
        })
    });
    return isFullGird(grid);
}

const random = () => Math.floor(Math.random() * CONSTANT.GRID_SIZE);

const removeCells = (grid, level) => {
    let res = [...grid];
    let attemps = level;
    while (attemps > 0) {
        let row = random();
        let col = random();

        while (res[row][col] === 0) {
            row = random();
            col = random();
        }
        res[row][col] = CONSTANT.UNASSIGNED;
        attemps--;
    }
    return res;
}

//generate sudoku base on level
const sudokuGen = (level) => {
    let sudoku = newGrid(CONSTANT.GRID_SIZE);
    let check = sudokuCreate(sudoku);
    if (check) {
        let question = removeCells(sudoku, level);
        return {
            original: sudoku,
            question: question
        }
    }
    return undefined;
}
