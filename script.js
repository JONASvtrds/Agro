// --- ESTADO DO USUÁRIO ---
let user = {
    name: '',
    imageDataUrl: '',
    points: 0,
    currentLevel: 0,
    theme: 'light'
};

let totalPointsLost = 0; // Controla perdas da partida atual
let selectedNutrient = null;
let selectedFunction = null;
let pairsMatched = 0;
let isProcessing = false; // Flag para evitar spam de cliques

// --- DADOS DO JOGO (15 Fases Base) ---
const baseGameData = [
    {
        title: "Macronutrientes Primários",
        desc: "Esses são os que a planta mais precisa! Relacione com suas funções nas folhas.",
        pairs: [
            { id: 'N', name: 'Nitrogênio (N)', text: 'Deixa as folhas verde-escuras e ajuda no crescimento rápido.' },
            { id: 'P', name: 'Fósforo (P)', text: 'Essencial para a energia da célula. Falta deixa folhas arroxeadas.' },
            { id: 'K', name: 'Potássio (K)', text: 'Regula a abertura dos estômatos e dá resistência contra secas.' }
        ]
    },
    {
        title: "Macronutrientes Secundários",
        desc: "Importantes para a estrutura celular e fotossíntese.",
        pairs: [
            { id: 'Ca', name: 'Cálcio (Ca)', text: 'Forma a "parede" das células. Falta queima as bordas das folhas novas.' },
            { id: 'Mg', name: 'Magnésio (Mg)', text: 'Fica no centro da clorofila! Falta causa amarelecimento entre as nervuras.' },
            { id: 'S', name: 'Enxofre (S)', text: 'Ajuda na formação de proteínas. Falta deixa as folhas novas verde-claras.' }
        ]
    },
    {
        title: "Micronutrientes (Parte 1)",
        desc: "A planta precisa em pouca quantidade, mas sem eles, ela sofre!",
        pairs: [
            { id: 'Fe', name: 'Ferro (Fe)', text: 'A falta deixa as folhas novas totalmente amarelas, mas as nervuras continuam verdes.' },
            { id: 'Zn', name: 'Zinco (Zn)', text: 'Falta causa "encurtamento" dos galhos e folhas pequenas (roseta).' },
            { id: 'B', name: 'Boro (B)', text: 'Falta causa morte das pontas e deixa folhas grossas e quebradiças.' }
        ]
    },
    {
        title: "Micronutrientes (Parte 2)",
        desc: "Mais heróis invisíveis atuando na fisiologia da folha.",
        pairs: [
            { id: 'Mn', name: 'Manganês (Mn)', text: 'Falta causa clorose reticulada em folhas novas (fundo amarelo com veias verdes claras).' },
            { id: 'Cu', name: 'Cobre (Cu)', text: 'Falta deixa folhas novas retorcidas, deformadas e com cor verde muito escura.' },
            { id: 'Mo', name: 'Molibdênio (Mo)', text: 'Deficiência imita a falta de Nitrogênio, causando queima nas margens das folhas mais velhas.' }
        ]
    },
    {
        title: "Elementos Benéficos",
        desc: "Não são vitais para todas, mas dão superpoderes às plantas.",
        pairs: [
            { id: 'Si', name: 'Silício (Si)', text: 'Acumula na epiderme da folha, deixando-a mais grossa, ereta e resistente a fungos.' },
            { id: 'Co', name: 'Cobalto (Co)', text: 'Essencial para a fixação de N nas leguminosas, garantindo folhas super verdes.' },
            { id: 'Ni', name: 'Níquel (Ni)', text: 'Previne o acúmulo tóxico de ureia nas folhas, evitando pontas necrosadas.' }
        ]
    },
    {
        title: "Toxicidade Foliar (Excesso)",
        desc: "Tudo em excesso faz mal! Identifique os sintomas de toxidez.",
        pairs: [
            { id: 'ExcB', name: 'Excesso de Boro', text: 'Queimadura severa (necrose) nas bordas das folhas mais velhas.' },
            { id: 'ExcN', name: 'Excesso de Nitrogênio', text: 'Folhas gigantes, verde muito escuro, tecido fraco e tombamento da planta.' },
            { id: 'ExcMn', name: 'Excesso de Manganês', text: 'Aparecimento de pontuações marrons a pretas espalhadas pelas folhas velhas.' }
        ]
    },
    {
        title: "Padrões Visuais Clássicos",
        desc: "Relacione o padrão visual clássico com sua causa.",
        pairs: [
            { id: 'AmV', name: 'Amarelecimento em formato de "V"', text: 'Sintoma clássico de deficiência de Nitrogênio começando pela ponta da folha velha.' },
            { id: 'CloInt', name: 'Clorose Intervenal', text: 'Típico de falta de Magnésio nas folhas mais velhas (nervura verde, resto amarelo).' },
            { id: 'Roxo', name: 'Coloração Arroxeada', text: 'Acúmulo de antocianina devido à falta de Fósforo ou estresse por frio.' }
        ]
    },
    {
        title: "Mobilidade na Planta",
        desc: "Onde o sintoma aparece depende se o nutriente anda ou não na planta.",
        pairs: [
            { id: 'Moveis', name: 'Sintoma em Folhas Velhas', text: 'Nutrientes móveis (N, P, K, Mg) que "fogem" para salvar as folhas novas.' },
            { id: 'Imoveis', name: 'Sintoma em Folhas Novas', text: 'Nutrientes imóveis (Ca, S, B, Fe) que ficam travados e não chegam no broto.' },
            { id: 'MorteApical', name: 'Morte da Gema Apical', text: 'Falta severa de nutrientes imóveis críticos para divisão celular (Cálcio ou Boro).' }
        ]
    },
    {
        title: "Papel Bioquímico",
        desc: "O que acontece dentro das células da folha?",
        pairs: [
            { id: 'AtomoMg', name: 'Átomo Central', text: 'O Magnésio é a "peça central" que forma a molécula de Clorofila.' },
            { id: 'Estomato', name: 'Bomba Osmótica', text: 'O Potássio entra e sai das células-guarda para abrir e fechar os estômatos.' },
            { id: 'Parede', name: 'Cimento Celular', text: 'O Cálcio atua como pectato de cálcio, colando uma célula da folha na outra.' }
        ]
    },
    {
        title: "Mais Micronutrientes",
        desc: "Essenciais em doses minúsculas.",
        pairs: [
            { id: 'Cl', name: 'Cloro (Cl)', text: 'Sua falta causa murcha abrupta das pontas das folhas, seguida de clorose e bronzeamento.' },
            { id: 'Zn2', name: 'Zinco (Zn) - Hormônios', text: 'Sua deficiência inibe a auxina, causando folhas pequenas e galhos curtos (roseta).' },
            { id: 'Fe2', name: 'Ferro (Fe) - Severo', text: 'Em casos extremos de falta, as folhas novas nascem completamente brancas.' }
        ]
    },
    {
        title: "Interações Nutricionais",
        desc: "Um nutriente atrapalhando ou ajudando o outro.",
        pairs: [
            { id: 'AntKMg', name: 'Antagonismo K vs Mg', text: 'Excesso de Potássio no solo bloqueia a entrada de Magnésio, amarelando as folhas velhas.' },
            { id: 'SinNMg', name: 'Sinergismo N + Mg', text: 'Bons níveis de Nitrogênio ajudam a raiz a puxar mais Magnésio, esverdeando a planta.' },
            { id: 'Salin', name: 'Toxidez por Sódio (Na)', text: 'Competição com Potássio causa queima seca das bordas foliares e aspecto de murcha.' }
        ]
    },
    {
        title: "Funções Estruturais e Enzimáticas",
        desc: "O trabalho pesado da nutrição.",
        pairs: [
            { id: 'AtivK', name: 'Ativador Enzimático', text: 'O Potássio liga mais de 80 enzimas diferentes, fundamentais para a respiração da folha.' },
            { id: 'ProtNS', name: 'Formação de Proteínas', text: 'Nitrogênio e Enxofre se unem para formar os aminoácidos essenciais das folhas.' },
            { id: 'Membrana', name: 'Estabilidade da Membrana', text: 'O Cálcio evita que as membranas celulares das folhas "vazem" seus líquidos.' }
        ]
    },
    {
        title: "Sintomas Extremos e Nomes Clássicos",
        desc: "O terror dos agrônomos no campo.",
        pairs: [
            { id: 'WhiteBud', name: '"White Bud" no Milho', text: 'A gema branca crescendo no topo do milho indica deficiência aguda de Zinco.' },
            { id: 'CoracaoOco', name: 'Podridão Apical / Coração Negro', text: 'As folhas parecem normais, mas a falta de Cálcio apodrece a ponta do fruto ou interior do caule.' },
            { id: 'Whiptail', name: '"Whiptail" (Folha de Chicote)', text: 'Em couve-flor, a falta de Molibdênio faz a folha crescer fina como um chicote.' }
        ]
    },
    {
        title: "Correção de Solo e pH",
        desc: "O ambiente radicular perfeito para a planta.",
        pairs: [
            { id: 'Calcario', name: 'Calcário', text: 'Corrige a acidez do solo, eleva o pH e fornece Cálcio e Magnésio.' },
            { id: 'Gesso', name: 'Gesso Agrícola', text: 'Condicionador de subsolo. Não altera o pH, mas fornece Cálcio e Enxofre em profundidade.' },
            { id: 'Aluminio', name: 'Alumínio Tóxico', text: 'Inibe o crescimento das raízes em solos muito ácidos, sendo neutralizado pela calagem.' }
        ]
    },
    {
        title: "Fixação Biológica de Nitrogênio (FBN)",
        desc: "A magia da simbiose nas leguminosas.",
        pairs: [
            { id: 'Rizobio', name: 'Rizóbio', text: 'Bactéria do solo que forma nódulos nas raízes e captura Nitrogênio do ar.' },
            { id: 'LegHemo', name: 'Leg-hemoglobina', text: 'Proteína avermelhada que protege as bactérias do oxigênio dentro do nódulo.' },
            { id: 'MoCo', name: 'Molibdênio e Cobalto', text: 'Micronutrientes indispensáveis para que a enzima nitrogenase funcione no nódulo.' }
        ]
    }
];

