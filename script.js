class ParchisiGame {
    constructor() {
        this.currentPlayer = 1;
        this.diceValue = 1;
        this.gameState = 'waiting'; // waiting, rolling, moving
        this.players = {
            1: { color: 'red', tokens: [], finished: 0 },
            2: { color: 'green', tokens: [], finished: 0 },
            3: { color: 'yellow', tokens: [], finished: 0 },
            4: { color: 'blue', tokens: [], finished: 0 }
        };
        this.path = [];
        this.safeZones = [];
        this.consecutiveSixes = 0;
        this.selectedToken = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createGamePath();
        this.initializeTokens();
        this.updateCurrentPlayerIndicator();
        this.updateGameMessage('Player 1\'s turn. Roll the dice!');
    }

    createGamePath() {
        const gamePath = document.querySelector('.game-path');
        gamePath.innerHTML = '';

        // Create the main path (52 cells)
        const pathPositions = this.calculatePathPositions();
        
        pathPositions.forEach((pos, index) => {
            const cell = document.createElement('div');
            cell.className = 'path-cell';
            cell.style.left = pos.x + 'px';
            cell.style.top = pos.y + 'px';
            cell.dataset.index = index;
            cell.dataset.position = index;
            
            // Add colored cells for starting positions
            if (index === 0) cell.style.background = '#ff6b6b'; // Red start
            else if (index === 13) cell.style.background = '#2ed573'; // Green start
            else if (index === 26) cell.style.background = '#ffa502'; // Yellow start
            else if (index === 39) cell.style.background = '#3742fa'; // Blue start
            
            gamePath.appendChild(cell);
            this.path.push(cell);
        });

        // Create finish paths for each player
        this.createFinishPaths();
    }

    calculatePathPositions() {
        const positions = [];
        const boardSize = 600;
        const cellSize = 30;
        const center = boardSize / 2;
        const pathRadius = 200;

        // Main path positions (clockwise from bottom)
        for (let i = 0; i < 52; i++) {
            let x, y;
            
            if (i < 6) { // Bottom path
                x = center - 75 + (i * cellSize);
                y = center + 100;
            } else if (i < 19) { // Right path
                x = center + 100;
                y = center + 75 - ((i - 6) * cellSize);
            } else if (i < 32) { // Top path
                x = center + 75 - ((i - 19) * cellSize);
                y = center - 100;
            } else if (i < 45) { // Left path
                x = center - 100;
                y = center - 75 + ((i - 32) * cellSize);
            } else { // Bottom path (return)
                x = center - 75 + ((i - 45) * cellSize);
                y = center + 100;
            }
            
            positions.push({ x, y });
        }

        return positions;
    }

    createFinishPaths() {
        const gamePath = document.querySelector('.game-path');
        
        // Create finish paths for each player (6 cells each)
        const finishPaths = {
            1: { startX: 262, startY: 262, direction: 'up' }, // Red finish
            2: { startX: 262, startY: 262, direction: 'left' }, // Green finish
            3: { startX: 262, startY: 262, direction: 'down' }, // Yellow finish
            4: { startX: 262, startY: 262, direction: 'right' } // Blue finish
        };

        Object.keys(finishPaths).forEach(player => {
            const path = finishPaths[player];
            const color = this.players[player].color;
            
            for (let i = 0; i < 6; i++) {
                const cell = document.createElement('div');
                cell.className = 'path-cell finish-cell';
                cell.style.background = this.getFinishColor(color);
                
                let x, y;
                switch (path.direction) {
                    case 'up':
                        x = path.startX;
                        y = path.startY - (i + 1) * 30;
                        break;
                    case 'left':
                        x = path.startX - (i + 1) * 30;
                        y = path.startY;
                        break;
                    case 'down':
                        x = path.startX;
                        y = path.startY + (i + 1) * 30;
                        break;
                    case 'right':
                        x = path.startX + (i + 1) * 30;
                        y = path.startY;
                        break;
                }
                
                cell.style.left = x + 'px';
                cell.style.top = y + 'px';
                cell.dataset.player = player;
                cell.dataset.finishIndex = i;
                
                gamePath.appendChild(cell);
            }
        });
    }

    getFinishColor(color) {
        const colors = {
            red: '#ffebee',
            green: '#e8f5e8',
            yellow: '#fff8e1',
            blue: '#e3f2fd'
        };
        return colors[color] || '#f0f0f0';
    }

    initializeTokens() {
        // Initialize tokens for each player
        for (let player = 1; player <= 4; player++) {
            this.players[player].tokens = [
                { id: 1, position: 'home', pathIndex: -1, finishIndex: -1 },
                { id: 2, position: 'home', pathIndex: -1, finishIndex: -1 },
                { id: 3, position: 'home', pathIndex: -1, finishIndex: -1 },
                { id: 4, position: 'home', pathIndex: -1, finishIndex: -1 }
            ];
        }
    }

    setupEventListeners() {
        // Dice roll button
        document.getElementById('rollDice').addEventListener('click', () => {
            if (this.gameState === 'waiting') {
                this.rollDice();
            }
        });

        // Token click events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('token')) {
                this.handleTokenClick(e.target);
            }
        });

        // New game button
        document.getElementById('newGame').addEventListener('click', () => {
            this.resetGame();
        });

        // Rules button
        document.getElementById('rules').addEventListener('click', () => {
            this.showRules();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.hideRules();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('rulesModal');
            if (e.target === modal) {
                this.hideRules();
            }
        });
    }

    rollDice() {
        if (this.gameState !== 'waiting') return;

        this.gameState = 'rolling';
        const dice = document.getElementById('dice');
        const rollBtn = document.getElementById('rollDice');
        
        rollBtn.disabled = true;
        dice.classList.add('rolling');

        // Animate dice roll
        setTimeout(() => {
            this.diceValue = Math.floor(Math.random() * 6) + 1;
            dice.querySelector('.dice-face').textContent = this.diceValue;
            dice.classList.remove('rolling');
            
            this.handleDiceRoll();
        }, 500);
    }

    handleDiceRoll() {
        this.consecutiveSixes = this.diceValue === 6 ? this.consecutiveSixes + 1 : 0;
        
        if (this.consecutiveSixes >= 3) {
            this.updateGameMessage(`Three 6s in a row! Player ${this.currentPlayer} loses turn.`);
            this.consecutiveSixes = 0;
            this.nextTurn();
            return;
        }

        const availableMoves = this.getAvailableMoves(this.currentPlayer);
        
        if (availableMoves.length === 0) {
            this.updateGameMessage(`No moves available for Player ${this.currentPlayer}. Turn skipped.`);
            this.nextTurn();
            return;
        }

        if (this.diceValue === 6) {
            this.updateGameMessage(`Player ${this.currentPlayer} rolled a 6! You get another turn.`);
        } else {
            this.updateGameMessage(`Player ${this.currentPlayer} rolled ${this.diceValue}. Select a token to move.`);
        }

        this.gameState = 'moving';
        this.highlightAvailableTokens(availableMoves);
    }

    getAvailableMoves(player) {
        const moves = [];
        const playerTokens = this.players[player].tokens;

        playerTokens.forEach((token, index) => {
            if (this.canMoveToken(player, token, this.diceValue)) {
                moves.push({ token, index });
            }
        });

        return moves;
    }

    canMoveToken(player, token, diceValue) {
        // If token is in home and dice is not 6, can't move
        if (token.position === 'home' && diceValue !== 6) {
            return false;
        }

        // If token is finished, can't move
        if (token.position === 'finished') {
            return false;
        }

        // If token is on path, check if move is valid
        if (token.position === 'path') {
            const newPosition = token.pathIndex + diceValue;
            
            // Check if move would exceed finish area
            if (newPosition >= 52) {
                const finishIndex = newPosition - 52;
                if (finishIndex >= 6) {
                    return false; // Would exceed finish area
                }
            }
        }

        return true;
    }

    highlightAvailableTokens(moves) {
        // Remove previous highlights
        document.querySelectorAll('.token').forEach(token => {
            token.classList.remove('available');
        });

        // Highlight available tokens
        moves.forEach(move => {
            const tokenElement = document.querySelector(`[data-player="${this.currentPlayer}"][data-token="${move.token.id}"]`);
            if (tokenElement) {
                tokenElement.classList.add('available');
            }
        });
    }

    handleTokenClick(tokenElement) {
        if (this.gameState !== 'moving') return;

        const player = parseInt(tokenElement.dataset.player);
        const tokenId = parseInt(tokenElement.dataset.token);

        if (player !== this.currentPlayer) return;

        const token = this.players[player].tokens.find(t => t.id === tokenId);
        if (!token) return;

        const availableMoves = this.getAvailableMoves(player);
        const canMove = availableMoves.some(move => move.token.id === tokenId);

        if (!canMove) return;

        this.moveToken(player, token);
    }

    moveToken(player, token) {
        // Remove highlights
        document.querySelectorAll('.token').forEach(t => t.classList.remove('available'));

        const tokenElement = document.querySelector(`[data-player="${player}"][data-token="${token.id}"]`);
        tokenElement.classList.add('moving');

        setTimeout(() => {
            this.executeMove(player, token);
            tokenElement.classList.remove('moving');
        }, 300);
    }

    executeMove(player, token) {
        if (token.position === 'home' && this.diceValue === 6) {
            // Move token out of home
            token.position = 'path';
            token.pathIndex = this.getStartPosition(player);
            this.placeTokenOnPath(player, token);
            this.updateGameMessage(`Player ${player} moved token ${token.id} out of home!`);
        } else if (token.position === 'path') {
            // Move token on path
            const newPathIndex = token.pathIndex + this.diceValue;
            
            if (newPathIndex >= 52) {
                // Enter finish area
                const finishIndex = newPathIndex - 52;
                if (finishIndex < 6) {
                    token.position = 'finish';
                    token.pathIndex = -1;
                    token.finishIndex = finishIndex;
                    this.placeTokenInFinish(player, token, finishIndex);
                    this.updateGameMessage(`Player ${player} moved token ${token.id} to finish area!`);
                }
            } else {
                // Continue on path
                token.pathIndex = newPathIndex;
                this.placeTokenOnPath(player, token);
                this.updateGameMessage(`Player ${player} moved token ${token.id} to position ${newPathIndex + 1}`);
            }
        }

        // Check for captures
        this.checkForCaptures(player, token);

        // Check if player won
        if (this.checkWinCondition(player)) {
            this.handlePlayerWin(player);
            return;
        }

        // Check if dice was 6 for extra turn
        if (this.diceValue === 6) {
            this.gameState = 'waiting';
            this.updateGameMessage(`Player ${player} gets another turn! Roll the dice.`);
        } else {
            this.nextTurn();
        }
    }

    getStartPosition(player) {
        const startPositions = { 1: 0, 2: 13, 3: 26, 4: 39 };
        return startPositions[player];
    }

    placeTokenOnPath(player, token) {
        // Remove token from current position
        this.removeTokenFromPosition(token);

        // Place token on new path position
        const pathCell = this.path[token.pathIndex];
        if (pathCell) {
            const tokenElement = document.querySelector(`[data-player="${player}"][data-token="${token.id}"]`);
            const rect = pathCell.getBoundingClientRect();
            const gameBoard = document.querySelector('.game-board').getBoundingClientRect();
            
            tokenElement.style.position = 'absolute';
            tokenElement.style.left = (rect.left - gameBoard.left + 5) + 'px';
            tokenElement.style.top = (rect.top - gameBoard.top + 5) + 'px';
            tokenElement.style.zIndex = '100';
            
            pathCell.classList.add('has-token');
            pathCell.dataset.player = player;
            pathCell.dataset.token = token.id;
        }
    }

    placeTokenInFinish(player, token, finishIndex) {
        // Remove token from current position
        this.removeTokenFromPosition(token);

        // Place token in finish area
        const finishCells = document.querySelectorAll(`.finish-cell[data-player="${player}"]`);
        const finishCell = finishCells[finishIndex];
        
        if (finishCell) {
            const tokenElement = document.querySelector(`[data-player="${player}"][data-token="${token.id}"]`);
            const rect = finishCell.getBoundingClientRect();
            const gameBoard = document.querySelector('.game-board').getBoundingClientRect();
            
            tokenElement.style.position = 'absolute';
            tokenElement.style.left = (rect.left - gameBoard.left + 5) + 'px';
            tokenElement.style.top = (rect.top - gameBoard.top + 5) + 'px';
            tokenElement.style.zIndex = '100';
        }
    }

    removeTokenFromPosition(token) {
        // Remove token from path cell
        if (token.pathIndex >= 0) {
            const pathCell = this.path[token.pathIndex];
            if (pathCell) {
                pathCell.classList.remove('has-token');
                delete pathCell.dataset.player;
                delete pathCell.dataset.token;
            }
        }
    }

    checkForCaptures(player, token) {
        if (token.position !== 'path') return;

        const pathCell = this.path[token.pathIndex];
        if (!pathCell) return;

        // Check if there's an opponent's token on this cell
        const existingPlayer = pathCell.dataset.player;
        const existingTokenId = pathCell.dataset.token;

        if (existingPlayer && parseInt(existingPlayer) !== player) {
            // Capture the opponent's token
            this.captureToken(parseInt(existingPlayer), parseInt(existingTokenId));
            this.updateGameMessage(`Player ${player} captured Player ${existingPlayer}'s token!`);
        }
    }

    captureToken(player, tokenId) {
        const token = this.players[player].tokens.find(t => t.id === tokenId);
        if (token) {
            // Reset token to home
            token.position = 'home';
            token.pathIndex = -1;
            token.finishIndex = -1;

            // Reset token element position
            const tokenElement = document.querySelector(`[data-player="${player}"][data-token="${tokenId}"]`);
            if (tokenElement) {
                tokenElement.style.position = 'static';
                tokenElement.style.left = '';
                tokenElement.style.top = '';
                tokenElement.style.zIndex = '';
            }
        }
    }

    checkWinCondition(player) {
        const finishedTokens = this.players[player].tokens.filter(token => token.position === 'finished');
        return finishedTokens.length === 4;
    }

    handlePlayerWin(player) {
        this.updateGameMessage(`🎉 Player ${player} wins the game! 🎉`);
        this.gameState = 'finished';
        
        // Add winner animation
        const playerArea = document.querySelector(`.player-${player}`);
        playerArea.classList.add('winner');
        
        // Disable dice roll
        document.getElementById('rollDice').disabled = true;
    }

    nextTurn() {
        this.currentPlayer = this.currentPlayer % 4 + 1;
        this.updateCurrentPlayerIndicator();
        this.gameState = 'waiting';
        this.updateGameMessage(`Player ${this.currentPlayer}'s turn. Roll the dice!`);
        document.getElementById('rollDice').disabled = false;
    }

    updateCurrentPlayerIndicator() {
        const indicator = document.getElementById('currentPlayerIndicator');
        const colors = { 1: '#ff4757', 2: '#2ed573', 3: '#ffa502', 4: '#3742fa' };
        indicator.style.background = colors[this.currentPlayer];
    }

    updateGameMessage(message) {
        const messageElement = document.getElementById('gameMessages');
        messageElement.textContent = message;
    }

    resetGame() {
        // Reset game state
        this.currentPlayer = 1;
        this.diceValue = 1;
        this.gameState = 'waiting';
        this.consecutiveSixes = 0;
        this.selectedToken = null;

        // Reset players
        for (let player = 1; player <= 4; player++) {
            this.players[player].tokens = [
                { id: 1, position: 'home', pathIndex: -1, finishIndex: -1 },
                { id: 2, position: 'home', pathIndex: -1, finishIndex: -1 },
                { id: 3, position: 'home', pathIndex: -1, finishIndex: -1 },
                { id: 4, position: 'home', pathIndex: -1, finishIndex: -1 }
            ];
        }

        // Reset UI
        document.getElementById('dice').querySelector('.dice-face').textContent = '1';
        document.getElementById('rollDice').disabled = false;
        
        // Reset token positions
        document.querySelectorAll('.token').forEach(token => {
            token.style.position = 'static';
            token.style.left = '';
            token.style.top = '';
            token.style.zIndex = '';
            token.classList.remove('available', 'moving', 'selected');
        });

        // Clear path cells
        document.querySelectorAll('.path-cell').forEach(cell => {
            cell.classList.remove('has-token');
            delete cell.dataset.player;
            delete cell.dataset.token;
        });

        // Remove winner animation
        document.querySelectorAll('.player-area').forEach(area => {
            area.classList.remove('winner');
        });

        // Update display
        this.updateCurrentPlayerIndicator();
        this.updateGameMessage('New game started! Player 1\'s turn. Roll the dice!');
    }

    showRules() {
        document.getElementById('rulesModal').style.display = 'block';
    }

    hideRules() {
        document.getElementById('rulesModal').style.display = 'none';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ParchisiGame();
});