
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
//screen
const startScreen = $('#start-screen');
const gameScreen = $('#game-screen');
const pauseScreen = $('#pause-screen');
const resultScreen = $('#result-screen');
//element
const cells = $$('.main-grid-cell');
const playerName = $('#player-name');
const gameLevel = $('#game-level');
const gameTime = $('#game-time');
const resultTime = $('#result-time');

const nameInput = $('#input-name');
const numberInputs = $$('.number');

let timer = null;
let pause = false;
let seconds = 0;
let su = undefined;
let su_answer = undefined;
let selectedCell = -1;
let levelIndex = 0;
let level = CONSTANT.LEVEL[levelIndex];

//add space for 9 cells
const initGameGrid = () => {
    let index = 0;
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;

        if (row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '10px';

        index++;
    }
}
const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');
const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const clearSudoku = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerText = '';
        cells[i].classList.remove('filled');
        cells[i].classList.remove('selected');
    }
}

const initSudoku = () => {
    //clear old sudoku
    clearSudoku();
    resetBg();
    //generate sudoku puzzle here
    su = sudokuGen(level);
    su_answer = [...su.question];

    //show Sudoku to GameScreen
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;

        cells[i].setAttribute('data-value', su.question[row][col]);

        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            cells[i].innerText = su.question[row][col];
        }
    }
}

const loadSudoku = () => {
    let game = getGameInfo();
    console.log(game);
    gameLevel.innerText = CONSTANT.LEVEL_NAME[game.level];

    su = game.su;
    su_answer = su.answer;
    seconds = game.seconds;

    gameTime.innerText = showTime(seconds);

    levelIndex = game.level;

    //show Sudoku to GameScreen
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;

        cells[i].setAttribute('data-value', su_answer[row][col]);
        cells[i].innerText = su_answer[row][col] !== 0 ? su_answer[row][col] : '';
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}

const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let bowStartRow = row - row % 3;
    let bowStartCol = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[0 * (bowStartRow + i) + (bowStartCol + j)];
            cell.classList.add('hover');
        }
    }
    let step = 9;
    while (index - step >= 0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }

    step = 1;
    while (index - step >= 9 * row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }

    step = 1;
    while (index + step < 9 * row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}
const checkErr = (value) => {
    const addErr = (cell) => {
        if (parseInt(cell.dataset.value) === value) {
            cell.classList.add('err');
            cell.classList.add('cell-err');
            setTimeout(() => {
                cell.classList.remove('cell-err');
            }, 500);
        }
    }

    let index = selectedCell;

    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let bowStartRow = row - row % 3;
    let bowStartCol = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[0 * (bowStartRow + i) + (bowStartCol + j)];
            if (!cell.classList.contains('selected')) addErr(cell);
        }
    }
    let step = 9;
    while (index - step >= 0) {
        addErr(cells[index - step]);
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        addErr(cells[index + step]);
        step += 9;
    }

    step = 1;
    while (index - step >= 9 * row) {
        addErr(cells[index - step]);
        step += 1;
    }

    step = 1;
    while (index + step < 9 * row + 9) {
        addErr(cells[index + step]);
        step += 1;
    }
}

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
    let game = {
        level: levelIndex,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
    $('#btn-continue').style.display = 'none';
}

const isGameWin = () => sudokuCheck(su_answer);

const showResult = () => {
    clearInterval(timer);
    //show result screen
    resultScreen.classList.add('active');
    resultTime.innerText = showTime(seconds);
}

const initNumberInputEvent = () => {
    numberInputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!cells[selectedCell].classList.contains('filled')) {
                cells[selectedCell].innerText = index + 1;
                cells[selectedCell].setAttribute('data-value', index + 1);

                //add to answer
                let row = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
                let col = selectedCell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;
                //save game
                saveGameInfo();
                //--------
                removeErr();
                checkErr(index + 1);
                cells[selectedCell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selectedCell].classList.remove('zoom-in');
                }, 500);

                //check game win
                if (isGameWin()) {
                    removeGameInfo();
                    showResult();
                }
            }
        })
    })
}

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));

                selectedCell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        })
    });
}

//start game
const startGame = () => {
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');

    playerName.innerText = nameInput.value.trim();
    setPlayerName(nameInput.value.trim());
    gameLevel.innerText = CONSTANT.LEVEL_NAME[levelIndex];

    showTime(seconds);

    timer = setInterval(() => {
        if (!pause) {
            seconds = seconds + 1;
            gameTime.innerText = showTime(seconds);
        }
    }, 1000);
}

//Reset to New Game
const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    gameTime.innerText = '00:00:00';
    startScreen.classList.add('active');
    gameScreen.classList.remove('active');
    pauseScreen.classList.remove('active');
    resultScreen.classList.remove('active');
}

//change Mode
$('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    //change mobile status bar color
    $('meta[name="theme-color"]').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});

//btn-Level event
$('#btn-level').addEventListener('click', (e) => {
    levelIndex = levelIndex + 1 > CONSTANT.LEVEL.length - 1 ? 0 : levelIndex + 1;
    level = CONSTANT.LEVEL[levelIndex];
    e.target.innerHTML = CONSTANT.LEVEL_NAME[levelIndex];
});

//btn-play event
$('#btn-play').addEventListener('click', () => {
    if (nameInput.value.trim().length > 0) {
        console.log('Start game', level);
        initSudoku();
        // Start Game
        startGame();
    } else {
        nameInput.classList.add('input-err');
        setTimeout(() => {
            nameInput.classList.remove('input-err');
            nameInput.focus();
        }, 500);
    }
});

//btn-continue event
$('#btn-continue').addEventListener('click', () => {
    if (nameInput.value.trim().length > 0) {
        console.log('Start game', level);
        loadSudoku();
        // Start Game
        startGame();
    } else {
        nameInput.classList.add('input-err');
        setTimeout(() => {
            nameInput.classList.remove('input-err');
            nameInput.focus();
        }, 500);
    }
});

//btn pause event
$('#btn-pause').addEventListener('click', () => {
    pauseScreen.classList.add('active');
    pause = true;
    // gameScreen.classList.remove('active');
})

//btn resume event
$('#btn-resume').addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pause = false;
    // gameScreen.classList.add('active');
})

//btn New game event
$('#btn-new-game').addEventListener('click', () => {
    returnStartScreen();
})

//btn New game 2 event
$('#btn-new-game-2').addEventListener('click', () => {
    returnStartScreen();
})

//btn delete event
$('#btn-delete').addEventListener('click', () => {
    cells[selectedCell].innerText = '';
    cells[selectedCell].setAttribute('data-value', 0);

    let row = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
    let col = selectedCell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    removeErr();
})
const init = () => {
    const darkMode = JSON.parse(localStorage.getItem('darkmode'));

    document.body.classList.add(darkMode ? 'dark' : 'light');
    $('meta[name="theme-color"]').setAttribute('content', darkMode ? '#1a1a2e' : '#fff');

    const game = getGameInfo();

    $('#btn-continue').style.display = game ? 'grid' : 'none';

    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();
    if (getPlayerName()) {
        nameInput.value = getPlayerName();
    } else {
        nameInput.focus();
    }
}

init();

