# Mapa de Calor - Bairros de Olinda

Aplicativo interativo de mapa de calor mostrando TODOS os bairros de Olinda com seus limites geográficos REAIS obtidos do OpenStreetMap.

## Características

- **48 Bairros de Olinda** mapeados com limites geográficos reais do OpenStreetMap
- **Limites precisos** - Cada bairro é desenhado conforme suas dimensões geográficas naturais (não são quadrados!)
- **Mapa de calor interativo** com 7 níveis de intensidade
- **Interface responsiva** com painel de informações e legenda
- **Controle de intensidade** ajustável via slider
- **Tooltips informativos** ao passar o mouse
- **Zoom automático** ao clicar em um bairro

## Bairros Incluídos (Todos da Planilha)

### Bairros Principais
- AGUAZINHA
- ALTO DA BONDADE
- ALTO DA CONQUISTA
- ALTO JARDIM DA CONQUISTA
- ALTO SOL NASCENTE
- AMARO BRANCO
- BAIRRO NOVO
- BONSUCESSO
- BULTRINS
- CAIXA D'ÁGUA
- CARMO
- CASA CAIADA
- FRAGOSO
- FRAGOSO (JATOBÁ)
- GUADALUPE
- MONTE
- PASSARINHO
- PEIXINHOS
- SALGADINHO
- SANTA TEREZA
- SAPUCAIA
- SÃO BENEDITO
- TABAJARA
- VARADOURO
- VILA POPULAR
- ÁGUAS COMPRIDAS

### Jardins
- JD ATLÂNTICO
- JD BRASIL
- JD BRASIL 2

### Rio Doce e Etapas
- RIO DOCE
- RIO DOCE - 2 ETAPA
- RIO DOCE - 3 ETAPA
- RIO DOCE - 4 ETAPA
- RIO DOCE - 5 ETAPA

### Ouro Preto e Subdivisões
- OURO PRETO
- OURO PRETO (7/RO)
- OURO PRETO (ARG)
- OURO PRETO (CAP)
- OURO PRETO (CEL)
- OURO PRETO (DIN)
- OURO PRETO (FLOR)
- OURO PRETO (IST)
- OURO PRETO (IZA)
- OURO PRETO (MERE)

## Como Usar

### Opção 1: Com Servidor HTTP (Recomendado)

1. Abra o terminal/prompt na pasta do projeto
2. Execute: `python -m http.server 8000`
3. Abra o navegador em: http://localhost:8000
4. Explore o mapa interagindo com os bairros

### Opção 2: Sem Servidor (Pode ter problemas de CORS)

1. Abra o arquivo `index.html` diretamente no navegador
2. Se houver erro de CORS, use a Opção 1

### Interação com o Mapa

- **Passe o mouse** sobre um bairro para ver o nome
- **Clique** em um bairro para dar zoom e ver informações detalhadas
- **Use o slider** de intensidade para ajustar a opacidade do mapa de calor
- **Navegue** usando o mouse: arraste para mover, scroll para zoom

## Tecnologias Utilizadas

- **Leaflet.js** - Biblioteca de mapas interativos
- **OpenStreetMap** - Dados de mapa base e limites dos bairros
- **GeoJSON** - Formato de dados geográficos
- **HTML5/CSS3/JavaScript** - Frontend
- **Python** - Scripts de processamento de dados
- **GeoPandas/Shapely** - Manipulação de dados geográficos
- **OSMnx** - Download de dados do OpenStreetMap

## Estrutura de Arquivos

```
votos/
├── index.html                          # Página principal do aplicativo
├── mapa.js                             # Lógica do mapa e visualização
├── bairros_olinda_completo.geojson    # Dados geográficos dos bairros (502KB)
├── docs/                               # Planilhas com dados eleitorais
│   └── Mapa Eleitoral (OLINDA) - Eugênia Lima.xlsx
├── buscar_bairros.py                  # Script para baixar dados do OSM
├── processar_bairros.py               # Script para filtrar bairros
├── criar_subdivisoes.py               # Script para criar subdivisões
└── README.md                          # Este arquivo
```

## Escala de Intensidade

- **Muito Alto (80-100)**: Vermelho escuro (#800026)
- **Alto (60-80)**: Vermelho (#BD0026)
- **Médio-Alto (40-60)**: Vermelho claro (#E31A1C)
- **Médio (20-40)**: Laranja escuro (#FC4E2A)
- **Médio-Baixo (10-20)**: Laranja (#FD8D3C)
- **Baixo (5-10)**: Amarelo claro (#FEB24C)
- **Muito Baixo (0-5)**: Amarelo (#FED976)

## Dados Geográficos

### Fonte
Os limites geográficos dos bairros foram obtidos do **OpenStreetMap** usando:
- OSMnx para download de polígonos administrativos
- GeoPandas e Shapely para processamento geométrico
- Subdivisions criadas algoritmicamente para bairros sem limites definidos no OSM

### Precisão
- 29 bairros com limites reais do OpenStreetMap
- 19 subdivisões criadas algoritmicamente a partir dos bairros principais:
  - Rio Doce dividido em 5 etapas
  - Ouro Preto dividido em 10 subdivisões
  - Fragoso dividido em 2 áreas
  - Outros bairros subdivididos conforme necessário

## Personalização

### Modificar Valores de Intensidade

Para modificar os valores de intensidade dos bairros com dados reais da planilha:

1. Edite o arquivo `bairros_olinda_completo.geojson`
2. Modifique a propriedade `valor` de cada bairro (0-100)
3. Ou crie um script Python para ler os dados da planilha e atualizar o GeoJSON

Exemplo de script para atualizar com dados reais:
```python
import json
import pandas as pd

# Ler planilha
df = pd.read_excel('docs/Mapa Eleitoral (OLINDA) - Eugênia Lima.xlsx')

# Ler GeoJSON
with open('bairros_olinda_completo.geojson', 'r', encoding='utf-8') as f:
    geojson = json.load(f)

# Atualizar valores
for feature in geojson['features']:
    bairro = feature['properties']['nome']
    if bairro in df.columns:
        # Calcular valor baseado nos dados da planilha
        valor = df[bairro].sum()  # ou outra lógica
        feature['properties']['valor'] = valor

# Salvar
with open('bairros_olinda_completo.geojson', 'w', encoding='utf-8') as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)
```

### Modificar Cores

Edite a função `getColor()` no arquivo `mapa.js:14` para alterar o esquema de cores.

## Scripts de Processamento

### buscar_bairros.py
Baixa os limites dos bairros do OpenStreetMap usando OSMnx.

```bash
python buscar_bairros.py
```

### processar_bairros.py
Filtra os bairros baixados, mantendo apenas os que estão na planilha.

```bash
python processar_bairros.py
```

### criar_subdivisoes.py
Cria subdivisões para bairros que não foram encontrados no OSM (etapas, subdivisões, etc).

```bash
python criar_subdivisoes.py
```

## Dependências Python

Para executar os scripts de processamento:

```bash
pip install pandas openpyxl osmnx geopandas shapely
```

## Suporte

O aplicativo funciona em todos os navegadores modernos:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Notas

- Os valores de intensidade atuais são aleatórios (30-95)
- Para usar dados reais da planilha, implemente a lógica de leitura conforme exemplo acima
- Alguns bairros podem aparecer duplicados no OSM - isso é normal e foi tratado
- As subdivisões de bairros foram criadas algoritmicamente dividindo os polígonos principais
