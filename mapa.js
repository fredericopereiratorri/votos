// Inicializa o mapa centrado em Olinda
const map = L.map('map').setView([-8.0150, -34.8500], 13);

// Adiciona o tile layer do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

// Variável global para armazenar as camadas dos bairros e os anos selecionados
let bairrosLayer;
let anosSelecionados = [2024]; // Array de anos selecionados
let dadosGeoJSON;

// Função para calcular média de votos de um bairro nos anos selecionados
function calcularMediaVotos(nomeBairro) {
    let somaVotos = 0;
    let contador = 0;

    for (let ano of anosSelecionados) {
        const votos = obterVotosBairro(nomeBairro, ano);
        somaVotos += votos;
        contador++;
    }

    return contador > 0 ? Math.round(somaVotos / contador) : 0;
}

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
    const mediaVotos = calcularMediaVotos(nomeBairro);

    return {
        fillColor: getColor(mediaVotos),
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
    const mediaVotos = calcularMediaVotos(props.nome);

    // Criar texto com detalhes dos anos
    let detalhesAnos = '';
    if (anosSelecionados.length > 1) {
        const detalhes = anosSelecionados.map(ano => {
            const votos = obterVotosBairro(props.nome, ano);
            return `${ano}: ${votos.toLocaleString('pt-BR')}`;
        });
        detalhesAnos = detalhes.join(' | ');
    } else {
        detalhesAnos = `Ano: ${anosSelecionados[0]}`;
    }

    document.getElementById('bairroInfo').style.display = 'block';
    document.getElementById('bairroNome').textContent = props.nome;
    document.getElementById('bairroValor').textContent = mediaVotos.toLocaleString('pt-BR') + ' votos';
    document.getElementById('anosInfo').textContent = detalhesAnos;
}

// Função para adicionar eventos a cada feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });

    // Atualiza tooltip com média de votos
    const nomeBairro = feature.properties.nome;
    const mediaVotos = calcularMediaVotos(nomeBairro);
    const tooltipText = `${nomeBairro}\nMédia: ${mediaVotos} votos`;

    // Debug: log cada bairro sendo adicionado
    console.log(`Adicionando bairro: '${nomeBairro}' com média ${mediaVotos} votos (anos: ${anosSelecionados.join(', ')})`);

    layer.bindTooltip(tooltipText, {
        permanent: false,
        direction: 'center',
        className: 'bairro-label'
    });
}

// Função para atualizar o mapa com dados dos anos selecionados
function atualizarMapa() {
    if (bairrosLayer && dadosGeoJSON) {
        // Remove a camada antiga
        map.removeLayer(bairrosLayer);

        // Recria a camada com os novos dados (filtrando os que têm média 0)
        const opacidadeAtual = document.getElementById('intensitySlider').value / 100;

        bairrosLayer = L.geoJSON(dadosGeoJSON, {
            filter: (feature) => {
                const nomeBairro = feature.properties.nome;
                const mediaVotos = calcularMediaVotos(nomeBairro);
                return mediaVotos > 0; // Só desenha se a média for > 0
            },
            style: (feature) => style(feature, opacidadeAtual),
            onEachFeature: onEachFeature
        }).addTo(map);

        console.log(`Mapa atualizado para os anos: ${anosSelecionados.join(', ')}`);
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

        // Adiciona os bairros ao mapa (filtrando os que têm média 0)
        const opacidadeInicial = document.getElementById('intensitySlider').value / 100;
        bairrosLayer = L.geoJSON(data, {
            filter: (feature) => {
                const nomeBairro = feature.properties.nome;
                const mediaVotos = calcularMediaVotos(nomeBairro);
                return mediaVotos > 0; // Só desenha se a média for > 0
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

// Controle do seletor de anos (checkboxes)
const anoCheckboxes = document.querySelectorAll('input[name="ano"]');

// Adicionar event listener a cada checkbox
anoCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // Pegar todos os anos marcados
        const checkedBoxes = document.querySelectorAll('input[name="ano"]:checked');
        anosSelecionados = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

        // Se nenhum ano estiver selecionado, usar 2024 como padrão
        if (anosSelecionados.length === 0) {
            anosSelecionados = [2024];
            document.querySelector('input[name="ano"][value="2024"]').checked = true;
        }

        console.log(`Anos selecionados: ${anosSelecionados.join(', ')}`);
        atualizarMapa();
    });
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
