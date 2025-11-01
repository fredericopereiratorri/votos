// Configurações dos mapas
console.log('=== INICIANDO MAPA.JS ===');
console.log('dadosEleitorais disponível?', typeof dadosEleitorais !== 'undefined');
console.log('dadosEleitoraisPE disponível?', typeof dadosEleitoraisPE !== 'undefined');

if (typeof dadosEleitorais !== 'undefined') {
    console.log('Olinda - Total de bairros:', Object.keys(dadosEleitorais).length);
}
if (typeof dadosEleitoraisPE !== 'undefined') {
    console.log('PE - Total de municípios:', Object.keys(dadosEleitoraisPE).length);
}

const MAPAS = {
    olinda: {
        nome: 'Olinda',
        titulo: 'Mapa de Calor - Olinda',
        subtitulo: 'Votos de Eugênia Lima por bairro',
        geojson: 'bairros_olinda_filtrado.geojson',
        dados: typeof dadosEleitorais !== 'undefined' ? dadosEleitorais : {},
        anos: [
            {ano: '2024', total: 7110},
            {ano: '2022', total: 5948},
            {ano: '2020', total: 2876},
            {ano: '2018', total: 13767},
            {ano: '2016', total: 2087}
        ],
        centro: [-8.0, -34.855],
        zoom: 13,
        legenda: {
            muitoAlto: '>800',
            alto: '500-800',
            medioAlto: '300-500',
            medio: '150-300',
            medioBaixo: '50-150',
            baixo: '10-50',
            muitoBaixo: '0-10'
        }
    },
    pernambuco: {
        nome: 'Pernambuco',
        titulo: 'Mapa de Calor - Pernambuco',
        subtitulo: 'Votos de Eugênia Lima por município',
        geojson: 'municipios_pe.geojson',
        dados: typeof dadosEleitoraisPE !== 'undefined' ? dadosEleitoraisPE : {},
        anos: [
            {ano: '2018', total: 113681},
            {ano: '2022', total: 45342}
        ],
        centro: [-8.3, -37.5],
        zoom: 7,
        legenda: {
            muitoAlto: '>1000',
            alto: '500-1000',
            medioAlto: '250-500',
            medio: '100-250',
            medioBaixo: '50-100',
            baixo: '10-50',
            muitoBaixo: '0-10'
        }
    }
};

console.log('MAPAS configurado');

// Estado atual
let mapaAtual = 'olinda';
let map = null;
let areaLayer = null;

// Inicializar o mapa
function inicializarMapa() {
    console.log('inicializarMapa() chamada');
    if (!map) {
        map = L.map('map').setView(MAPAS[mapaAtual].centro, MAPAS[mapaAtual].zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        console.log('Mapa Leaflet criado');
    }
}

// Normalizar nomes
function normalizarNome(nome) {
    return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Encontrar dados da área
function encontrarDadosArea(nomeArea) {
    const config = MAPAS[mapaAtual];
    const nomeNormalizado = normalizarNome(nomeArea);

    for (const [nome, dados] of Object.entries(config.dados)) {
        if (normalizarNome(nome) === nomeNormalizado) {
            return dados;
        }
    }

    for (const [nome, dados] of Object.entries(config.dados)) {
        if (normalizarNome(nome).includes(nomeNormalizado) ||
            nomeNormalizado.includes(normalizarNome(nome))) {
            return dados;
        }
    }

    return null;
}

// Calcular média de votos
function calcularMediaVotos(dadosArea) {
    const checkboxes = document.querySelectorAll('input[name="ano"]:checked');
    const anosSelecionados = Array.from(checkboxes).map(cb => cb.value);

    if (anosSelecionados.length === 0 || !dadosArea) {
        return 0;
    }

    let soma = 0;
    let count = 0;

    anosSelecionados.forEach(ano => {
        if (dadosArea[ano] !== undefined) {
            soma += dadosArea[ano];
            count++;
        }
    });

    return count > 0 ? Math.round(soma / count) : 0;
}

// Obter cor baseada nos votos
function getColor(votos) {
    const limites = mapaAtual === 'olinda'
        ? {l1: 800, l2: 500, l3: 300, l4: 150, l5: 50, l6: 10}
        : {l1: 1000, l2: 500, l3: 250, l4: 100, l5: 50, l6: 10};

    return votos > limites.l1 ? '#800026' :
           votos > limites.l2 ? '#BD0026' :
           votos > limites.l3 ? '#E31A1C' :
           votos > limites.l4 ? '#FC4E2A' :
           votos > limites.l5 ? '#FD8D3C' :
           votos > limites.l6 ? '#FEB24C' :
           votos > 0           ? '#FED976' :
                                 '#FFEDA0';
}

// Estilizar área
function style(feature) {
    const nomeArea = feature.properties.name || feature.properties.nome;
    const dadosArea = encontrarDadosArea(nomeArea);
    const mediaVotos = calcularMediaVotos(dadosArea);

    const intensitySlider = document.getElementById('intensitySlider');
    const opacity = intensitySlider ? intensitySlider.value / 100 : 0.7;

    if (!dadosArea || mediaVotos === 0) {
        return {
            fillColor: '#f0f0f0',
            weight: 1,
            opacity: 0.5,
            color: '#999',
            fillOpacity: 0.3
        };
    }

    return {
        fillColor: getColor(mediaVotos),
        weight: 1.5,
        opacity: 1,
        color: 'white',
        fillOpacity: opacity
    };
}

// Destacar área ao passar mouse
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#333',
        fillOpacity: 0.9
    });
    layer.bringToFront();
}

