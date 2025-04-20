// Define o modo inicial do jogo como 'random' (aleatório)
let mode = 'random';

// Estado inicial do jogo, com carteira (saldo), número de vitórias e se o jogo está rodando
let state = { carteira: 9999, wins: 0, rodando: false };

// Símbolos que aparecem nos slots
const symbols = ['🪙', '🍒', '🐯', '💎', '💰', '🍀'];

// Função para exibir feedback visual de vitória (confetes e texto)
function displayVictoryFeedback() {
    confetti({
        particleCount: 100, // Quantidade de confetes
        spread: 70, // Espalhamento dos confetes
        origin: { y: 0.6 } // Origem dos confetes na tela
    });
    const resultadoElement = document.getElementById('resultado');
    resultadoElement.classList.add('victory-text'); // Adiciona classe CSS para estilo de vitória
    resultadoElement.textContent = "GRANDE PRÊMIO!"; // Exibe mensagem de vitória
}

// Função para exibir feedback visual de perda (overlay com fade)
function displayLossFeedback() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex'; // Exibe o overlay
    setTimeout(() => {
        overlay.style.opacity = 1; // Faz o overlay aparecer gradualmente
    }, 10);
    setTimeout(() => {
        overlay.style.opacity = 0; // Faz o overlay desaparecer gradualmente
    }, 2500);
    setTimeout(() => {
        overlay.style.display = 'none'; // Esconde o overlay após o fade
    }, 2500);
}

// Função para definir o modo do jogo (win, lose, random)
function setMode(newMode) {
    mode = newMode; // Atualiza o modo
    // Remove a classe 'active-mode' de todos os botões
    document.querySelectorAll('.row.mt-3 button').forEach(btn => btn.classList.remove('active-mode'));
    // Adiciona a classe 'active-mode' ao botão correspondente ao modo selecionado
    document.getElementById(`btn-${newMode}`).classList.add('active-mode');
}

// Função para ajustar o valor da aposta
function adjustBet(amount) {
    const aposta = document.getElementById('aposta');
    // Ajusta o valor da aposta, garantindo que fique entre 10 e o saldo disponível
    aposta.value = Math.max(10, Math.min(parseInt(aposta.value) + amount, state.carteira));
}

// Função para atualizar a interface do usuário (saldo e número de vitórias)
function updateUI() {
    document.getElementById('carteira').textContent = `R$ ${state.carteira.toFixed(2)}`; // Atualiza o saldo
    document.getElementById('wins').textContent = state.wins; // Atualiza o número de vitórias
}

// Função para verificar se há uma combinação vencedora
function checkWin(results, aposta) {
    let winAmount = 0;
    // Define as linhas possíveis para vitória (horizontal, vertical, diagonal)
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    // Verifica cada linha para ver se há 3 símbolos iguais
    lines.forEach(line => {
        const [a, b, c] = line;
        if (results[a] === results[b] && results[b] === results[c]) {
            winAmount += aposta * 5; // Calcula o valor do prêmio
        }
    });
    return winAmount; // Retorna o valor total ganho
}

// Função para gerar resultados que garantem uma vitória
function generateWinResults() {
    const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)]; // Escolhe um símbolo aleatório
    return Array(9).fill(winningSymbol); // Preenche todos os slots com o mesmo símbolo
}

// Função para gerar resultados que garantem uma perda
function generateLoseResults() {
    let results = [];
    while (results.length < 9) {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]; // Escolhe um símbolo aleatório
        // Garante que não haja 3 símbolos iguais
        if (results.filter(s => s === randomSymbol).length < 2) {
            results.push(randomSymbol); // Adiciona o símbolo aos resultados
        }
    }
    return results;
}

// Função para gerar resultados aleatórios
function generateRandomResults() {
    return Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]); // Gera 9 símbolos aleatórios
}

// Função principal que roda o jogo
function spin() {
    if (state.rodando) return; // Impede que o jogo rode se já estiver em andamento
    const aposta = parseInt(document.getElementById('aposta').value); // Obtém o valor da aposta
    if (aposta > state.carteira) {
        document.getElementById('resultado').textContent = "Saldo insuficiente!"; // Verifica se o saldo é suficiente
        return;
    }
    state.rodando = true; // Marca o jogo como em andamento
    state.carteira -= aposta; // Subtrai a aposta do saldo
    updateUI(); // Atualiza a interface do usuário
    const slots = document.querySelectorAll('.slot-item'); // Obtém todos os slots
    let spins = 0;
    // Animação dos slots girando
    const spinInterval = setInterval(() => {
        slots.forEach(slot => slot.textContent = symbols[Math.floor(Math.random() * symbols.length)]); // Atualiza os símbolos dos slots
        if (spins++ > 20) clearInterval(spinInterval); // Para a animação após 20 rodadas
    }, 50);
    // Após 2 segundos, define os resultados finais
    setTimeout(() => {
        let results;
        if (mode === 'win') {
            results = generateWinResults(); // Gera resultados que garantem vitória
        } else if (mode === 'lose') {
            results = generateLoseResults(); // Gera resultados que garantem perda
        } else {
            results = generateRandomResults(); // Gera resultados aleatórios
        }
        slots.forEach((slot, index) => slot.textContent = results[index]); // Atualiza os slots com os resultados finais
        const ganho = checkWin(results, aposta); // Verifica se houve vitória
        if (ganho > 0) {
            state.carteira += ganho; // Adiciona o ganho ao saldo
            state.wins++; // Incrementa o número de vitórias
            document.getElementById('resultado').textContent = `🎉 Ganhou R$ ${ganho.toFixed(2)}!`; // Exibe mensagem de vitória
            displayVictoryFeedback(); // Exibe feedback visual de vitória (não usado no momento, talvez no futuro)
        } else {
            document.getElementById('resultado').textContent = "🎰Boa sorte!🍀"; // Exibe mensagem em caso de perda
            displayLossFeedback(); // Exibe feedback visual de perda
        }
        state.rodando = false; // Marca o jogo como não rodando
        updateUI(); // Atualiza a interface do usuário
    }, 2000);
}