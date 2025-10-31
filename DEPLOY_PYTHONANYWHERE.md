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

Vá em **"Web"** no menu do PythonAnywhere e configure sua aplicação existente:

#### Configurações da aplicação (se já existir):

**Code:**
- What your site is running: (mantenha como está - provavelmente Flask ou Django)

**Source code:**
- Enter the path to your web app source code: `/home/fredtorri/` (mantenha como está)

**Working directory:**
- `/home/fredtorri/` (mantenha como está)

**WSGI configuration file:**
- `/var/www/fredtorri_pythonanywhere_com_wsgi.py` (mantenha como está)

**Python version:**
- `3.13` (ou a versão que você está usando)

**Virtualenv:**
- (deixe em branco se não estiver usando, ou mantenha o caminho existente)

#### Adicionar arquivos estáticos (IMPORTANTE):

Role até a seção **"Static files"** e adicione:

| URL | Directory |
|-----|-----------|
| `/votos/` | `/home/fredtorri/votos/` |

**Passos:**
1. Clique em **"+ Add a new static file"** (ou edite uma entrada existente)
2. Em **"URL"**, digite: `/votos/`
3. Em **"Directory"**, digite: `/home/fredtorri/votos/`
4. Clique no ✓ (check) para salvar

#### Recarregar aplicação

Clique no botão verde **"Reload fredtorri.pythonanywhere.com"** no topo da página

Pronto! Acesse: https://fredtorri.pythonanywhere.com/votos/

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
