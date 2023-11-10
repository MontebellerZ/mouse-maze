/**
 * Represents a cell in the maze.
 *
 * @typedef {Object} Cell
 * @property {boolean} top - Indicates if the top wall of the cell is present.
 * @property {boolean} bottom - Indicates if the bottom wall of the cell is present.
 * @property {boolean} left - Indicates if the left wall of the cell is present.
 * @property {boolean} right - Indicates if the right wall of the cell is present.
 */

/**
 * Represents a position in the maze.
 *
 * @typedef {Object} Position
 * @property {number} y - The y coordinate of the cell.
 * @property {number} x - The x coordinate of the cell.
 * @property {string} [direction] - Direction to the destination cell on moving.
 * @property {string} [opposite] - Direction to the destination cell on moving.
 * @property {string[]} [keys] - Keyboard keys for its direction.
 */

/**
 * URL of the user icon.
 */
const USER_ICON =
    "https://classroomclipart.com/image/static7/preview2/cute-cartoon-mouse-with-long-wiskers-pink-tail-57267.jpg";

/**
 * Array of possible movements in the maze.
 *
 * @type {Position[]}
 */
const MOVES = [
    { y: -1, x: 0, opposite: "bottom", direction: "top", keys: ["ArrowUp", "W", "w"] },
    { y: 0, x: -1, opposite: "right", direction: "left", keys: ["ArrowLeft", "A", "a"] },
    { y: 1, x: 0, opposite: "top", direction: "bottom", keys: ["ArrowDown", "S", "s"] },
    { y: 0, x: 1, opposite: "left", direction: "right", keys: ["ArrowRight", "D", "d"] },
];

/**
 * Timer interval for tracking game time.
 *
 * @type {number}
 */
var timerInterval = null;
/**
 * Function to bind the keyboardMoveListener to keyboard events.
 *
 * @type {()=>void}
 */
var bindKeyboardMoveListener = null;
/**
 * Function to bind the arrowsMoveListener to button events.
 *
 * @type {()=>void}
 */
var bindArrowsMoveListener = null;

/**
 * Generate a unique cell ID based on its coordinates.
 *
 * @param {Position} cell - The cell for which to generate an ID.
 * @returns {string} Cell id.
 */
function getCellId(cell) {
    return `Cell_${cell.y}_${cell.x}`;
}

/**
 * Retrieve the HTML element of a specific cell.
 *
 * @param {Position} cell - The cell for which to retrieve the HTML element.
 * @returns {HTMLElement} Cell div element.
 */
function getCellElement(cell) {
    const cellId = getCellId(cell);
    return document.getElementById(cellId);
}

/**
 * Generate a maze with the specified width and height.
 *
 * @param {number} width - The width of the maze.
 * @param {number} height - The height of the maze.
 * @returns {Cell[][]} A two-dimensional array representing the maze, where each cell is of type 'Cell'.
 */
function generateMaze(width, height) {
    /** @type {Cell[][]} */
    const maze = [];

    for (let y = 0; y < height; y++) {
        maze.push([]);

        for (let x = 0; x < width; x++) {
            maze[y][x] = {
                walls: {
                    top: true,
                    bottom: true,
                    left: true,
                    right: true,
                },
                visited: false,
            };
        }
    }

    let currentCell = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
    };

    let visited = 1;
    maze[currentCell.y][currentCell.x].visited = true;

    const totalCells = width * height;

    const path = [currentCell];

    while (visited < totalCells) {
        const possibleMoves = MOVES.filter((move) => {
            return (
                currentCell.y + move.y >= 0 &&
                currentCell.y + move.y < height &&
                currentCell.x + move.x >= 0 &&
                currentCell.x + move.x < width &&
                !maze[currentCell.y + move.y][currentCell.x + move.x].visited
            );
        });

        if (!(possibleMoves.length > 0)) {
            currentCell = path.pop();
            continue;
        }

        const nextMoveIndex = Math.floor(Math.random() * possibleMoves.length);
        const nextMove = possibleMoves[nextMoveIndex];

        const nextCell = {
            x: currentCell.x + nextMove.x,
            y: currentCell.y + nextMove.y,
        };

        maze[currentCell.y][currentCell.x].walls[nextMove.direction] = false;
        maze[nextCell.y][nextCell.x].walls[nextMove.opposite] = false;
        maze[nextCell.y][nextCell.x].visited = true;

        path.push(nextCell);
        currentCell = nextCell;

        visited++;
    }

    const mazeMap = maze.map((lines) => lines.map(({ walls }) => walls));

    return mazeMap;
}