// Resetar destaque
function resetHighlight(e) {
    areaLayer.resetStyle(e.target);
}

// Mostrar informações da área
function mostrarInfoArea(nomeArea, mediaVotos) {
    const checkboxes = document.querySelectorAll('input[name="ano"]:checked');
    const anosSelecionados = Array.from(checkboxes).map(cb => cb.value);

    document.getElementById('areaNome').textContent = nomeArea;
    document.getElementById('areaValor').textContent = mediaVotos.toLocaleString('pt-BR');

    const dadosArea = encontrarDadosArea(nomeArea);
    if (dadosArea && anosSelecionados.length > 0) {
        const detalhes = anosSelecionados.map(ano => {
            const valor = dadosArea[ano] || 0;
            return `${ano}: ${valor.toLocaleString('pt-BR')} votos`;
        }).join(' | ');
        document.getElementById('anosInfo').textContent = detalhes;
    }

    document.getElementById('areaInfo').style.display = 'block';
}

// Clicar na área
function clickFeature(e) {
    const nomeArea = e.target.feature.properties.name || e.target.feature.properties.nome;
    const dadosArea = encontrarDadosArea(nomeArea);
    const mediaVotos = calcularMediaVotos(dadosArea);
    mostrarInfoArea(nomeArea, mediaVotos);
}

// Adicionar eventos às features
function onEachFeature(feature, layer) {
    const nomeArea = feature.properties.name || feature.properties.nome;
    const dadosArea = encontrarDadosArea(nomeArea);
    const mediaVotos = calcularMediaVotos(dadosArea);

    const textoTooltip = mediaVotos > 0
        ? `<strong>${nomeArea}</strong><br>Votos: ${mediaVotos.toLocaleString('pt-BR')}`
        : `<strong>${nomeArea}</strong><br>Sem dados`;

    layer.bindTooltip(textoTooltip, {
        permanent: false,
        direction: 'auto'
    });

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickFeature
    });
}

