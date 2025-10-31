# Deploy no PythonAnywhere

## Passos para fazer deploy em https://fredtorri.pythonanywhere.com/votos/

### 1. Acessar o console do PythonAnywhere

1. Acesse https://www.pythonanywhere.com/
2. Faça login na sua conta (fredtorri)
3. Vá em **"Consoles"** → **"Bash"**

### 2. Clonar o repositório

No console Bash do PythonAnywhere, execute:

```bash
cd ~
git clone https://github.com/fredericopereiratorri/votos.git
```

### 3. Configurar aplicação web

#### Opção A: Servir como arquivos estáticos (Recomendado - Mais simples)

1. Vá em **"Web"** no menu do PythonAnywhere
2. Se já tiver uma aplicação, clique em **"Add a new web app"**
3. Escolha **"Manual configuration"**
4. Escolha Python 3.10 (ou mais recente)
5. Na seção **"Static files"**, adicione:
   - **URL**: `/votos/`
   - **Directory**: `/home/fredtorri/votos/`

6. Clique em **"Reload"** no topo da página

Pronto! Acesse: https://fredtorri.pythonanywhere.com/votos/

#### Opção B: Integrar com aplicação existente

Se você já tem uma aplicação Flask/Django rodando:

1. Vá em **"Web"** → Sua aplicação
2. Na seção **"Static files"**, adicione:
   - **URL**: `/votos/`
   - **Directory**: `/home/fredtorri/votos/`

3. Clique em **"Reload"**

### 4. Atualizações futuras

Sempre que fizer alterações no código local e enviar para o GitHub:

```bash
# No console Bash do PythonAnywhere
cd ~/votos
git pull origin main
```

Depois clique em **"Reload"** na aba Web.

### 5. Verificar

Acesse: https://fredtorri.pythonanywhere.com/votos/

ou

https://fredtorri.pythonanywhere.com/votos/index.html

---

## Troubleshooting

### Erro 404 - Not Found

- Verifique se o caminho do diretório está correto: `/home/fredtorri/votos/`
- Certifique-se de que clicou em "Reload" após adicionar os static files

### Mapa não carrega

- Verifique o console do navegador (F12) para ver erros
- Certifique-se de que todos os arquivos foram clonados corretamente

### Dados não aparecem

- Verifique se o arquivo `dados_eleitorais.js` foi clonado
- Verifique se o arquivo `bairros_olinda_completo.geojson` foi clonado
- Verifique permissões dos arquivos no PythonAnywhere

---

## Estrutura de arquivos no PythonAnywhere

```
/home/fredtorri/
├── votos/
│   ├── index.html
│   ├── mapa.js
│   ├── dados_eleitorais.js
│   ├── bairros_olinda_completo.geojson
│   ├── docs/
│   │   └── Mapa Eleitoral (OLINDA) - Eugênia Lima.xlsx
│   └── README.md
```
