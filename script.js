class ParchisiGame {
    constructor() {
        this.currentPlayer = 1;
        this.diceValue = 0;
        this.gameState = 'waiting'; // waiting, rolled, moving, ended
        this.players = {
            1: { name: 'Player 1', color: 'red', pieces: [], homePieces: 4, finishedPieces: 0 },
            2: { name: 'Player 2', color: 'blue', pieces: [], homePieces: 4, finishedPieces: 0 },
            3: { name: 'Player 3', color: 'yellow', pieces: [], homePieces: 4, finishedPieces: 0 },
            4: { name: 'Player 4', color: 'green', pieces: [], homePieces: 4, finishedPieces: 0 }
        };
        
        // Board configuration
        this.boardSize = 15;
        this.paths = this.initializePaths();
        this.safeSpots = this.initializeSafeSpots();
        this.startingPositions = { 1: 68, 2: 83, 3: 158, 4: 143 }; // Grid positions
        this.homeAreas = this.initializeHomeAreas();
        this.homePaths = this.initializeHomePaths();
        this.centerPosition = 112; // Center of the board
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializePaths() {
        // Define the main path around the board (clockwise)
        const paths = {};
        let pathIndex = 0;
        
        // Top horizontal path (left to right)
        for (let col = 6; col <= 8; col++) {
            paths[pathIndex++] = col; // Row 0
        }
        
        // Right vertical path (top to bottom) 
        for (let row = 1; row <= 5; row++) {
            paths[pathIndex++] = row * 15 + 8; // Column 8
        }
        
        // Right horizontal path (left to right)
        for (let col = 9; col <= 14; col++) {
            paths[pathIndex++] = 6 * 15 + col; // Row 6
        }
        
        // Bottom vertical path (top to bottom)
        for (let row = 7; row <= 13; row++) {
            paths[pathIndex++] = row * 15 + 14; // Column 14
        }
        
        // Bottom horizontal path (right to left)
        for (let col = 13; col >= 8; col--) {
            paths[pathIndex++] = 14 * 15 + col; // Row 14
        }
        
        // Bottom vertical path (bottom to top)
        for (let row = 13; row >= 9; row--) {
            paths[pathIndex++] = row * 15 + 6; // Column 6
        }
        
        // Left horizontal path (right to left)
        for (let col = 5; col >= 0; col--) {
            paths[pathIndex++] = 8 * 15 + col; // Row 8
        }
        
        // Left vertical path (bottom to top)
        for (let row = 7; row >= 1; row--) {
            paths[pathIndex++] = row * 15 + 0; // Column 0
        }
        
        return paths;
    }

    initializeSafeSpots() {
        return [8, 23, 38, 53, 68, 83, 98, 113, 128, 143, 158, 173]; // Safe positions on the path
    }

    initializeHomeAreas() {
        return {
            1: [16, 17, 18, 31, 32, 33, 46, 47, 48], // Top-left
            2: [21, 22, 23, 36, 37, 38, 51, 52, 53], // Top-right  
            3: [171, 172, 173, 186, 187, 188, 201, 202, 203], // Bottom-right
            4: [166, 167, 168, 181, 182, 183, 196, 197, 198] // Bottom-left
        };
    }

    initializeHomePaths() {
        return {
            1: [97, 112, 127], // Path to center from player 1 start
            2: [82, 112, 142], // Path to center from player 2 start
            3: [127, 112, 97], // Path to center from player 3 start
            4: [142, 112, 82]  // Path to center from player 4 start
        };
    }

    initializeGame() {
        this.createBoard();
        this.initializePieces();
        this.updateUI();
        this.logMessage("Game started! Player 1's turn.");
    }

    createBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.position = i;
            
            // Determine cell type
            if (this.isPathCell(i)) {
                cell.classList.add('path');
                if (this.safeSpots.includes(i)) {
                    cell.classList.add('safe');
                }
            } else if (this.isHomeArea(i)) {
                const player = this.getHomeAreaPlayer(i);
                cell.classList.add(`home-${player}`);
            } else if (this.isStartingPosition(i)) {
                const player = this.getStartingPositionPlayer(i);
                cell.classList.add(`start-${player}`);
            } else if (this.isHomePath(i)) {
                const player = this.getHomePathPlayer(i);
                cell.classList.add(`home-path-${player}`);
            } else if (i === this.centerPosition) {
                cell.classList.add('center');
            }
            
            cell.addEventListener('click', (e) => this.handleCellClick(e));
            board.appendChild(cell);
        }
    }

    isPathCell(position) {
        return Object.values(this.paths).includes(position);
    }

    isHomeArea(position) {
        for (let player in this.homeAreas) {
            if (this.homeAreas[player].includes(position)) {
                return true;
            }
        }
        return false;
    }

    getHomeAreaPlayer(position) {
        for (let player in this.homeAreas) {
            if (this.homeAreas[player].includes(position)) {
                return player;
            }
        }
        return null;
    }

    isStartingPosition(position) {
        return Object.values(this.startingPositions).includes(position);
    }

    getStartingPositionPlayer(position) {
        for (let player in this.startingPositions) {
            if (this.startingPositions[player] === position) {
                return player;
            }
        }
        return null;
    }

    isHomePath(position) {
        for (let player in this.homePaths) {
            if (this.homePaths[player].includes(position)) {
                return true;
            }
        }
        return false;
    }

    getHomePathPlayer(position) {
        for (let player in this.homePaths) {
            if (this.homePaths[player].includes(position)) {
                return player;
            }
        }
        return null;
    }

    initializePieces() {
        // Initialize 4 pieces for each player in their home area
        for (let player = 1; player <= 4; player++) {
            this.players[player].pieces = [];
            for (let i = 0; i < 4; i++) {
                this.players[player].pieces.push({
                    id: `p${player}-${i}`,
                    position: -1, // -1 means in home area
                    pathIndex: -1,
                    inHomePath: false,
                    finished: false
                });
            }
        }
        this.renderPieces();
    }

    renderPieces() {
        // Clear all pieces
        document.querySelectorAll('.piece').forEach(piece => piece.remove());
        
        for (let player = 1; player <= 4; player++) {
            this.players[player].pieces.forEach((piece, index) => {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece player-${player}`;
                pieceElement.dataset.pieceId = piece.id;
                pieceElement.addEventListener('click', (e) => this.handlePieceClick(e));
                
                if (piece.position === -1) {
                    // Piece is in home area
                    const homeAreaPositions = this.homeAreas[player];
                    const homePosition = homeAreaPositions[index];
                    const cell = document.querySelector(`[data-position="${homePosition}"]`);
                    if (cell) {
                        cell.appendChild(pieceElement);
                    }
                } else if (piece.finished) {
                    // Piece is in center (finished)
                    const centerCell = document.querySelector(`[data-position="${this.centerPosition}"]`);
                    if (centerCell) {
                        centerCell.appendChild(pieceElement);
                    }
                } else {
                    // Piece is on the board
                    const cell = document.querySelector(`[data-position="${piece.position}"]`);
                    if (cell) {
                        cell.appendChild(pieceElement);
                    }
                }
            });
        }
    }

    setupEventListeners() {
        document.getElementById('roll-dice').addEventListener('click', () => this.rollDice());
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('new-game-modal').addEventListener('click', () => this.newGame());
        document.getElementById('end-turn').addEventListener('click', () => this.endTurn());
    }

    rollDice() {
        if (this.gameState !== 'waiting') return;
        
        const diceElement = document.getElementById('dice');
        const diceFace = document.getElementById('dice-face');
        const rollButton = document.getElementById('roll-dice');
        
        // Animate dice rolling
        diceElement.classList.add('rolling');
        rollButton.disabled = true;
        
        setTimeout(() => {
            this.diceValue = Math.floor(Math.random() * 6) + 1;
            diceFace.textContent = this.diceValue;
            document.getElementById('dice-result').textContent = `Roll: ${this.diceValue}`;
            
            diceElement.classList.remove('rolling');
            this.gameState = 'rolled';
            
            this.logMessage(`${this.players[this.currentPlayer].name} rolled ${this.diceValue}`);
            this.highlightMovablePieces();
            
            // Check if player can move any pieces
            if (!this.canMoveAnyPiece()) {
                this.logMessage(`${this.players[this.currentPlayer].name} cannot move any pieces.`);
                setTimeout(() => this.endTurn(), 1500);
            }
        }, 500);
    }

    canMoveAnyPiece() {
        const player = this.players[this.currentPlayer];
        
        for (let piece of player.pieces) {
            if (piece.finished) continue;
            
            if (piece.position === -1) {
                // Can only leave home with 5 or 6
                if (this.diceValue === 5 || this.diceValue === 6) {
                    return true;
                }
            } else {
                // Check if piece can move on the path
                if (this.canMovePiece(piece)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    canMovePiece(piece) {
        if (piece.finished) return false;
        
        if (piece.position === -1) {
            return this.diceValue === 5 || this.diceValue === 6;
        }
        
        if (piece.inHomePath) {
            const homePathIndex = this.homePaths[this.currentPlayer].indexOf(piece.position);
            return homePathIndex + this.diceValue <= this.homePaths[this.currentPlayer].length;
        }
        
        // Check if piece can move on main path
        const newPathIndex = piece.pathIndex + this.diceValue;
        if (newPathIndex >= Object.keys(this.paths).length) {
            // Moving to home path
            const overflow = newPathIndex - Object.keys(this.paths).length;
            return overflow < this.homePaths[this.currentPlayer].length;
        }
        
        return true;
    }

    highlightMovablePieces() {
        // Remove previous highlights
        document.querySelectorAll('.piece.selectable').forEach(piece => {
            piece.classList.remove('selectable');
        });
        
        const player = this.players[this.currentPlayer];
        
        for (let piece of player.pieces) {
            if (this.canMovePiece(piece)) {
                const pieceElement = document.querySelector(`[data-piece-id="${piece.id}"]`);
                if (pieceElement) {
                    pieceElement.classList.add('selectable');
                }
            }
        }
    }

    handlePieceClick(event) {
        if (this.gameState !== 'rolled') return;
        
        const pieceId = event.target.dataset.pieceId;
        const [, playerId] = pieceId.split('-');
        
        if (parseInt(playerId) !== this.currentPlayer) return;
        
        const piece = this.players[this.currentPlayer].pieces.find(p => p.id === pieceId);
        if (!piece || !this.canMovePiece(piece)) return;
        
        this.movePiece(piece);
    }

    handleCellClick(event) {
        // This can be used for additional cell interactions if needed
    }

    movePiece(piece) {
        const oldPosition = piece.position;
        const pieceElement = document.querySelector(`[data-piece-id="${piece.id}"]`);
        let newPosition;
        let isFinishing = false;
        
        // Calculate new position
        if (piece.position === -1) {
            // Moving from home to starting position
            newPosition = this.startingPositions[this.currentPlayer];
            piece.pathIndex = this.getPathIndexFromPosition(newPosition);
            this.players[this.currentPlayer].homePieces--;
        } else if (piece.inHomePath) {
            // Moving in home path
            const currentHomeIndex = this.homePaths[this.currentPlayer].indexOf(piece.position);
            const newHomeIndex = currentHomeIndex + this.diceValue;
            
            if (newHomeIndex >= this.homePaths[this.currentPlayer].length) {
                // Piece finishes
                isFinishing = true;
                piece.finished = true;
                newPosition = this.centerPosition;
                this.players[this.currentPlayer].finishedPieces++;
                this.logMessage(`${this.players[this.currentPlayer].name} finished a piece!`);
            } else {
                newPosition = this.homePaths[this.currentPlayer][newHomeIndex];
            }
        } else {
            // Moving on main path
            const newPathIndex = piece.pathIndex + this.diceValue;
            
            if (newPathIndex >= Object.keys(this.paths).length) {
                // Moving to home path
                const overflow = newPathIndex - Object.keys(this.paths).length;
                newPosition = this.homePaths[this.currentPlayer][overflow];
                piece.inHomePath = true;
                piece.pathIndex = -1;
            } else {
                piece.pathIndex = newPathIndex;
                newPosition = this.paths[newPathIndex];
            }
        }
        
        // Animate the movement
        this.animatePieceMovement(piece, oldPosition, newPosition, isFinishing, () => {
            // Update piece position after animation
            piece.position = newPosition;
            
            // Check for captures after movement
            const capturedSomething = this.checkForCapture(piece);
            
            this.renderPieces();
            this.updateUI();
            
            // Check for win condition
            if (this.players[this.currentPlayer].finishedPieces === 4) {
                setTimeout(() => this.endGame(), 500);
                return;
            }
            
            // Give extra turn for rolling 6 or capturing
            if (this.diceValue === 6 || capturedSomething) {
                if (this.diceValue === 6) {
                    this.logMessage(`${this.players[this.currentPlayer].name} gets another turn for rolling 6!`);
                }
                this.gameState = 'waiting';
                document.getElementById('roll-dice').disabled = false;
            } else {
                setTimeout(() => this.endTurn(), 300);
            }
        });
    }

    animatePieceMovement(piece, oldPosition, newPosition, isFinishing, callback) {
        const pieceElement = document.querySelector(`[data-piece-id="${piece.id}"]`);
        if (!pieceElement) return;

        // Disable interactions during animation
        this.gameState = 'moving';
        document.getElementById('roll-dice').disabled = true;
        
        // Create path for multi-step animation
        const movementPath = this.calculateMovementPath(oldPosition, newPosition, piece);
        
        this.animateAlongPath(pieceElement, movementPath, 0, isFinishing, callback);
    }

    calculateMovementPath(oldPosition, newPosition, piece) {
        const path = [];
        
        if (oldPosition === -1) {
            // Moving from home to starting position
            path.push(newPosition);
        } else if (this.diceValue === 1) {
            // Single step movement
            path.push(newPosition);
        } else {
            // Multi-step movement
            if (piece.inHomePath || (piece.pathIndex + this.diceValue >= Object.keys(this.paths).length)) {
                // Handle home path movement
                let currentPos = oldPosition;
                for (let i = 1; i <= this.diceValue; i++) {
                    if (piece.inHomePath) {
                        const homePathIndex = this.homePaths[this.currentPlayer].indexOf(currentPos);
                        if (homePathIndex + 1 < this.homePaths[this.currentPlayer].length) {
                            currentPos = this.homePaths[this.currentPlayer][homePathIndex + 1];
                            path.push(currentPos);
                        } else {
                            path.push(this.centerPosition);
                            break;
                        }
                    } else {
                        const currentPathIndex = this.getPathIndexFromPosition(currentPos);
                        const nextPathIndex = currentPathIndex + 1;
                        
                        if (nextPathIndex >= Object.keys(this.paths).length) {
                            // Enter home path
                            const homePathPos = this.homePaths[this.currentPlayer][0];
                            path.push(homePathPos);
                            currentPos = homePathPos;
                            piece.inHomePath = true;
                        } else {
                            currentPos = this.paths[nextPathIndex];
                            path.push(currentPos);
                        }
                    }
                }
            } else {
                // Normal path movement
                const startPathIndex = piece.pathIndex;
                for (let i = 1; i <= this.diceValue; i++) {
                    const nextPathIndex = startPathIndex + i;
                    path.push(this.paths[nextPathIndex]);
                }
            }
        }
        
        return path;
    }

    animateAlongPath(pieceElement, path, pathIndex, isFinishing, callback) {
        if (pathIndex >= path.length) {
            // Animation complete
            pieceElement.classList.remove('moving', 'jumping', 'entering');
            if (isFinishing) {
                pieceElement.classList.add('finishing');
                setTimeout(() => {
                    pieceElement.classList.remove('finishing');
                    callback();
                }, 1200);
            } else {
                callback();
            }
            return;
        }

        const targetPosition = path[pathIndex];
        const targetCell = document.querySelector(`[data-position="${targetPosition}"]`);
        
        if (!targetCell) {
            callback();
            return;
        }

        // Add movement classes
        pieceElement.classList.add('moving');
        
        // Special animation for entering the game from home
        if (pathIndex === 0 && path.length === 1) {
            pieceElement.classList.add('entering');
        } else if (pathIndex > 0) {
            pieceElement.classList.add('jumping');
        }

        // Highlight the path
        targetCell.classList.add('path-highlight');
        setTimeout(() => {
            targetCell.classList.remove('path-highlight');
        }, 600);

        // Move piece to target cell
        targetCell.appendChild(pieceElement);

        // Continue to next position with appropriate timing
        const delay = (pathIndex === 0 && path.length === 1) ? 800 : 400;
        setTimeout(() => {
            pieceElement.classList.remove('jumping', 'entering');
            this.animateAlongPath(pieceElement, path, pathIndex + 1, isFinishing, callback);
        }, delay);
    }

    getPathIndexFromPosition(position) {
        for (let index in this.paths) {
            if (this.paths[index] === position) {
                return parseInt(index);
            }
        }
        return -1;
    }

    checkForCapture(movingPiece) {
        // Skip capture check if on safe spot or in home path/area
        if (this.safeSpots.includes(movingPiece.position) || 
            movingPiece.inHomePath || 
            movingPiece.finished ||
            this.isHomeArea(movingPiece.position)) {
            return false;
        }
        
        // Check if any opponent pieces are on the same position
        for (let player = 1; player <= 4; player++) {
            if (player === this.currentPlayer) continue;
            
            for (let piece of this.players[player].pieces) {
                if (piece.position === movingPiece.position && !piece.finished) {
                    // Animate the capture
                    this.animateCapture(piece, () => {
                        // Capture the piece after animation
                        piece.position = -1;
                        piece.pathIndex = -1;
                        piece.inHomePath = false;
                        this.players[player].homePieces++;
                        this.renderPieces();
                        this.updateUI();
                    });
                    
                    this.logMessage(`${this.players[this.currentPlayer].name} captured ${this.players[player].name}'s piece!`);
                    return true;
                }
            }
        }
        return false;
    }

    animateCapture(capturedPiece, callback) {
        const pieceElement = document.querySelector(`[data-piece-id="${capturedPiece.id}"]`);
        if (!pieceElement) {
            callback();
            return;
        }

        // Add capture animation
        pieceElement.classList.add('captured');
        
        // After animation, move piece back to home
        setTimeout(() => {
            pieceElement.classList.remove('captured');
            callback();
        }, 1000);
    }

    endTurn() {
        // Clear piece highlights
        document.querySelectorAll('.piece.selectable').forEach(piece => {
            piece.classList.remove('selectable');
        });
        
        // Move to next player
        this.currentPlayer = (this.currentPlayer % 4) + 1;
        this.gameState = 'waiting';
        this.diceValue = 0;
        
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('dice-result').textContent = 'Roll: -';
        
        this.updateUI();
        this.logMessage(`${this.players[this.currentPlayer].name}'s turn.`);
    }

    updateUI() {
        // Update current player display
        document.getElementById('current-player-name').textContent = this.players[this.currentPlayer].name;
        
        // Update player info panels
        for (let player = 1; player <= 4; player++) {
            const playerPanel = document.querySelector(`.player-${player}`);
            if (player === this.currentPlayer) {
                playerPanel.classList.add('active');
            } else {
                playerPanel.classList.remove('active');
            }
            
            document.getElementById(`p${player}-home`).textContent = this.players[player].homePieces;
            document.getElementById(`p${player}-finished`).textContent = this.players[player].finishedPieces;
        }
        
        // Update button states
        document.getElementById('end-turn').disabled = this.gameState === 'waiting';
    }

    endGame() {
        this.gameState = 'ended';
        document.getElementById('roll-dice').disabled = true;
        document.getElementById('end-turn').disabled = true;
        
        document.getElementById('winner-text').textContent = `${this.players[this.currentPlayer].name} Wins!`;
        document.getElementById('winner-modal').style.display = 'block';
        
        this.logMessage(`🎉 ${this.players[this.currentPlayer].name} wins the game! 🎉`);
    }

    newGame() {
        // Hide modal
        document.getElementById('winner-modal').style.display = 'none';
        
        // Reset game state
        this.currentPlayer = 1;
        this.diceValue = 0;
        this.gameState = 'waiting';
        
        // Reset players
        for (let player = 1; player <= 4; player++) {
            this.players[player].homePieces = 4;
            this.players[player].finishedPieces = 0;
        }
        
        // Clear game log
        document.getElementById('game-log').innerHTML = '';
        
        // Reinitialize
        this.initializePieces();
        this.updateUI();
        
        document.getElementById('roll-dice').disabled = false;
        document.getElementById('dice-result').textContent = 'Roll: -';
        document.getElementById('dice-face').textContent = '1';
        
        this.logMessage("New game started! Player 1's turn.");
    }

    logMessage(message) {
        const gameLog = document.getElementById('game-log');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        gameLog.appendChild(logEntry);
        gameLog.scrollTop = gameLog.scrollHeight;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.parchisiGame = new ParchisiGame();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && window.parchisiGame && window.parchisiGame.gameState === 'waiting') {
        event.preventDefault();
        window.parchisiGame.rollDice();
    }
});