// Atualizar checkboxes de ano
function atualizarCheckboxesAnos() {
    console.log('atualizarCheckboxesAnos() - mapa:', mapaAtual);
    const config = MAPAS[mapaAtual];
    const container = document.getElementById('yearCheckboxes');
    container.innerHTML = '';

    config.anos.forEach((item, index) => {
        const label = document.createElement('label');
        label.style.cssText = 'display: block; padding: 5px 0; cursor: pointer; user-select: none;';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'ano';
        checkbox.value = item.ano;
        checkbox.style.cssText = 'margin-right: 8px; cursor: pointer;';
        if (index === 0) checkbox.checked = true;
        checkbox.addEventListener('change', atualizarMapa);

        const span = document.createElement('span');
        span.textContent = `${item.ano} - ${item.total.toLocaleString('pt-BR')} votos`;

        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
    console.log('Checkboxes criados:', config.anos.length);
}

// Atualizar legenda
function atualizarLegenda() {
    console.log('atualizarLegenda() - mapa:', mapaAtual);
    const config = MAPAS[mapaAtual];
    document.getElementById('legend-very-high').textContent = `Muito Alto (${config.legenda.muitoAlto})`;
    document.getElementById('legend-high').textContent = `Alto (${config.legenda.alto})`;
    document.getElementById('legend-medium-high').textContent = `Médio-Alto (${config.legenda.medioAlto})`;
    document.getElementById('legend-medium').textContent = `Médio (${config.legenda.medio})`;
    document.getElementById('legend-medium-low').textContent = `Médio-Baixo (${config.legenda.medioBaixo})`;
    document.getElementById('legend-low').textContent = `Baixo (${config.legenda.baixo})`;
    document.getElementById('legend-very-low').textContent = `Muito Baixo (${config.legenda.muitoBaixo})`;
}

// Atualizar mapa
function atualizarMapa() {
    console.log('atualizarMapa() chamada - mapa:', mapaAtual);
    if (areaLayer) {
        map.removeLayer(areaLayer);
    }

    const config = MAPAS[mapaAtual];
    console.log('Carregando GeoJSON:', config.geojson);

    fetch(config.geojson)
        .then(response => {
            console.log('GeoJSON resposta:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('GeoJSON carregado, features:', data.features.length);
            areaLayer = L.geoJSON(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);

            map.setView(config.centro, config.zoom);
            setTimeout(() => {
                map.fitBounds(areaLayer.getBounds());
            }, 100);
            console.log('Mapa atualizado com sucesso');
        })
        .catch(error => {
            console.error('ERRO ao carregar GeoJSON:', error);
            alert(`Erro ao carregar dados de ${config.nome}. Verifique o console.`);
        });
}

// Trocar de mapa
function trocarMapa(novoMapa) {
    console.log('trocarMapa() chamada:', novoMapa);
    if (mapaAtual === novoMapa) {
        console.log('Mesmo mapa, ignorando');
        return;
    }

    mapaAtual = novoMapa;
    const config = MAPAS[mapaAtual];

    document.getElementById('mapTitle').textContent = config.titulo;
    document.getElementById('mapSubtitle').textContent = config.subtitulo;
    document.getElementById('areaInfo').style.display = 'none';

    atualizarCheckboxesAnos();
    atualizarLegenda();
    atualizarMapa();
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - Inicializando aplicação');
    inicializarMapa();
    atualizarCheckboxesAnos();
    atualizarLegenda();
    atualizarMapa();

    // Slider de intensidade
    const intensitySlider = document.getElementById('intensitySlider');
    const intensityValue = document.getElementById('intensityValue');
    intensitySlider.addEventListener('input', function() {
        intensityValue.textContent = this.value;
        atualizarMapa();
    });

    // Toggle de painéis
    document.getElementById('infoPanelToggle').addEventListener('click', function() {
        this.classList.toggle('collapsed');
        document.getElementById('infoPanelContent').classList.toggle('collapsed');
    });

    document.getElementById('legendToggle').addEventListener('click', function() {
        this.classList.toggle('collapsed');
        document.getElementById('legendContent').classList.toggle('collapsed');
    });

    // Botões de toggle de mapa
    document.getElementById('btnOlinda').addEventListener('click', function() {
        console.log('Botão Olinda clicado');
        document.getElementById('btnOlinda').classList.add('active');
        document.getElementById('btnPernambuco').classList.remove('active');
        trocarMapa('olinda');
    });

    document.getElementById('btnPernambuco').addEventListener('click', function() {
        console.log('Botão Pernambuco clicado');
        document.getElementById('btnPernambuco').classList.add('active');
        document.getElementById('btnOlinda').classList.remove('active');
        trocarMapa('pernambuco');
    });

    console.log('=== APLICAÇÃO INICIALIZADA ===');
});
