// Efeitos visuais temáticos para Clash Royale

document.addEventListener('DOMContentLoaded', function() {
    // Adicionar animação aos botões
    const buttons = document.querySelectorAll('.clash-btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            playSound('click');
        });
    });
    
    // Adicionar som ao trocar de página
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            playSound('page');
            spawnCrowns();
        });
    });
    
    // Função para tocar sons temáticos
    function playSound(type) {
        // Se estivermos em um ambiente que suporta áudio
        if ('Audio' in window) {
            let sound;
            if (type === 'click') {
                // Som de clique de botão
                sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-click-1114.mp3');
            } else if (type === 'page') {
                // Som de troca de página
                sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3');
            }
            
            if (sound) {
                sound.volume = 0.3;
                sound.play().catch(e => {
                    // Ignorar erros de reprodução (comum em mobile)
                    console.log("Som não reproduzido: interação do usuário pode ser necessária primeiro");
                });
            }
        }
    }
    
    // Efeito de coroas caindo ao trocar de página
    function spawnCrowns() {
        const container = document.querySelector('.container');
        const crown = document.createElement('div');
        crown.className = 'falling-crown';
        
        // Posição aleatória horizontal
        const xPos = Math.random() * 100;
        crown.style.left = `${xPos}%`;
        
        // Tamanho aleatório
        const size = 20 + Math.random() * 30;
        crown.style.width = `${size}px`;
        crown.style.height = `${size}px`;
        
        // Cor aleatória (azul ou vermelho)
        const isBlue = Math.random() > 0.5;
        crown.style.backgroundImage = isBlue 
            ? 'url("https://static.wikia.nocookie.net/clashroyale/images/5/5a/CrownBlue.png")' 
            : 'url("https://static.wikia.nocookie.net/clashroyale/images/d/db/CrownRed.png")';
        
        container.appendChild(crown);
        
        // Remover depois da animação
        setTimeout(() => {
            if (crown.parentNode) {
                container.removeChild(crown);
            }
        }, 3000);
    }
    
    // Adicionar estilos CSS para as coroas caindo
    const style = document.createElement('style');
    style.textContent = `
        .falling-crown {
            position: absolute;
            top: -50px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 1000;
            pointer-events: none;
            animation: fall 3s linear forwards;
            opacity: 0.7;
        }
        
        @keyframes fall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0.7;
            }
            50% {
                opacity: 0.7;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Efeito de partículas de elixir no rodapé
    createElixirDrops();
    
    function createElixirDrops() {
        const footer = document.querySelector('footer');
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const drop = document.createElement('div');
                drop.className = 'elixir-drop';
                
                // Posição aleatória horizontal
                const xPos = 5 + Math.random() * 90;
                drop.style.left = `${xPos}%`;
                
                // Tamanho aleatório
                const size = 3 + Math.random() * 6;
                drop.style.width = `${size}px`;
                drop.style.height = `${size}px`;
                
                footer.appendChild(drop);
                
                // Remover depois da animação
                setTimeout(() => {
                    if (drop.parentNode) {
                        footer.removeChild(drop);
                    }
                }, 2000);
            }, i * 200);
        }
        
        // Repetir a cada 5 segundos
        setTimeout(createElixirDrops, 5000);
    }
    
    // Adicionar estilos CSS para as gotas de elixir
    const elixirStyle = document.createElement('style');
    elixirStyle.textContent = `
        .elixir-drop {
            position: absolute;
            bottom: 100%;
            background-color: var(--elixir-purple);
            border-radius: 50%;
            z-index: 1;
            filter: blur(1px);
            box-shadow: 0 0 5px var(--elixir-purple);
            pointer-events: none;
            animation: drip 2s ease-in forwards;
        }
        
        @keyframes drip {
            0% {
                transform: translateY(0);
                opacity: 0;
            }
            10% {
                opacity: 0.8;
            }
            100% {
                transform: translateY(15px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(elixirStyle);
    
    // Atualizar a barra de elixir quando uma consulta é feita
    const allButtons = document.querySelectorAll('button[onclick^="consulta"]');
    allButtons.forEach(button => {
        button.addEventListener('click', function() {
            const elixir = document.querySelector('.elixir');
            elixir.style.width = '10%';
            
            setTimeout(() => {
                elixir.style.width = '70%';
                elixir.style.transition = 'width 3s';
            }, 100);
            
            setTimeout(() => {
                elixir.style.transition = 'width 0s';
            }, 3100);
        });
    });
});

// Criar cartas aleatórias na tela em intervalos
setTimeout(() => {
    setInterval(createRandomCard, 20000);
}, 5000);

function createRandomCard() {
    const body = document.body;
    const card = document.createElement('div');
    card.className = 'random-card';
    
    // Posição aleatória
    const xPos = Math.random() * 100;
    const yPos = Math.random() * 100;
    card.style.left = `${xPos}%`;
    card.style.top = `${yPos}%`;
    
    // Rotação aleatória
    const rotation = -15 + Math.random() * 30;
    card.style.transform = `rotate(${rotation}deg)`;
    
    // Escolher uma imagem de carta aleatória
    const cardImages = [
        'https://static.wikia.nocookie.net/clashroyale/images/1/16/MiniPekkaCard.png',
        'https://static.wikia.nocookie.net/clashroyale/images/2/26/WizardCard.png',
        'https://static.wikia.nocookie.net/clashroyale/images/3/34/HogRiderCard.png',
        'https://static.wikia.nocookie.net/clashroyale/images/a/ae/FireballCard.png',
        'https://static.wikia.nocookie.net/clashroyale/images/e/ed/GoblinBarrelCard.png',
        'https://static.wikia.nocookie.net/clashroyale/images/d/de/PrincessCard.png'
    ];
    
    const randomIndex = Math.floor(Math.random() * cardImages.length);
    card.style.backgroundImage = `url('${cardImages[randomIndex]}')`;
    
    body.appendChild(card);
    
    // Animação de desaparecimento
    setTimeout(() => {
        card.style.opacity = '0';
        setTimeout(() => {
            if (card.parentNode) {
                body.removeChild(card);
            }
        }, 1000);
    }, 4000);
}

// Adicionar estilos CSS para as cartas aleatórias
const cardStyle = document.createElement('style');
cardStyle.textContent = `
    .random-card {
        position: fixed;
        width: 60px;
        height: 80px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: -1;
        pointer-events: none;
        opacity: 0.15;
        transition: opacity 1s;
        filter: drop-shadow(2px 2px 5px rgba(0,0,0,0.3));
    }
`;
document.head.appendChild(cardStyle);
