// Inicializa o mapa centrado em Olinda
const map = L.map('map').setView([-8.0150, -34.8500], 13);

// Adiciona o tile layer do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

// Variável global para armazenar as camadas dos bairros e o ano selecionado
let bairrosLayer;
let anoSelecionado = 2024;
let dadosGeoJSON;

// Função para obter cor baseada no número de votos (mapa de calor)
function getColor(votos) {
    return votos > 800 ? '#800026' :
           votos > 500 ? '#BD0026' :
           votos > 300 ? '#E31A1C' :
           votos > 150 ? '#FC4E2A' :
           votos > 50  ? '#FD8D3C' :
           votos > 10  ? '#FEB24C' :
                         '#FED976';
}

// Função para estilizar cada bairro
function style(feature, opacity = 0.7) {
    const nomeBairro = feature.properties.nome;
    const votos = obterVotosBairro(nomeBairro, anoSelecionado);

    return {
        fillColor: getColor(votos),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: opacity
    };
}

// Função para destacar bairro ao passar o mouse
function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.9
    });

    layer.bringToFront();
}

// Função para resetar estilo ao tirar o mouse
function resetHighlight(e) {
    bairrosLayer.resetStyle(e.target);
}

// Função para zoom ao clicar
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());

    // Atualiza painel de informações
    const props = e.target.feature.properties;
    const votos = obterVotosBairro(props.nome, anoSelecionado);

    document.getElementById('bairroInfo').style.display = 'block';
    document.getElementById('bairroNome').textContent = props.nome;
    document.getElementById('bairroValor').textContent = votos.toLocaleString('pt-BR') + ' votos';
}

// Função para adicionar eventos a cada feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });

    // Atualiza tooltip com número de votos
    const nomeBairro = feature.properties.nome;
    const votos = obterVotosBairro(nomeBairro, anoSelecionado);
    const tooltipText = `${nomeBairro}\n${votos} votos`;

    // Debug: log cada bairro sendo adicionado
    console.log(`Adicionando bairro: '${nomeBairro}' com ${votos} votos (ano ${anoSelecionado})`);

    layer.bindTooltip(tooltipText, {
        permanent: false,
        direction: 'center',
        className: 'bairro-label'
    });
}

// Função para atualizar o mapa com dados do ano selecionado
function atualizarMapa() {
    if (bairrosLayer && dadosGeoJSON) {
        // Remove a camada antiga
        map.removeLayer(bairrosLayer);

        // Recria a camada com os novos dados (filtrando os que têm 0 votos)
        const opacidadeAtual = document.getElementById('intensitySlider').value / 100;

        bairrosLayer = L.geoJSON(dadosGeoJSON, {
            filter: (feature) => {
                const nomeBairro = feature.properties.nome;
                const votos = obterVotosBairro(nomeBairro, anoSelecionado);
                return votos > 0; // Só desenha se tiver votos
            },
            style: (feature) => style(feature, opacidadeAtual),
            onEachFeature: onEachFeature
        }).addTo(map);

        console.log(`Mapa atualizado para o ano ${anoSelecionado}`);
    }
}

// Carrega o GeoJSON dos bairros
console.log('Carregando dados dos bairros de Olinda...');

fetch('bairros_olinda_completo.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo GeoJSON');
        }
        return response.json();
    })
    .then(data => {
        console.log(`${data.features.length} bairros carregados com sucesso!`);

        // Armazena os dados GeoJSON
        dadosGeoJSON = data;

        // Lista os bairros
        const nomesBairros = data.features.map(f => f.properties.nome).sort();
        console.log('Bairros:', nomesBairros);

        // Adiciona os bairros ao mapa (filtrando os que têm 0 votos)
        const opacidadeInicial = document.getElementById('intensitySlider').value / 100;
        bairrosLayer = L.geoJSON(data, {
            filter: (feature) => {
                const nomeBairro = feature.properties.nome;
                const votos = obterVotosBairro(nomeBairro, anoSelecionado);
                return votos > 0; // Só desenha se tiver votos
            },
            style: (feature) => style(feature, opacidadeInicial),
            onEachFeature: onEachFeature
        }).addTo(map);

        // Ajusta o zoom para mostrar todos os bairros
        const bounds = bairrosLayer.getBounds();
        map.fitBounds(bounds);

        console.log('Mapa de Calor de Olinda carregado com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao carregar os dados dos bairros:', error);
        alert('Erro ao carregar os dados dos bairros. Verifique se o arquivo bairros_olinda_completo.geojson está no mesmo diretório.');
    });

// Controle do seletor de ano
const anoSelect = document.getElementById('anoSelect');
anoSelect.addEventListener('change', function() {
    anoSelecionado = parseInt(this.value);
    console.log(`Ano alterado para: ${anoSelecionado}`);
    atualizarMapa();
});

// Controle de intensidade
const slider = document.getElementById('intensitySlider');
const valueDisplay = document.getElementById('intensityValue');

slider.addEventListener('input', function() {
    const opacity = this.value / 100;
    valueDisplay.textContent = this.value;

    // Atualiza a opacidade de todas as camadas
    if (bairrosLayer) {
        bairrosLayer.eachLayer(function(layer) {
            layer.setStyle({
                fillOpacity: opacity
            });
        });
    }
});