/**
 * Render the maze in the specified HTML element.
 *
 * @param {number} width - The width of the maze.
 * @param {number} height - The height of the maze.
 * @param {Cell[][]} maze - A two-dimensional array representing the maze, where each cell is of type 'Cell'.
 * @param {HTMLElement} mazeHolder - The HTML element in which to render the maze.
 */
function renderMaze(width, height, maze, mazeHolder) {
    mazeHolder.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    mazeHolder.style.gridTemplateRows = `repeat(${height}, 1fr)`;

    maze.forEach((lines, y) => {
        lines.forEach((cell, x) => {
            const newCell = document.createElement("div");
            newCell.id = getCellId({ x, y });
            newCell.className = "mazeCell";

            if (!cell.top) newCell.style.borderTopColor = "#0000";
            if (!cell.bottom) newCell.style.borderBottomColor = "#0000";
            if (!cell.left) newCell.style.borderLeftColor = "#0000";
            if (!cell.right) newCell.style.borderRightColor = "#0000";

            mazeHolder.appendChild(newCell);
        });
    });
}

/**
 * Resize the table based on window dimensions.
 */
function resizeTable() {
    const wh = document.getElementById("space").offsetHeight;
    const ww = document.getElementById("space").offsetWidth;

    if (wh > ww) {
        document.getElementById("mazeHolder").classList.add("vertical");
        document.getElementById("mazeHolder").classList.remove("horizontal");
    } else {
        document.getElementById("mazeHolder").classList.remove("vertical");
        document.getElementById("mazeHolder").classList.add("horizontal");
    }
}

/**
 * Event listener for game controls (e.g., starting a new game).
 *
 * @param {Event} event - The event object.
 */
function controlsListener(event) {
    switch (event.key) {
        case "Enter":
        case " ":
        case "r":
        case "R":
            openConfirmStart();
            return;
    }
}

/**
 * Event listener for user movements within the maze.
 *
 * @param {Event} event - The event object.
 * @param {Cell[][]} maze - A two-dimensional array representing the maze, where each cell is of type 'Cell'.
 * @param {Position[]} path - Path already used by the player.
 * @param {Position} goal - End position of the labirinth.
 * @param {{moves: number, startTime: Date}} controls - Initial controllers
 */
function arrowMoveListener(event, maze, path, goal, controls) {
    MOVES.forEach((move) => {
        const moveMatch = move.keys.some((key) => event.target.id === key);

        if (!moveMatch) return;

        checkMove(move, maze, path, goal, controls);
    });
}

/**
 * Event listener for user movements within the maze.
 *
 * @param {Event} event - The event object.
 * @param {Cell[][]} maze - A two-dimensional array representing the maze, where each cell is of type 'Cell'.
 * @param {Position[]} path - Path already used by the player.
 * @param {Position} goal - End position of the labirinth.
 * @param {{moves: number, startTime: Date}} controls - Initial controllers
 */
function keyboardMoveListener(event, maze, path, goal, controls) {
    MOVES.forEach((move) => {
        const moveMatch = move.keys.some((key) => event.key === key);

        if (!moveMatch) return;

        checkMove(move, maze, path, goal, controls);
    });
}

/**
 * Event listener for the 'load' event on the body.
 */
function onLoadBody() {
    document.addEventListener("keydown", controlsListener);

    resizeTable();

    window.onresize = resizeTable;
}

/**
 * Opens the confirmation dialog to start a new game or continue the current game.
 * If a game is not currently in progress, it initiates a new game.
 * If a game is already in progress, it displays the confirmation dialog.
 */
function openConfirmStart() {
    if (!timerInterval) return startGame();

    document.getElementById("confirmStartHolder").classList.add("show");
}

/**
 * Confirms the start of a new game and closes the confirmation dialog.
 * Initiates a new game.
 */
function confirmStart() {
    document.getElementById("confirmStartHolder").classList.remove("show");
    document.getElementById("winHolder").classList.remove("show");
    startGame();
}

/**
 * Cancels the start of a new game and closes the confirmation dialog.
 * Resumes the current game.
 */
function cancelStart() {
    document.getElementById("confirmStartHolder").classList.remove("show");
    document.getElementById("winHolder").classList.remove("show");
}

/**
 * Reset the game, clearing the maze and stopping the timer.
 */
function resetGame() {
    if (timerInterval) clearInterval(timerInterval);

    if (bindKeyboardMoveListener) document.removeEventListener("keydown", bindKeyboardMoveListener);
    if (bindArrowsMoveListener) {
        document.getElementById("ArrowUp").removeEventListener("click", bindArrowsMoveListener);
        document.getElementById("ArrowLeft").removeEventListener("click", bindArrowsMoveListener);
        document.getElementById("ArrowDown").removeEventListener("click", bindArrowsMoveListener);
        document.getElementById("ArrowRight").removeEventListener("click", bindArrowsMoveListener);
    }

    document.getElementById("confirmStartHolder").classList.remove("show");
    document.getElementById("winHolder").classList.remove("show");

    document.getElementById("mazeHolder").innerHTML = "";
    document.getElementById("timeCount").innerText = "00:00";
    document.getElementById("movesCount").innerText = "0";
}

