// --- ESTADO DO USUÁRIO ---
let user = {
    name: '',
    imageDataUrl: '',
    points: 0,
    currentLevel: 0
};

let selectedNutrient = null;
let selectedFunction = null;
let pairsMatched = 0;

// --- DADOS DO JOGO (13 Fases Base) ---
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
    }
];

let gameData = [];

// --- NAVEGAÇÃO DE TELAS ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- NAVEGAÇÃO DO BOTÃO "COMEÇAR JOGO" ---
function goToProfile() {
    switchScreen('profile-screen');
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

// --- PERFIL E INÍCIO DO JOGO ---
function saveProfile() {
    const nameInput = document.getElementById('username').value.trim();
    if(!nameInput) {
        alert("Por favor, digite seu nome de agrônomo! (Obrigatório)");
        return;
    }
    user.name = nameInput;
    
    document.getElementById('display-name').innerText = user.name;
    
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
    
    switchScreen('game-screen');
    document.getElementById('mascot-container').style.display = 'flex';
    
    if(user.currentLevel === 0) {
        gameData = shuffleArray([...baseGameData]); 
        loadLevel(0);
    } else {
        setMascotText(`Perfil atualizado com sucesso, ${user.name}! Vamos continuar jogando!`);
    }
}

function editProfile() {
    document.getElementById('profile-title').innerText = "Editar Perfil";
    switchScreen('profile-screen');
    document.getElementById('mascot-container').style.display = 'none';
}

function restartGame() {
    user.points = 0;
    user.currentLevel = 0;
    document.getElementById('display-points').innerText = '0';
    
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
    pairsMatched = 0;
    selectedNutrient = null;
    selectedFunction = null;

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
    } else if (levelIndex === 6) {
        setMascotText(`Uau, ${user.name}! Já estamos na metade do caminho!`);
    }
}

function handleNutrientClick(element, id) {
    if(element.classList.contains('matched')) return;
    
    document.querySelectorAll('.nutrient-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedNutrient = { el: element, id: id };
    
    checkMatch();
}

function handleFunctionClick(element, id) {
    if(element.classList.contains('matched')) return;

    document.querySelectorAll('.function-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedFunction = { el: element, id: id };

    checkMatch();
}

function checkMatch() {
    if(selectedNutrient && selectedFunction) {
        if(selectedNutrient.id === selectedFunction.id) {
            selectedNutrient.el.classList.replace('selected', 'matched');
            selectedFunction.el.classList.replace('selected', 'matched');
            user.points += 20;
            document.getElementById('display-points').innerText = user.points;
            
            pairsMatched++;
            setMascotText(`Muito bem, ${user.name}! Conexão perfeita! 🌱`);

            selectedNutrient = null;
            selectedFunction = null;

            if(pairsMatched === gameData[user.currentLevel].pairs.length) {
                setTimeout(showReward, 500);
            }
        } else {
            selectedNutrient.el.classList.add('wrong');
            selectedFunction.el.classList.add('wrong');
            setMascotText(`Opa, ${user.name}, acho que essa não é a relação correta. Tente novamente!`);

            setTimeout(() => {
                selectedNutrient.el.classList.remove('wrong', 'selected');
                selectedFunction.el.classList.remove('wrong', 'selected');
                selectedNutrient = null;
                selectedFunction = null;
            }, 500);
        }
    }
}

function showReward() {
    user.points += 100;
    document.getElementById('display-points').innerText = user.points;
    
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
      
