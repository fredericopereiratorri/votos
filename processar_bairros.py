import json
import pandas as pd
import random

# Lê a planilha para obter os bairros corretos
print("Lendo planilha para obter lista de bairros...")
df = pd.read_excel('docs/Mapa Eleitoral (OLINDA) - Eugênia Lima.xlsx')

# Extrai os nomes dos bairros (todas as colunas exceto CANDIDATURA e TOTAL)
bairros_planilha = [col for col in df.columns if col not in ['CANDIDATURA ', 'TOTAL']]

print(f"\n{len(bairros_planilha)} bairros encontrados na planilha:")
for b in bairros_planilha:
    print(f"  - {b}")

# Lê o GeoJSON baixado
print("\nLendo GeoJSON...")
with open('bairros_olinda.geojson', 'r', encoding='utf-8') as f:
    geojson = json.load(f)

print(f"Total de features no GeoJSON: {len(geojson['features'])}")

# Normaliza nomes para facilitar matching
def normalizar(nome):
    """Remove acentos, converte para maiúsculas e remove espaços extras"""
    import unicodedata
    if not nome:
        return ""
    # Remove acentos
    nome = ''.join(c for c in unicodedata.normalize('NFD', nome) if unicodedata.category(c) != 'Mn')
    # Maiúsculas e remove espaços
    return nome.upper().strip()

# Cria dicionário de normalização dos bairros da planilha
bairros_norm = {normalizar(b): b for b in bairros_planilha}

print(f"\nBairros normalizados: {len(bairros_norm)}")

# Filtra features que correspondem aos bairros da planilha
features_filtradas = []
bairros_encontrados = set()

for feature in geojson['features']:
    nome = feature['properties'].get('nome', '')
    nome_norm = normalizar(nome)

    # Verifica se é um bairro da planilha
    if nome_norm in bairros_norm:
        # Usa o nome original da planilha
        nome_planilha = bairros_norm[nome_norm]
        feature['properties']['nome'] = nome_planilha

        # Adiciona valor aleatório para o mapa de calor (pode ser substituído por dados reais)
        feature['properties']['valor'] = random.randint(30, 95)

        features_filtradas.append(feature)
        bairros_encontrados.add(nome_planilha)

        print(f"  [OK] Encontrado: {nome} -> {nome_planilha}")

print(f"\n{len(features_filtradas)} bairros mapeados geograficamente")

# Identifica bairros da planilha que não foram encontrados no OSM
bairros_faltando = set(bairros_planilha) - bairros_encontrados

if bairros_faltando:
    print(f"\n{len(bairros_faltando)} bairros da planilha NAO encontrados no OSM:")
    for b in sorted(bairros_faltando):
        print(f"  [X] {b}")

# Cria novo GeoJSON filtrado
geojson_filtrado = {
    "type": "FeatureCollection",
    "features": features_filtradas
}

# Salva o arquivo filtrado
with open('bairros_olinda_filtrado.geojson', 'w', encoding='utf-8') as f:
    json.dump(geojson_filtrado, f, ensure_ascii=False, indent=2)

print(f"\nArquivo 'bairros_olinda_filtrado.geojson' criado com {len(features_filtradas)} bairros!")

# Cria um mapeamento de features do OSM para criar manualmente os faltantes
if bairros_faltando:
    print("\n=== Bairros que precisam ser adicionados manualmente ===")
    print("Estes bairros não foram encontrados no OpenStreetMap:")
    for b in sorted(bairros_faltando):
        print(f"  - {b}")