let gameData = [];

// --- INICIALIZAÇÃO E LOCAL STORAGE ---
window.onload = () => {
    loadGameData();
    document.getElementById('total-levels').innerText = baseGameData.length;
};

function loadGameData() {
    const savedUser = localStorage.getItem('agroRootsUser');
    if (savedUser) {
        user = JSON.parse(savedUser);
        applyTheme();
    }
}

function saveGameData() {
    localStorage.setItem('agroRootsUser', JSON.stringify(user));
}

function saveHistory() {
    let history = JSON.parse(localStorage.getItem('agroRootsHistory')) || [];
    history.push({
        score: user.points,
        lost: totalPointsLost,
        date: new Date().toLocaleDateString()
    });
    // Ordena do maior para o menor
    history.sort((a, b) => b.score - a.score);
    localStorage.setItem('agroRootsHistory', JSON.stringify(history));
}

// --- NAVEGAÇÃO DE TELAS ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function startGame() {
    if (user.name) {
        // Já tem perfil salvo
        setupHeader();
        switchScreen('game-screen');
        document.getElementById('mascot-container').style.display = 'flex';
        
        if (user.currentLevel === 0) {
            gameData = shuffleArray([...baseGameData]); 
            loadLevel(0);
        } else if (user.currentLevel >= baseGameData.length) {
            restartGame();
        } else {
            // Continua de onde parou (simula recarregamento do array, idealmente seria salvo)
            gameData = shuffleArray([...baseGameData]);
            loadLevel(user.currentLevel);
            setMascotText(`Que bom te ver de volta, ${user.name}! Vamos continuar de onde paramos.`);
        }
    } else {
        // Primeira vez
        switchScreen('profile-screen');
        document.getElementById('btn-cancel-profile').style.display = 'none';
    }
}

