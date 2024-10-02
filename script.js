document.addEventListener('DOMContentLoaded', () => { 
    const cells = document.querySelectorAll('.cell');
    const winnerScreen = document.getElementById('winner-screen');
    const winnerText = document.getElementById('winner-text');
    const playAgainBtn = document.getElementById('play-again-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreBoard = document.getElementById('scoreboard');
    const turnDisplay = document.getElementById('turn-display');

    let currentPlayer = 'x';
    let gameBoard = Array(16).fill(null); // 4x4 board
    let markPositions = { x: [], o: [] };
    let scores = { x: 0, o: 0 }; 
    let playerNames = {
        x: localStorage.getItem('playerX') || 'Player X',
        o: localStorage.getItem('playerO') || 'Player O'
    }; 
    let gameMode = localStorage.getItem('gameMode') || 'player';
    let difficulty = localStorage.getItem('difficulty') || 'easy';

    function updateMarkCounts() {
        return gameBoard.reduce((counts, mark) => {
            if (mark === 'x') counts.x++;
            else if (mark === 'o') counts.o++;
            return counts;
        }, { x: 0, o: 0 });
    }

    function checkWinner() {
        const winPatterns = [
            [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
            [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
            [0, 5, 10, 15], [3, 6, 9, 12]
        ];

        for (const pattern of winPatterns) {
            const [a, b, c, d] = pattern;
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c] && gameBoard[a] === gameBoard[d]) {
                return gameBoard[a];
            }
        }
        return gameBoard.includes(null) ? null : 'draw';
    }

    function handleClick(event) {
        const cellIndex = Array.from(cells).indexOf(event.target);
        const markCounts = updateMarkCounts();

        if (gameBoard[cellIndex]) return;

        markPositions[currentPlayer].push(cellIndex);

        if (markCounts[currentPlayer] >= 4) {
            const oldestIndex = markPositions[currentPlayer].shift();
            gameBoard[oldestIndex] = null;
            cells[oldestIndex].classList.remove(currentPlayer);
        }

        gameBoard[cellIndex] = currentPlayer;
        event.target.classList.add(currentPlayer);
        updateTurnDisplay();

        const winner = checkWinner();
        if (winner) {
            if (winner !== 'draw') scores[winner]++;
            updateScoreBoard();
            winnerText.textContent = winner === 'draw' ? "It's a Draw!" : `${playerNames[winner]} Wins!`;
            winnerScreen.style.display = 'flex';
        } else {
            currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
            updateTurnDisplay();
            if (gameMode === 'computer' && currentPlayer === 'o') {
                computerTurnHard();  
            }
        }
    }

    function computerTurnEasy() {
        const emptyCells = Array.from(cells).filter(cell => !cell.classList.contains('x') && !cell.classList.contains('o'));
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            randomCell.click();
        }
    }

    function computerTurnHard() {
        const bestMove = findBestMove('o') || findBestMove('x') || computerTurnEasy();
        if (bestMove !== null) {
            cells[bestMove].click();
        }
    }

    function findBestMove(player) {
        for (let i = 0; i < 16; i++) {
            if (!gameBoard[i]) {
                gameBoard[i] = player;
                if (checkWinner() === player) {
                    gameBoard[i] = null;
                    return i;
                }
                gameBoard[i] = null;
            }
        }
        return null;
    }

    function updateScoreBoard() {
        scoreBoard.textContent = `${playerNames.x}: ${scores.x} | ${playerNames.o}: ${scores.o}`;
    }

    function updateTurnDisplay() {
        turnDisplay.textContent = `Current Turn: ${playerNames[currentPlayer]}`;
    }

    function resetGame() {
        gameBoard.fill(null);
        cells.forEach(cell => cell.classList.remove('x', 'o'));
        markPositions.x = [];
        markPositions.o = [];
        currentPlayer = 'x';
        updateScoreBoard();
        winnerScreen.style.display = 'none';
        updateTurnDisplay();
    }

    playAgainBtn.addEventListener('click', resetGame);
    restartBtn.addEventListener('click', () => {
        scores = { x: 0, o: 0 };
        resetGame();
    });

    cells.forEach(cell => cell.addEventListener('click', handleClick));
    updateTurnDisplay();
});
