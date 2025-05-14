let wallet = 9999, bet = 100, mines = 3, bonus = 1.20, grid = [], isGameStarted = false, revealedCells = 0, multiplier = 1.00, firstSafeClick = false, firstClickIndex = null, correctClicks = 0, gameMode = localStorage.getItem('gameMode') || 'random';

function setGameMode(mode) {
    gameMode = mode;
    localStorage.setItem('gameMode', mode);
    Swal.fire({
        title: 'Modo Alterado!',
        text: `Modo de jogo definido para: ${mode === 'alwaysWin' ? 'Sempre Ganhar' : mode === 'alwaysLose' ? 'Sempre Perder' : 'Aleatório'}`,
        icon: 'success',
        confirmButtonText: 'Ok'
    });
}

function createGrid() {
    const gridContainer = $('#grid');
    gridContainer.empty();
    grid = [];

    // Cria 5 linhas (cada uma com 5 colunas)
    for (let row = 0; row < 5; row++) {
        const rowDiv = $('<div class="row justify-content-center no-gutters"></div>');

        for (let col = 0; col < 5; col++) {
            const index = row * 5 + col;
            const cell = $('<div></div>')
                .addClass('cell hidden d-flex justify-content-center align-items-center')
                .css({
                    width: '60px',
                    height: '60px',
                    margin: '5px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '8px'
                })
                .html('💎')
                .data('index', index)
                .click(() => handleCellClick(cell));

            rowDiv.append(cell);
            grid.push({ cell, isMine: false, isRevealed: false });
        }

        gridContainer.append(rowDiv);
    }
}


function calculateMineProbability() {
    let probability = 0.30 + (correctClicks * 0.10);
    if (correctClicks >= 2) probability = Math.min(probability, 0.80);
    if (correctClicks >= 3) probability = Math.min(probability, 0.90);
    if (correctClicks >= 4) probability = Math.min(probability, 0.99);
    return probability;
}

let safeClicksRemaining = 21;

function placeMines() {
    let minesPlaced = 0;
    grid.forEach(cell => { cell.isMine = false; });

    if (gameMode === 'alwaysWin') {
        const safeCells = [];
        for (let i = 0; i < grid.length; i++) {
            if (i !== firstClickIndex) {
                safeCells.push(i);
            }
        }

        if (safeClicksRemaining <= 0) {
            while (minesPlaced < mines) {
                const randomIndex = safeCells[Math.floor(Math.random() * safeCells.length)];
                if (!grid[randomIndex].isMine) {
                    grid[randomIndex].isMine = true;
                    minesPlaced++;
                }
            }
        }

    } else if (gameMode === 'alwaysLose') {
        grid.forEach(cell => { cell.isMine = true; });
        minesPlaced = grid.length;
        safeClicksRemaining = 0;

    } else {
        const probability = calculateMineProbability();
        while (minesPlaced < mines) {
            const randomIndex = Math.floor(Math.random() * 25);
            if (!grid[randomIndex].isMine && Math.random() < probability) {
                grid[randomIndex].isMine = true;
                minesPlaced++;
            }
            if (revealedCells >= 3) {
                if (Math.random() < 0.95) {
                    const randomIndex = Math.floor(Math.random() * 25);
                    if (!grid[randomIndex].isMine) {
                        grid[randomIndex].isMine = true;
                        minesPlaced++;
                    }
                }
            }
        }
    }
}

// Código anterior permanece o mesmo...

function createGrid() {
    const gridContainer = $('#grid');
    gridContainer.empty();
    grid = [];

    // Cria 5 linhas (cada uma com 5 colunas)
    for (let row = 0; row < 5; row++) {
        const rowDiv = $('<div class="row justify-content-center no-gutters"></div>');

        for (let col = 0; col < 5; col++) {
            const index = row * 5 + col;
            const cell = $('<div></div>')
                .addClass('cell hidden d-flex justify-content-center align-items-center')
                .css({
                    width: '60px',
                    height: '60px',
                    margin: '5px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '8px'
                })
                .html('💎')
                .data('index', index)
                .click(() => handleCellClick(cell));

            rowDiv.append(cell);
            grid.push({ cell, isMine: false, isRevealed: false });
        }

        gridContainer.append(rowDiv);
    }
}

function handleCellClick(cell) {
    if (!isGameStarted) return;
    const index = cell.data('index'), currentCell = grid[index];
    if (currentCell.isRevealed) return;

    if (firstClickIndex === null) {
        firstClickIndex = index;
        placeMines();
    }

    currentCell.isRevealed = true;

    if (safeClicksRemaining > 0) {
        safeClicksRemaining--;
        currentCell.isMine = false;
    }

    if (currentCell.isMine) {
        cell.addClass('mine').removeClass('hidden');
        Swal.fire({
            title: 'Game Over!',
            text: 'Você pegou uma mina! Perdeu sua aposta.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        endGame();
    } else {
        revealedCells++;
        multiplier = Math.min(multiplier + 0.20, 5.00);
        cell.addClass('revealed safe').removeClass('hidden').html('✅'); // Alterado para mostrar ✅
        $('#play-btn').text(`Resgatar R$${(bet * multiplier).toFixed(2)}`).removeClass('button-play').addClass('button-rescue');
        if (!firstSafeClick) firstSafeClick = true;

        if (revealedCells === 25 - mines) {
            wallet += bet * multiplier;
            Swal.fire({
                title: 'Você Ganhou!',
                text: 'Parabéns! Você encontrou todas as células seguras.',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
            endGame();
        }
    }
}

function updateWallet() {
    $('#wallet').text(`R$ ${wallet}`);
    $('#bet').text(`R$ ${bet}`);
}

function changeBet(amount) {
    const newBet = bet + amount;
    if (newBet >= 0 && newBet <= wallet) {
        bet = newBet;
        updateWallet();
    }
}

function toggleBetButtons(show) {
    if (show) {
        $('.bet-buttons button').show().prop('disabled', false);
    } else {
        $('.bet-buttons button').hide().prop('disabled', true);
    }
}

function startGame() {
    if (isGameStarted) {
        if (!firstSafeClick) {
            Swal.fire({
                title: 'Erro!',
                text: 'Você precisa clicar em pelo menos um quadrado seguro antes de resgatar!',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }
    
        // Jogo em andamento e jogador quer resgatar
        const resgatado = (bet * multiplier).toFixed(2);
        wallet += bet * multiplier;
    
        Swal.fire({
            title: 'Sucesso!',
            text: `Você resgatou R$${resgatado} com sucesso!`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    
        endGame();
    } else {
        if (bet <= 0) {
            Swal.fire({
                title: 'Erro!',
                text: 'Você precisa apostar antes de jogar!',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        wallet -= bet;
        isGameStarted = true;
        revealedCells = 0;
        multiplier = 1.00;

        $('#game-status')
            .text('Partida em andamento! Boa sorte!')
            .removeClass('game-inactive')
            .addClass('game-active');

        // Atualiza texto do botão para orientar o jogador
        $('#play-btn')
            .text("Clique em uma célula")
            .removeClass('button-rescue')
            .addClass('button-play');

        createGrid();
        updateWallet();
        toggleBetButtons(false);
    }
}


function endGame() {
    isGameStarted = false;
    revealedCells = 0;
    multiplier = 1.00;
    firstSafeClick = false;
    firstClickIndex = null;
    $('#play-btn').text('Jogar').removeClass('button-rescue').addClass('button-play');
    $('#game-status').text('Aguardando início da partida...').removeClass('game-active').addClass('game-inactive');
    updateWallet();
    toggleBetButtons(true);
    createGrid();
}

updateWallet();
createGrid();