// --- PROCESSAMENTO DA IMAGEM ---
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgPreview = document.getElementById('profile-img-preview');
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'block';
            document.getElementById('placeholder-icon').style.display = 'none';
            user.imageDataUrl = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// --- PERFIL E CONFIGURAÇÕES ---
function saveProfile() {
    const nameInput = document.getElementById('username').value.trim();
    if(!nameInput) {
        alert("Por favor, digite seu nome de agrônomo! (Obrigatório)");
        return;
    }
    user.name = nameInput;
    saveGameData();
    setupHeader();
    
    switchScreen('game-screen');
    document.getElementById('mascot-container').style.display = 'flex';
    
    if(user.currentLevel === 0 && pairsMatched === 0) {
        gameData = shuffleArray([...baseGameData]); 
        loadLevel(0);
    } else {
        setMascotText(`Perfil atualizado com sucesso, ${user.name}!`);
    }
}

function setupHeader() {
    document.getElementById('display-name').innerText = user.name;
    document.getElementById('display-points').innerText = user.points;
    const headerImg = document.getElementById('header-profile-img');
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    if(user.imageDataUrl) {
        headerImg.src = user.imageDataUrl;
        headerImg.style.display = 'block';
        headerPlaceholder.style.display = 'none';
    } else {
        headerImg.style.display = 'none';
        headerPlaceholder.style.display = 'block';
    }
}

