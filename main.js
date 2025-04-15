let batalhas = [];
let cartasPorId = {}; // Mapping of card IDs to card names

// Carregar JSON de batalhas e cartas
Promise.all([
  fetch('clashroyale.batalhas.json').then(r => r.json()),
  fetch('clashroyale.cartas.json').then(r => r.json())
])
.then(([dadosBatalhas, dadosCartas]) => {
  batalhas = dadosBatalhas.filter(b => b.battleTime); // ignora entradas inválidas
  console.log(`${batalhas.length} batalhas carregadas`);
  
  // Criar mapeamento de IDs para nomes de cartas
  dadosCartas.forEach(carta => {
    cartasPorId[carta.id] = carta.Card;
  });
  console.log(`${Object.keys(cartasPorId).length} cartas carregadas`);
  
  // Preencher datalists para os inputs com as cartas disponíveis
  preencherOpcoesCartas();
  
  // Pré-carregar análises para demonstração
  carregarExemploInicial();
})
.catch(error => {
  console.error("Erro ao carregar os dados:", error);
  document.getElementById('resultado1').innerHTML = 'Erro ao carregar os dados. Verifique o console para detalhes.';
});

// Função para preencher as opções de cartas nos datalists
function preencherOpcoesCartas() {
  // Criar array de cartas ordenadas por nome
  const cartas = Object.entries(cartasPorId)
    .map(([id, nome]) => ({ id: parseInt(id), nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  
  // Preencher datalists para autocomplete
  const dataLists = ['cartasDatalist', 'cartasDatalist2', 'cartasDatalist3', 'cartasDatalist4'];
  
  dataLists.forEach(listId => {
    const datalist = document.getElementById(listId);
    if (!datalist) return;
    
    // Limpar opções existentes
    datalist.innerHTML = '';
    
    // Adicionar opções para cada carta
    cartas.forEach(carta => {
      const option = document.createElement('option');
      option.value = carta.id;
      option.textContent = `${carta.nome} (${carta.id})`;
      datalist.appendChild(option);
    });
  });
  
  // Adicionar evento para atualizar rótulos de cartas nos inputs
  document.querySelectorAll('.carta-input').forEach(input => {
    input.addEventListener('change', atualizarRotulosDeCarta);
    // Executar uma vez para atualizar rótulos iniciais
    atualizarRotuloDeCarta(input);
  });
}

// Função para atualizar todos os rótulos de carta
function atualizarRotulosDeCarta() {
  document.querySelectorAll('.carta-input').forEach(atualizarRotuloDeCarta);
}

// Função para atualizar rótulo de uma carta específica
function atualizarRotuloDeCarta(input) {
  const cardId = parseInt(input.value);
  const cardLabel = input.nextElementSibling; // Elemento para mostrar o nome da carta
  
  if (cardLabel && cardLabel.classList.contains('card-name-display')) {
    if (cardId && cartasPorId[cardId]) {
      cardLabel.textContent = cartasPorId[cardId];
      cardLabel.style.display = 'inline-block';
    } else {
      cardLabel.textContent = 'Carta desconhecida';
      cardLabel.style.display = 'inline-block';
    }
  }
}

// Função auxiliar para obter nome da carta pelo ID
function getNomeCarta(id) {
  return cartasPorId[id] ? `${cartasPorId[id]} (${id})` : `ID ${id}`;
}

// Carrega um exemplo inicial para demonstração
function carregarExemploInicial() {
  // Pré-carregar os resultados para a carta 26000008
  if (document.getElementById('cartaX').value == "26000008") {
    consulta1();
  }
}

// Função para verificar se um ID de carta existe no mapeamento
function verificarCarta(id) {
  if (!cartasPorId[id]) {
    return false;
  }
  return true;
}

// Função para executar a consulta 1 ao clicar no botão
function consulta1() {
  const cartaX = parseInt(document.getElementById('cartaX').value);
  
  if (!cartaX) {
    document.getElementById('resultado1').innerHTML = 'Informe um ID de carta válido.';
    return;
  }
  
  if (!verificarCarta(cartaX)) {
    document.getElementById('resultado1').innerHTML = `ID de carta inválido: ${cartaX}. Por favor, selecione uma carta existente.`;
    return;
  }

  // Calcula estatísticas da carta
  const resultado = calcularEstatisticasCartaEspecifica(cartaX);
  
  // Exibir resultados na interface
  let html = `
    <h3>Estatísticas para Carta: ${getNomeCarta(resultado.cardId)}</h3>
    <div class="stat-card">
      <span class="stat-name">Total de usos:</span>
      <span class="stat-value">${resultado.totalUsos}</span>
    </div>
    <div class="stat-card">
      <span class="stat-name">Vitórias:</span>
      <span class="stat-value win-stat">${resultado.vitorias} (${resultado.pctVitorias}%)</span>
    </div>
    <div class="stat-card">
      <span class="stat-name">Derrotas:</span>
      <span class="stat-value loss-stat">${resultado.derrotas} (${resultado.pctDerrotas}%)</span>
    </div>
  `;
  
  document.getElementById('resultado1').innerHTML = html;
  console.log("Estatísticas calculadas:", resultado);
}

// Função para calcular porcentagem de vitórias/derrotas com uma carta específica
function calcularEstatisticasCartaEspecifica(cardId) {
  // Verificar se batalhas foi carregado
  if (!batalhas || batalhas.length === 0) {
    console.error("Dados de batalhas não carregados!");
    return { cardId, totalUsos: 0, vitorias: 0, derrotas: 0, pctVitorias: 0, pctDerrotas: 0 };
  }
  
  let total = 0, vitorias = 0, derrotas = 0;
  
  console.log(`Analisando ${batalhas.length} batalhas para carta ${cardId}`);
  
  batalhas.forEach(b => {
    // Verificando se a batalha tem dados válidos
    if (!b["winner.cards.list"] || !b["loser.cards.list"]) return;
    
    try {
      const winCards = JSON.parse(b["winner.cards.list"]);
      const loseCards = JSON.parse(b["loser.cards.list"]);
      
      if (winCards.includes(cardId)) {
        total++;
        vitorias++;
      }
      
      if (loseCards.includes(cardId)) {
        total++;
        derrotas++;
      }
    } catch (e) {
      console.error("Erro ao processar batalha:", e);
    }
  });
  
  const pctV = total ? ((vitorias / total) * 100).toFixed(2) : 0;
  const pctD = total ? ((derrotas / total) * 100).toFixed(2) : 0;
  
  return { 
    cardId,
    totalUsos: total, 
    vitorias, 
    derrotas, 
    pctVitorias: pctV, 
    pctDerrotas: pctD 
  };
}

// Função para executar a consulta 2 ao clicar no botão
function consulta2() {
  const pctMin = parseFloat(document.getElementById('pctDecks').value);
  
  if (isNaN(pctMin) || pctMin <= 0 || pctMin > 100) {
    document.getElementById('resultado2').innerHTML = 'Informe uma porcentagem válida (entre 0 e 100).';
    return;
  }
  
  // Obter os decks com win rate acima da porcentagem
  const resultado = getDecksMaisVitorias(pctMin);
  
  if (resultado.length === 0) {
    document.getElementById('resultado2').innerHTML = 'Nenhum deck encontrado com essa taxa de vitórias.';
    return;
  }
  
  // Exibir resultados na interface
  let html = `<h3>Decks com mais de ${pctMin}% de vitórias</h3>`;
  
  resultado.forEach((deck, index) => {
    html += `
      <div class="stat-card">
        <span class="stat-name">Deck ${index + 1} (${deck.pct.toFixed(2)}% de vitórias)</span>
        <div class="deck-info">
          <p>Cartas: ${formatarListaCartas(deck.deck)}</p>
          <p>Vitórias: <span class="win-stat">${deck.vitorias}</span> / Total: ${deck.total}</p>
        </div>
      </div>
    `;
  });
  
  document.getElementById('resultado2').innerHTML = html;
}

function getDecksMaisVitorias(pctMin) {
  const deckStats = {};
  
  batalhas.forEach(b => {
    if (!b["winner.cards.list"] || !b["loser.cards.list"]) return;
    
    try {
      const deck = b["winner.cards.list"];
      if (!deckStats[deck]) deckStats[deck] = { v: 0, t: 0 };
      deckStats[deck].v++;
      deckStats[deck].t++;
      
      // Derrotas do mesmo deck
      const loseDeck = b["loser.cards.list"];
      if (!deckStats[loseDeck]) deckStats[loseDeck] = { v: 0, t: 0 };
      deckStats[loseDeck].t++;
    } catch (e) {
      console.error("Erro ao processar deck:", e);
    }
  });
  
  return Object.entries(deckStats)
    .map(([deck, stat]) => ({
      deck,
      pct: stat.t ? (stat.v / stat.t) * 100 : 0,
      vitorias: stat.v,
      total: stat.t
    }))
    .filter(d => d.pct > pctMin)
    .sort((a, b) => b.pct - a.pct);
}

// Função para executar a consulta 3 ao clicar no botão
function consulta3() {
  const comboInput = document.getElementById('comboCartas').value;
  
  if (!comboInput) {
    document.getElementById('resultado3').innerHTML = 'Informe os IDs das cartas separados por vírgula.';
    return;
  }
  
  // Converter a string de entrada para array de IDs de cartas
  const combo = comboInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  
  if (combo.length === 0) {
    document.getElementById('resultado3').innerHTML = 'Nenhum ID de carta válido informado.';
    return;
  }
  
  // Verificar se todas as cartas existem
  for (const cardId of combo) {
    if (!verificarCarta(cardId)) {
      document.getElementById('resultado3').innerHTML = `ID de carta inválido: ${cardId}. Por favor, selecione cartas existentes.`;
      return;
    }
  }
  
  // Calcular derrotas com o combo de cartas
  const resultado = calcularDerrotasCombo(combo);
  
  // Exibir resultados na interface
  let html = `
    <h3>Derrotas com o combo de cartas</h3>
    <div class="stat-card">
      <span class="stat-name">Combo analisado:</span>
      <span class="stat-value">${formatarListaCartas(combo.join(','))}</span>
    </div>
    <div class="stat-card">
      <span class="stat-name">Total de derrotas:</span>
      <span class="stat-value loss-stat">${resultado}</span>
    </div>
  `;
  
  document.getElementById('resultado3').innerHTML = html;
}

function calcularDerrotasCombo(combo) {
  let derrotas = 0;
  
  batalhas.forEach(b => {
    if (!b["loser.cards.list"]) return;
    
    try {
      const loseCards = JSON.parse(b["loser.cards.list"]);
      if (combo.every(c => loseCards.includes(c))) {
        derrotas++;
      }
    } catch (e) {
      console.error("Erro ao processar batalha para combo:", e);
    }
  });
  
  return derrotas;
}

// Função para executar a consulta 4 ao clicar no botão
function consulta4() {
  const cartaX = parseInt(document.getElementById('cartaX4').value);
  const pctTrof = parseFloat(document.getElementById('pctTrof').value);
  
  if (!cartaX || isNaN(cartaX)) {
    document.getElementById('resultado4').innerHTML = 'Informe um ID de carta válido.';
    return;
  }
  
  if (!verificarCarta(cartaX)) {
    document.getElementById('resultado4').innerHTML = `ID de carta inválido: ${cartaX}. Por favor, selecione uma carta existente.`;
    return;
  }
  
  if (isNaN(pctTrof) || pctTrof <= 0 || pctTrof > 100) {
    document.getElementById('resultado4').innerHTML = 'Informe uma porcentagem válida de troféus.';
    return;
  }
  
  // Calcular vitórias com condições especiais
  const resultado = calcularVitoriasEspeciais(cartaX, pctTrof);
  
  // Exibir resultados na interface
  let html = `
    <h3>Vitórias com condições especiais</h3>
    <div class="stat-card">
      <span class="stat-name">Carta analisada:</span>
      <span class="stat-value">${getNomeCarta(cartaX)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-name">Diferença mínima de troféus:</span>
      <span class="stat-value">${pctTrof}%</span>
    </div>
    <div class="stat-card">
      <span class="stat-name">Total de vitórias:</span>
      <span class="stat-value win-stat">${resultado}</span>
    </div>
    <p>Condições: vencedor tem carta ${getNomeCarta(cartaX)}, possui ${pctTrof}% menos troféus, partida &lt;2min, perdedor derrubou ≥2 torres</p>
  `;
  
  document.getElementById('resultado4').innerHTML = html;
}

function calcularVitoriasEspeciais(cartaX, pctMenos) {
  let vitorias = 0;
  
  batalhas.forEach(b => {
    if (!b["winner.cards.list"]) return;
    
    try {
      const winCards = JSON.parse(b["winner.cards.list"]);
      
      // Verificar se a carta está no deck vencedor
      if (!winCards.includes(cartaX)) return;
      
      // Verificar diferença de troféus
      const trofeusV = b["winner.startingTrophies"];
      const trofeusL = b["loser.startingTrophies"];
      
      if (!trofeusV || !trofeusL) return;
      if (trofeusV >= trofeusL * (1 - pctMenos / 100)) return;
      
      // Verificar se o perdedor derrubou pelo menos 2 torres
      const loserCrowns = b["loser.crowns"] || 0;
      if (loserCrowns < 2) return;
      
      // Duração da partida não está disponível nos dados,
      // então esta condição é omitida na implementação atual
      
      vitorias++;
    } catch (e) {
      console.error("Erro ao processar vitória especial:", e);
    }
  });
  
  return vitorias;
}

// Função para executar a consulta 5 ao clicar no botão
function consulta5() {
  const tamCombo = parseInt(document.getElementById('tamCombo').value);
  const pctMin = parseFloat(document.getElementById('pctComboWins').value);
  
  if (!tamCombo || tamCombo <= 0 || tamCombo > 8) {
    document.getElementById('resultado5').innerHTML = 'Informe um tamanho válido de combo (entre 1 e 8).';
    return;
  }
  
  if (isNaN(pctMin) || pctMin <= 0 || pctMin > 100) {
    document.getElementById('resultado5').innerHTML = 'Informe uma porcentagem válida.';
    return;
  }
  
  // Calcular os melhores combos de cartas
  const resultado = getMelhoresCombosCartas(tamCombo, pctMin);
  
  if (resultado.length === 0) {
    document.getElementById('resultado5').innerHTML = 'Nenhum combo encontrado com essa taxa de vitórias.';
    return;
  }
  
  // Exibir resultados na interface
  let html = `<h3>Combos de ${tamCombo} cartas com mais de ${pctMin}% de vitórias</h3>`;
  
  resultado.slice(0, 15).forEach((combo, index) => {
    html += `
      <div class="stat-card">
        <span class="stat-name">Combo ${index + 1} (${combo.pct.toFixed(2)}% de vitórias)</span>
        <div class="deck-info">
          <p>Cartas: ${formatarListaCartas(combo.combo)}</p>
          <p>Vitórias: <span class="win-stat">${combo.vitorias}</span> / Total: ${combo.total}</p>
        </div>
      </div>
    `;
  });
  
  if (resultado.length > 15) {
    html += `<p>Mostrando os primeiros 15 de ${resultado.length} combos encontrados.</p>`;
  }
  
  document.getElementById('resultado5').innerHTML = html;
}

function getMelhoresCombosCartas(N, pctMin) {
  const comboStats = {};
  
  batalhas.forEach(b => {
    if (!b["winner.cards.list"] || !b["loser.cards.list"]) return;
    
    try {
      const winCards = JSON.parse(b["winner.cards.list"]).sort((a, b) => a - b);
      
      // Gera todos os combos de tamanho N do deck vencedor
      const combos = getCombos(winCards, N);
      combos.forEach(c => {
        const key = c.join(',');
        if (!comboStats[key]) comboStats[key] = { v: 0, t: 0 };
        comboStats[key].v++;
        comboStats[key].t++;
      });
      
      // Decks perdedores (conta só total, não vitória)
      const loseCards = JSON.parse(b["loser.cards.list"]).sort((a, b) => a - b);
      getCombos(loseCards, N).forEach(c => {
        const key = c.join(',');
        if (!comboStats[key]) comboStats[key] = { v: 0, t: 0 };
        comboStats[key].t++;
      });
    } catch (e) {
      console.error("Erro ao processar combos de cartas:", e);
    }
  });
  
  return Object.entries(comboStats)
    .map(([combo, stat]) => ({
      combo,
      pct: stat.t ? (stat.v / stat.t) * 100 : 0,
      vitorias: stat.v,
      total: stat.t
    }))
    .filter(d => d.pct > pctMin && d.total >= 5) // adiciona filtro para um mínimo de jogos
    .sort((a, b) => b.pct - a.pct);
}

// Utilitário: retorna todos os combos de tamanho N de um array
function getCombos(arr, n) {
  const result = [];
  
  function combine(current, start) {
    if (current.length === n) {
      result.push([...current]);
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      combine(current, i + 1);
      current.pop();
    }
  }
  
  combine([], 0);
  return result;
}

// Função utilitária para formatar listas de cartas para exibição
function formatarListaCartas(cardsStr) {
  if (!cardsStr) return "N/A";
  
  let cardsArray;
  if (typeof cardsStr === 'string') {
    try {
      // Tenta fazer parse se for uma string JSON
      if (cardsStr.startsWith('[')) {
        cardsArray = JSON.parse(cardsStr);
      } else {
        // Se for uma lista separada por vírgulas
        cardsArray = cardsStr.split(',').map(c => parseInt(c.trim()));
      }
    } catch (e) {
      return cardsStr; // retorna original se falhar
    }
  } else {
    cardsArray = cardsStr;
  }
  
  if (!Array.isArray(cardsArray)) return cardsStr;
  
  // Mostrar nome e ID de cada carta
  return cardsArray.map(id => getNomeCarta(id)).join(', ');
}

// Função para executar a consulta 6 ao clicar no botão
function consulta6() {
  const quantidade = parseInt(document.getElementById('qtdCartasMaisUsadas').value);
  
  if (!quantidade || quantidade <= 0) {
    document.getElementById('resultado6').innerHTML = 'Informe uma quantidade válida.';
    return;
  }
  
  // Calcular as cartas mais usadas
  const resultado = getCartasMaisUsadas(quantidade);
  
  if (resultado.length === 0) {
    document.getElementById('resultado6').innerHTML = 'Não foi possível analisar as cartas mais usadas.';
    return;
  }
  
  // Exibir resultados na interface
  let html = `<h3>As ${quantidade} cartas mais usadas</h3>`;
  
  resultado.forEach((carta, index) => {
    html += `
      <div class="stat-card">
        <span class="stat-name">Carta ${index + 1}: ${getNomeCarta(carta.id)}</span>
        <div class="deck-info">
          <p>Total de usos: ${carta.total}</p>
          <p>Taxa de vitória: <span class="${carta.winRate > 50 ? 'win-stat' : 'loss-stat'}">${carta.winRate.toFixed(2)}%</span></p>
        </div>
      </div>
    `;
  });
  
  document.getElementById('resultado6').innerHTML = html;
}

function getCartasMaisUsadas(quantidade) {
  const cartasStats = {};
  
  batalhas.forEach(b => {
    if (!b["winner.cards.list"] || !b["loser.cards.list"]) return;
    
    try {
      const winCards = JSON.parse(b["winner.cards.list"]);
      const loseCards = JSON.parse(b["loser.cards.list"]);
      
      // Contabilizar cartas vencedoras
      winCards.forEach(card => {
        if (!cartasStats[card]) cartasStats[card] = { usos: 0, vitorias: 0 };
        cartasStats[card].usos++;
        cartasStats[card].vitorias++;
      });
      
      // Contabilizar cartas perdedoras
      loseCards.forEach(card => {
        if (!cartasStats[card]) cartasStats[card] = { usos: 0, vitorias: 0 };
        cartasStats[card].usos++;
      });
    } catch (e) {
      console.error("Erro ao processar cartas:", e);
    }
  });
  
  return Object.entries(cartasStats)
    .map(([id, stats]) => ({
      id: parseInt(id),
      total: stats.usos,
      vitorias: stats.vitorias,
      winRate: (stats.vitorias / stats.usos) * 100
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, quantidade);
}

// Função para executar a consulta 7 ao clicar no botão
function consulta7() {
  const cartaAlvo = parseInt(document.getElementById('cartaAlvo').value);
  const limiteResultados = parseInt(document.getElementById('limiteResultados').value) || 10;
  
  if (!cartaAlvo || isNaN(cartaAlvo)) {
    document.getElementById('resultado7').innerHTML = 'Informe um ID de carta válido.';
    return;
  }
  
  if (!verificarCarta(cartaAlvo)) {
    document.getElementById('resultado7').innerHTML = `ID de carta inválido: ${cartaAlvo}. Por favor, selecione uma carta existente.`;
    return;
  }
  
  // Encontrar cartas eficazes contra a carta alvo
  const resultado = getCartasEficazesContra(cartaAlvo, limiteResultados);
  
  if (resultado.length === 0) {
    document.getElementById('resultado7').innerHTML = `Nenhuma carta eficaz encontrada contra a carta ${getNomeCarta(cartaAlvo)}.`;
    return;
  }
  
  // Exibir resultados na interface
  let html = `<h3>Cartas mais eficazes contra a carta ${getNomeCarta(cartaAlvo)}</h3>`;
  
  resultado.forEach((carta, index) => {
    html += `
      <div class="stat-card">
        <span class="stat-name">Carta ${index + 1}: ${getNomeCarta(carta.id)}</span>
        <div class="deck-info">
          <p>Taxa de vitória contra a carta alvo: <span class="win-stat">${carta.winRate.toFixed(2)}%</span></p>
          <p>Total de confrontos: ${carta.confrontos}</p>
        </div>
      </div>
    `;
  });
  
  document.getElementById('resultado7').innerHTML = html;
}

function getCartasEficazesContra(cartaAlvo, limite) {
  const confrontosStats = {};
  
  batalhas.forEach(b => {
    if (!b["winner.cards.list"] || !b["loser.cards.list"]) return;
    
    try {
      const winCards = JSON.parse(b["winner.cards.list"]);
      const loseCards = JSON.parse(b["loser.cards.list"]);
      
      // Verificar se a carta alvo está no deck perdedor
      if (loseCards.includes(cartaAlvo)) {
        // Registrar cada carta do deck vencedor como eficaz contra a carta alvo
        winCards.forEach(card => {
          if (!confrontosStats[card]) confrontosStats[card] = { vitorias: 0, confrontos: 0 };
          confrontosStats[card].vitorias++;
          confrontosStats[card].confrontos++;
        });
      }
      
      // Verificar se a carta alvo está no deck vencedor
      if (winCards.includes(cartaAlvo)) {
        // Registrar cada carta do deck perdedor como ineficaz contra a carta alvo
        loseCards.forEach(card => {
          if (!confrontosStats[card]) confrontosStats[card] = { vitorias: 0, confrontos: 0 };
          confrontosStats[card].confrontos++;
        });
      }
    } catch (e) {
      console.error("Erro ao processar confrontos de cartas:", e);
    }
  });
  
  return Object.entries(confrontosStats)
    .filter(([id, stats]) => stats.confrontos >= 5) // Mínimo de 5 confrontos para relevância estatística
    .map(([id, stats]) => ({
      id: parseInt(id),
      winRate: (stats.vitorias / stats.confrontos) * 100,
      confrontos: stats.confrontos
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, limite);
}

// Função para executar a consulta 8 ao clicar no botão
function consulta8() {
  const minBatalhas = parseInt(document.getElementById('minBatalhas').value) || 5;
  
  // Analisar performance de jogadores
  const resultado = getPerformanceJogadores(minBatalhas);
  
  if (resultado.length === 0) {
    document.getElementById('resultado8').innerHTML = 'Nenhum jogador com número suficiente de batalhas encontrado.';
    return;
  }
  
  // Exibir resultados na interface
  let html = `<h3>Performance dos Jogadores (mínimo de ${minBatalhas} batalhas)</h3>`;
  
  resultado.slice(0, 15).forEach((jogador, index) => {
    html += `
      <div class="stat-card">
        <span class="stat-name">Jogador ${index + 1}: ${jogador.nome || 'ID ' + jogador.id}</span>
        <div class="deck-info">
          <p>Taxa de vitória: <span class="${jogador.winRate > 50 ? 'win-stat' : 'loss-stat'}">${jogador.winRate.toFixed(2)}%</span></p>
          <p>Vitórias: ${jogador.vitorias} / Total: ${jogador.total}</p>
          <p>Média de coroas por batalha: ${jogador.mediaCoroas.toFixed(2)}</p>
        </div>
      </div>
    `;
  });
  
  if (resultado.length > 15) {
    html += `<p>Mostrando os primeiros 15 de ${resultado.length} jogadores encontrados.</p>`;
  }
  
  document.getElementById('resultado8').innerHTML = html;
}

function getPerformanceJogadores(minBatalhas) {
  const jogadoresStats = {};
  
  batalhas.forEach(b => {
    if (!b["winner.tag"] || !b["loser.tag"]) return;
    
    try {
      // Registrar vitória do vencedor
      const winnerTag = b["winner.tag"];
      if (!jogadoresStats[winnerTag]) {
        jogadoresStats[winnerTag] = {
          id: winnerTag,
          nome: b["winner.name"] || null,
          vitorias: 0,
          total: 0,
          coroas: 0
        };
      }
      jogadoresStats[winnerTag].vitorias++;
      jogadoresStats[winnerTag].total++;
      jogadoresStats[winnerTag].coroas += parseInt(b["winner.crowns"] || 0);
      
      // Registrar derrota do perdedor
      const loserTag = b["loser.tag"];
      if (!jogadoresStats[loserTag]) {
        jogadoresStats[loserTag] = {
          id: loserTag,
          nome: b["loser.name"] || null,
          vitorias: 0,
          total: 0,
          coroas: 0
        };
      }
      jogadoresStats[loserTag].total++;
      jogadoresStats[loserTag].coroas += parseInt(b["loser.crowns"] || 0);
    } catch (e) {
      console.error("Erro ao processar performance de jogadores:", e);
    }
  });
  
  return Object.values(jogadoresStats)
    .filter(jogador => jogador.total >= minBatalhas)
    .map(jogador => ({
      ...jogador,
      winRate: (jogador.vitorias / jogador.total) * 100,
      mediaCoroas: jogador.coroas / jogador.total
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

// Função para executar a consulta 9 ao clicar no botão
function consulta9() {
  const limiteResultados = parseInt(document.getElementById('limitePares').value) || 10;
  
  // Encontrar pares de cartas com sinergia
  const resultado = getCartasSinergicas(limiteResultados);
  
  if (resultado.length === 0) {
    document.getElementById('resultado9').innerHTML = 'Não foi possível encontrar pares de cartas com sinergia.';
    return;
  }
  
  // Exibir resultados na interface
  let html = `<h3>Pares de cartas com maior sinergia</h3>`;
  
  resultado.forEach((par, index) => {
    html += `
      <div class="stat-card">
        <span class="stat-name">Par ${index + 1}</span>
        <div class="deck-info">
          <p>Cartas: ${getNomeCarta(par.carta1)} e ${getNomeCarta(par.carta2)}</p>
          <p>Taxa de vitória juntas: <span class="win-stat">${par.winRateJuntas.toFixed(2)}%</span></p>
          <p>Taxa de vitória separadas: <span class="${par.winRateSeparadas > 50 ? 'win-stat' : 'loss-stat'}">${par.winRateSeparadas.toFixed(2)}%</span></p>
          <p>Bônus de sinergia: <span class="win-stat">+${par.bonusSinergia.toFixed(2)}%</span></p>
        </div>
      </div>
    `;
  });
  
  document.getElementById('resultado9').innerHTML = html;
}

function getCartasSinergicas(limite) {
  const cartasStats = {};  // Estatísticas individuais das cartas
  const paresStats = {};   // Estatísticas dos pares de cartas
  
  // Primeiro, calcular estatísticas individuais das cartas
  batalhas.forEach(b => {
    if (!b["winner.cards.list"] || !b["loser.cards.list"]) return;
    
    try {
      const winCards = JSON.parse(b["winner.cards.list"]);
      const loseCards = JSON.parse(b["loser.cards.list"]);
      
      // Registrar estatísticas das cartas vencedoras
      winCards.forEach(card => {
        if (!cartasStats[card]) cartasStats[card] = { vitorias: 0, total: 0 };
        cartasStats[card].vitorias++;
        cartasStats[card].total++;
      });
      
      // Registrar estatísticas das cartas perdedoras
      loseCards.forEach(card => {
        if (!cartasStats[card]) cartasStats[card] = { vitorias: 0, total: 0 };
        cartasStats[card].total++;
      });
      
      // Registrar estatísticas dos pares de cartas no deck vencedor
      for (let i = 0; i < winCards.length; i++) {
        for (let j = i + 1; j < winCards.length; j++) {
          const carta1 = Math.min(winCards[i], winCards[j]);
          const carta2 = Math.max(winCards[i], winCards[j]);
          const key = `${carta1},${carta2}`;
          
          if (!paresStats[key]) paresStats[key] = { vitorias: 0, total: 0 };
          paresStats[key].vitorias++;
          paresStats[key].total++;
        }
      }
      
      // Registrar estatísticas dos pares de cartas no deck perdedor
      for (let i = 0; i < loseCards.length; i++) {
        for (let j = i + 1; j < loseCards.length; j++) {
          const carta1 = Math.min(loseCards[i], loseCards[j]);
          const carta2 = Math.max(loseCards[i], loseCards[j]);
          const key = `${carta1},${carta2}`;
          
          if (!paresStats[key]) paresStats[key] = { vitorias: 0, total: 0 };
          paresStats[key].total++;
        }
      }
    } catch (e) {
      console.error("Erro ao processar sinergia de cartas:", e);
    }
  });
  
  // Calcular a sinergia entre os pares de cartas
  const resultado = [];
  
  Object.entries(paresStats).forEach(([key, stats]) => {
    if (stats.total < 10) return; // Ignorar pares com poucos jogos
    
    const [carta1, carta2] = key.split(',').map(Number);
    
    // Verificar se temos estatísticas para ambas as cartas
    if (!cartasStats[carta1] || !cartasStats[carta2]) return;
    
    const winRate1 = cartasStats[carta1].vitorias / cartasStats[carta1].total * 100;
    const winRate2 = cartasStats[carta2].vitorias / cartasStats[carta2].total * 100;
    const winRateSeparadas = (winRate1 + winRate2) / 2;
    const winRateJuntas = stats.vitorias / stats.total * 100;
    const bonusSinergia = winRateJuntas - winRateSeparadas;
    
    if (bonusSinergia > 0) {
      resultado.push({
        carta1,
        carta2,
        winRateJuntas,
        winRateSeparadas,
        bonusSinergia,
        totalJogos: stats.total
      });
    }
  });
  
  return resultado
    .sort((a, b) => b.bonusSinergia - a.bonusSinergia)
    .slice(0, limite);
}

// Função para executar a consulta 10 ao clicar no botão
function consulta10() {
  const cartaId = parseInt(document.getElementById('cartaEvolucao').value);
  
  if (!cartaId || isNaN(cartaId)) {
    document.getElementById('resultado10').innerHTML = 'Informe um ID de carta válido.';
    return;
  }
  
  if (!verificarCarta(cartaId)) {
    document.getElementById('resultado10').innerHTML = `ID de carta inválido: ${cartaId}. Por favor, selecione uma carta existente.`;
    return;
  }
  
  // Analisar a evolução do uso da carta ao longo do tempo
  const resultado = getEvolucaoUsoCarta(cartaId);
  
  if (resultado.length === 0) {
    document.getElementById('resultado10').innerHTML = `Não foi possível analisar a evolução da carta ${getNomeCarta(cartaId)}.`;
    return;
  }
  
  // Exibir resultados na interface
  let html = `<h3>Evolução do uso da carta ${getNomeCarta(cartaId)}</h3>`;
  
  html += `<div class="timeline">`;
  
  resultado.forEach((periodo, index) => {
    html += `
      <div class="periodo-card ${periodo.tendencia === 'alta' ? 'alta' : periodo.tendencia === 'baixa' ? 'baixa' : 'estavel'}">
        <span class="periodo-nome">Período ${index + 1}</span>
        <div class="periodo-info">
          <p>Taxa de uso: ${periodo.taxaUso.toFixed(2)}% ${getTendenciaIcon(periodo.tendencia)}</p>
          <p>Taxa de vitória: <span class="${periodo.taxaVitoria > 50 ? 'win-stat' : 'loss-stat'}">${periodo.taxaVitoria.toFixed(2)}%</span></p>
          <p>Total de jogos no período: ${periodo.totalJogos}</p>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  
  document.getElementById('resultado10').innerHTML = html;
}

function getEvolucaoUsoCarta(cartaId) {
  // Se não temos timestamps, vamos dividir os dados em blocos para simular períodos
  const totalBatalhas = batalhas.length;
  if (totalBatalhas < 100) return []; // Precisamos de um número mínimo de batalhas
  
  const numeroPeríodos = 5; // Dividir em 5 períodos
  const batalhaPorPeriodo = Math.floor(totalBatalhas / numeroPeríodos);
  
  const periodos = [];
  
  for (let i = 0; i < numeroPeríodos; i++) {
    const inicio = i * batalhaPorPeriodo;
    const fim = (i === numeroPeríodos - 1) ? totalBatalhas : (i + 1) * batalhaPorPeriodo;
    const batalhaPeriodo = batalhas.slice(inicio, fim);
    
    let totalJogos = 0;
    let totalUsosCarta = 0;
    let vitoriasComCarta = 0;
    
    batalhaPeriodo.forEach(b => {
      if (!b["winner.cards.list"] || !b["loser.cards.list"]) return;
      
      try {
        const winCards = JSON.parse(b["winner.cards.list"]);
        const loseCards = JSON.parse(b["loser.cards.list"]);
        
        totalJogos++;
        
        if (winCards.includes(cartaId)) {
          totalUsosCarta++;
          vitoriasComCarta++;
        }
        
        if (loseCards.includes(cartaId)) {
          totalUsosCarta++;
        }
      } catch (e) {
        console.error("Erro ao processar evolução da carta:", e);
      }
    });
    
    const taxaUso = totalJogos > 0 ? (totalUsosCarta / (totalJogos * 2)) * 100 : 0;
    const taxaVitoria = totalUsosCarta > 0 ? (vitoriasComCarta / totalUsosCarta) * 100 : 0;
    
    let tendencia = 'estavel';
    if (i > 0) {
      const periodAnterior = periodos[i - 1];
      if (taxaUso > periodAnterior.taxaUso * 1.1) tendencia = 'alta';
      else if (taxaUso < periodAnterior.taxaUso * 0.9) tendencia = 'baixa';
    }
    
    periodos.push({
      taxaUso,
      taxaVitoria,
      totalJogos: batalhaPeriodo.length,
      tendencia
    });
  }
  
  return periodos;
}

function getTendenciaIcon(tendencia) {
  if (tendencia === 'alta') return '↑';
  if (tendencia === 'baixa') return '↓';
  return '→';
}