/**
 * Start a new game by generating a maze and setting up event listeners.
 */
function startGame() {
    resetGame();

    const dificulty = getDificulty();

    const height = dificulty;
    const width = dificulty;

    const maze = generateMaze(width, height);

    const mazeHolder = document.getElementById("mazeHolder");
    renderMaze(width, height, maze, mazeHolder);

    /** @type {Position} */
    const initial = { x: 0, y: 0 };
    /** @type {Position} */
    const goal = { x: width - 1, y: height - 1 };
    /** @type {Position[]} */
    const path = [initial];

    getCellElement(initial).classList.add("user");
    getCellElement(goal).classList.add("goal");

    const controls = {
        moves: 0,
        startTime: Date.now(),
    };

    bindKeyboardMoveListener = (event) => keyboardMoveListener(event, maze, path, goal, controls);
    document.addEventListener("keydown", bindKeyboardMoveListener);

    bindArrowsMoveListener = (event) => arrowMoveListener(event, maze, path, goal, controls);
    document.getElementById("ArrowUp").addEventListener("click", bindArrowsMoveListener);
    document.getElementById("ArrowLeft").addEventListener("click", bindArrowsMoveListener);
    document.getElementById("ArrowDown").addEventListener("click", bindArrowsMoveListener);
    document.getElementById("ArrowRight").addEventListener("click", bindArrowsMoveListener);

    timerInterval = timer(controls);
}

/**
 * Check and process a user move within the maze.
 *
 * @param {Position} move - Position modifier based on move direction.
 * @param {Cell[][]} maze - A two-dimensional array representing the maze, where each cell is of type 'Cell'.
 * @param {Position[]} path - Path already used by the player.
 * @param {Position} goal - End position of the labirinth.
 * @param {{moves: number, startTime: Date}} controls - Initial controllers
 */
function checkMove(move, maze, path, goal, controls) {
    const currentCell = path[path.length - 1];

    const canMove = !maze[currentCell.y][currentCell.x][move.direction];

    if (!canMove) return;

    const newCell = {
        x: currentCell.x + move.x,
        y: currentCell.y + move.y,
    };

    const lastCell = path[path.length - 2];

    if (lastCell && lastCell.x === newCell.x && lastCell.y === newCell.y) {
        path.pop();
        getCellElement(lastCell).classList.remove("path", move.opposite + "After");
        getCellElement(currentCell).classList.remove(move.direction + "Before");
    } else {
        path.push(newCell);
        getCellElement(currentCell).classList.add("path", move.direction + "After");
        getCellElement(newCell).classList.add(move.opposite + "Before");
    }

    getCellElement(currentCell).classList.remove("user");
    getCellElement(newCell).classList.add("user");

    controls.moves++;
    document.getElementById("movesCount").innerText = controls.moves;

    if (!(newCell.x === goal.x && newCell.y === goal.y)) return;

    winGame(controls);
}

function ellapsedTime(time) {
    const ellapsedTime = Date.now() - time;

    const totalSeconds = ellapsedTime / 1000;
    const totalMinutes = totalSeconds / 60;

    const minutes = Math.floor(totalMinutes % 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");

    return { minutes, seconds };
}

/**
 * Create a timer interval to track the game time.
 *
 * @param {{moves: number, startTime: Date}} controls - Initial controllers
 * @returns {number} Timer interval ID.
 */
function timer(controls) {
    return setInterval(() => {
        const { minutes, seconds } = ellapsedTime(controls.startTime);

        document.getElementById("timeCount").innerText = `${minutes}:${seconds}`;
    }, 1000);
}

/**
 *
 * @param {{moves: number, startTime: Date}} controls - Initial controllers
 */
function winGame(controls) {
    if (timerInterval) clearInterval(timerInterval);
    if (bindKeyboardMoveListener) document.removeEventListener("keydown", bindKeyboardMoveListener);

    const { minutes, seconds } = ellapsedTime(controls.startTime);

    document.getElementById("winHolder").classList.add("show");

    document.getElementById("totalTime").innerText = `${minutes}:${seconds}`;
    document.getElementById("totalMoves").innerText = controls.moves;
}

function getDificulty() {
    const dificulty = document.getElementById("dificultySelect").value;
    return dificulty;
}