function editProfile() {
    document.getElementById('profile-title').innerText = "Editar Perfil";
    document.getElementById('username').value = user.name;
    if(user.imageDataUrl) {
        document.getElementById('profile-img-preview').src = user.imageDataUrl;
        document.getElementById('profile-img-preview').style.display = 'block';
        document.getElementById('placeholder-icon').style.display = 'none';
    }
    document.getElementById('btn-cancel-profile').style.display = 'inline-block';
    switchScreen('profile-screen');
    document.getElementById('mascot-container').style.display = 'none';
}

function openSettings() {
    switchScreen('settings-screen');
    document.getElementById('mascot-container').style.display = 'none';
}

function closeSettings() {
    switchScreen('game-screen');
    document.getElementById('mascot-container').style.display = 'flex';
}

function goToSettings() {
    switchScreen('settings-screen');
}

function toggleTheme() {
    user.theme = user.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveGameData();
}

function applyTheme() {
    if(user.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
}

function viewHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    let history = JSON.parse(localStorage.getItem('agroRootsHistory')) || [];

    if(history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhuma partida registrada ainda.</p>';
    } else {
        history.forEach((match, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="rank">#${index + 1}</div>
                <div class="details">
                    <strong>${match.score} Pontos</strong><br>
                    <span style="color: var(--error-color); font-size: 0.8em;">-${match.lost} perdidos</span><br>
                    <span style="color: var(--text-muted); font-size: 0.8em;">${match.date}</span>
                </div>
            `;
            historyList.appendChild(div);
        });
    }
    switchScreen('history-screen');
    document.getElementById('mascot-container').style.display = 'none';
}

function resetProgress() {
    if(confirm("Tem certeza que deseja zerar seu progresso atual? Seu perfil e histórico serão mantidos.")) {
        user.points = 0;
        user.currentLevel = 0;
        totalPointsLost = 0;
        saveGameData();
        setupHeader();
        gameData = shuffleArray([...baseGameData]);
        closeSettings();
        loadLevel(0);
    }
}

function restartGame() {
    user.points = 0;
    user.currentLevel = 0;
    totalPointsLost = 0;
    document.getElementById('display-points').innerText = '0';
    saveGameData();
    
    document.querySelectorAll('.confetti-piece').forEach(el => el.remove());

    gameData = shuffleArray([...baseGameData]);
    
    switchScreen('game-screen');
    document.getElementById('mascot-container').style.display = 'flex';
    loadLevel(0);
}

// --- MASCOTE ---
function toggleMascot() {
    const bubble = document.getElementById('mascot-text');
    if(bubble.style.display === 'block') {
        bubble.style.display = 'none';
    } else {
        bubble.style.display = 'block';
        setTimeout(() => { bubble.style.display = 'none'; }, 5000);
    }
}

function setMascotText(text) {
    const bubble = document.getElementById('mascot-text');
    bubble.innerText = text;
    bubble.style.display = 'block';
    setTimeout(() => { bubble.style.display = 'none'; }, 5000);
}

// --- LÓGICA DO JOGO ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadLevel(levelIndex) {
    user.currentLevel = levelIndex;
    saveGameData();
    
    pairsMatched = 0;
    selectedNutrient = null;
    selectedFunction = null;
    isProcessing = false;

    document.getElementById('display-level').innerText = levelIndex + 1;
    
    const levelData = gameData[levelIndex];
    
    document.getElementById('level-title').innerText = `Fase ${levelIndex + 1}: ${levelData.title}`;
    document.getElementById('level-desc').innerText = levelData.desc;

    const colNutrients = document.getElementById('col-nutrients');
    const colFunctions = document.getElementById('col-functions');
    colNutrients.innerHTML = '<h3>Conceito</h3>';
    colFunctions.innerHTML = '<h3>Função / Sintoma</h3>';

    let nutrients = [...levelData.pairs];
    let functions = [...levelData.pairs];
    
    shuffleArray(nutrients);
    shuffleArray(functions);

    nutrients.forEach(item => {
        const div = document.createElement('div');
        div.className = 'game-card nutrient-card';
        div.innerText = item.name;
        div.onclick = () => handleNutrientClick(div, item.id);
        colNutrients.appendChild(div);
    });

    functions.forEach(item => {
        const div = document.createElement('div');
        div.className = 'game-card function-card';
        div.innerText = item.text;
        div.onclick = () => handleFunctionClick(div, item.id);
        colFunctions.appendChild(div);
    });

    if(levelIndex === 0) {
        setMascotText(`Vamos lá, ${user.name}! Clique em um conceito e tente achar a descrição certa na outra coluna!`);
    } else if (levelIndex === 7) {
        setMascotText(`Uau, ${user.name}! Já passamos da metade do caminho! Continue assim.`);
    }
}

function handleNutrientClick(element, id) {
    if(isProcessing || element.classList.contains('matched')) return;
    
    document.querySelectorAll('.nutrient-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedNutrient = { el: element, id: id };
    
    checkMatch();
}

function handleFunctionClick(element, id) {
    if(isProcessing || element.classList.contains('matched')) return;

    document.querySelectorAll('.function-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedFunction = { el: element, id: id };

    checkMatch();
}

function checkMatch() {
    if(selectedNutrient && selectedFunction) {
        if(selectedNutrient.id === selectedFunction.id) {
            // Acertou
            selectedNutrient.el.classList.replace('selected', 'matched');
            selectedFunction.el.classList.replace('selected', 'matched');
            user.points += 20;
            updatePointsDisplay();
            saveGameData();
            
            pairsMatched++;
            setMascotText(`Muito bem, ${user.name}! Conexão perfeita! 🌱`);

            selectedNutrient = null;
            selectedFunction = null;

            if(pairsMatched === gameData[user.currentLevel].pairs.length) {
                setTimeout(showReward, 500);
            }
        } else {
            // Errou
            isProcessing = true; // Trava cliques rápidos
            selectedNutrient.el.classList.add('wrong');
            selectedFunction.el.classList.add('wrong');
            
            setMascotText(`Opa, ${user.name}, acho que essa não é a relação correta. Você perdeu 10 pontos. Tente novamente!`);
            
            // Subtrai pontos (min 0)
            let previousPoints = user.points;
            user.points = Math.max(0, user.points - 10);
            let lostAmount = previousPoints - user.points;
            totalPointsLost += lostAmount;
            
            updatePointsDisplay();
            saveGameData();
            
            if(lostAmount > 0) {
                triggerPointLossAnimation(lostAmount);
            }

            setTimeout(() => {
                selectedNutrient.el.classList.remove('wrong', 'selected');
                selectedFunction.el.classList.remove('wrong', 'selected');
                selectedNutrient = null;
                selectedFunction = null;
                isProcessing = false; // Libera cliques
            }, 700); // 700ms de punição visual
        }
    }
}

function updatePointsDisplay() {
    document.getElementById('display-points').innerText = user.points;
}

function triggerPointLossAnimation(amount) {
    const animEl = document.getElementById('point-loss-anim');
    animEl.innerText = `-${amount}`;
    animEl.classList.remove('show');
    // Força reflow para reiniciar animação
    void animEl.offsetWidth; 
    animEl.classList.add('show');
}

function showReward() {
    user.points += 100;
    updatePointsDisplay();
    saveGameData();
    
    document.getElementById('reward-message').innerText = `Você dominou esses conhecimentos, ${user.name}!`;
    document.getElementById('reward-modal').style.display = 'flex';
}

function nextLevel() {
    document.getElementById('reward-modal').style.display = 'none';
    if(user.currentLevel + 1 < gameData.length) {
        loadLevel(user.currentLevel + 1);
    } else {
        triggerVictory();
    }
}

function triggerVictory() {
    document.getElementById('mascot-container').style.display = 'none';
    document.getElementById('victory-name').innerText = user.name;
    document.getElementById('victory-points').innerText = user.points + ' PONTOS';
    document.getElementById('victory-lost-points').innerText = totalPointsLost;
    
    saveHistory(); // Salva no histórico local

    switchScreen('victory-screen');
    generateConfetti();
}

function generateConfetti() {
    const colors = ['#fbc02d', '#2e7d32', '#d32f2f', '#1976d2', '#ffffff'];
    const screen = document.getElementById('victory-screen');

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');
        
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        const animDuration = Math.random() * 3 + 2; 
        const animDelay = Math.random() * 2; 
        
        confetti.style.animation = `fall ${animDuration}s linear ${animDelay}s infinite`;
        
        screen.appendChild(confetti);
    }
}
