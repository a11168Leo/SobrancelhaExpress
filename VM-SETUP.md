# Setup: Ubuntu VM + Tailscale + VS Code Remote SSH

Guia para rodar o backend do SobrancelhaExpress numa VM Ubuntu local,
acessando e editando remotamente via Tailscale + VS Code.

---

## 1. Criar a VM Ubuntu (Hyper-V ou VirtualBox)

### Opção A — Hyper-V (já vem no Windows 11 Pro)

```powershell
# Ativar Hyper-V (rodar como Administrador no PowerShell)
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
# Reiniciar quando solicitado
```

Depois no Hyper-V Manager:
1. Novo → Máquina Virtual → dar um nome (ex: `sobrancelha-vm`)
2. Geração 2, RAM mínima 2 GB (4 GB recomendado)
3. Criar disco virtual (20 GB+)
4. Montar ISO do Ubuntu 22.04 ou 24.04: https://ubuntu.com/download/server
5. Iniciar e seguir instalação (escolher "Ubuntu Server" sem GUI)

### Opção B — VirtualBox (mais simples)

1. Baixar: https://www.virtualbox.org/
2. Novo → Ubuntu 22.04, 2–4 GB RAM, 20 GB disco
3. Configurações → Rede → Adaptador 1: **NAT** (para internet)
4. Adapatador 2: **Host-Only** (para acessar a VM da sua rede)
5. Montar ISO e instalar

---

## 2. Configuração inicial do Ubuntu

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar ferramentas básicas
sudo apt install -y curl git openssh-server ufw

# Verificar IP da VM (anote esse IP)
ip addr show
```

### Configurar SSH

```bash
# Garantir que o SSH está rodando
sudo systemctl enable --now ssh

# Ajustar firewall
sudo ufw allow ssh
sudo ufw enable
```

---

## 3. Instalar Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node --version   # deve mostrar v22.x.x
npm --version
```

---

## 4. Instalar Tailscale (na VM e no seu PC Windows)

### Na VM Ubuntu

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# Vai exibir um link — abra no navegador para autenticar
```

### No seu PC Windows

Baixe o instalador: https://tailscale.com/download/windows

Após instalar:
1. Fazer login com a mesma conta do Tailscale
2. Ambas as máquinas aparecem no painel em https://login.tailscale.com/admin/machines
3. A VM vai ter um IP Tailscale tipo `100.x.x.x` — anote esse IP

### Verificar conectividade

```powershell
# No seu PC Windows (PowerShell)
ping 100.x.x.x   # IP Tailscale da VM
```

---

## 5. Transferir os arquivos do projeto para a VM

### Opção A — via Git (recomendado se o projeto está no GitHub)

```bash
# Na VM
git clone https://github.com/SEU_USUARIO/SobrancelhaExpress.git ~/sobrancelha
```

### Opção B — copiar direto do PC via SCP

```powershell
# No seu PC Windows (PowerShell)
# Substitua 100.x.x.x pelo IP Tailscale da VM
scp -r "C:\Users\leona\Desktop\CPW\SobrancelhaExpress" usuario@100.x.x.x:~/sobrancelha
```

### Opção C — rsync (mais rápido para atualizações futuras)

```bash
# Instalar rsync no Windows (via Scoop ou Git Bash)
# Depois:
rsync -avz --exclude node_modules --exclude .git \
  "C:/Users/leona/Desktop/CPW/SobrancelhaExpress/" \
  usuario@100.x.x.x:~/sobrancelha/
```

---

## 6. Configurar o projeto na VM

```bash
cd ~/sobrancelha/backend

# Instalar dependências
npm install

# Criar o arquivo .env (copie o conteúdo do .env do seu PC)
nano .env
```

Conteúdo do `.env` na VM (adapte as URLs para o IP Tailscale):

```env
PORT=3333
MONGO_URI=mongodb+srv://adminLeonardo:SENHA@clustersb1.tpogwjc.mongodb.net/?appName=ClusterSb1
JWT_SECRET=SEU_JWT_SECRET_FORTE_AQUI
SMTP_USER=sobrancelhaexpress.testes@gmail.com
SMTP_PASS=SUA_APP_PASSWORD_GMAIL
SMTP_FROM=sobrancelhaexpress.testes@gmail.com
APP_BASE_URL=http://100.x.x.x:5174
APP_BASE_URL_PROD=http://100.x.x.x:5174
```

### Liberar porta 3333 no firewall da VM

```bash
sudo ufw allow 3333/tcp
```

---

## 7. Rodar o backend como serviço (PM2)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Entrar na pasta do backend
cd ~/sobrancelha/backend

# Iniciar o servidor
pm2 start src/server.js --name sobrancelha-backend

# Fazer o PM2 iniciar automaticamente com o sistema
pm2 startup
pm2 save
```

Comandos úteis do PM2:
```bash
pm2 status          # ver se está rodando
pm2 logs            # ver logs em tempo real
pm2 restart sobrancelha-backend
pm2 stop sobrancelha-backend
```

---

## 8. VS Code Remote SSH via Tailscale

### Pré-requisito: extensão Remote - SSH no VS Code

No VS Code → Extensions → buscar "Remote - SSH" (publisher: Microsoft) → instalar.

### Configurar o arquivo SSH

```powershell
# No seu PC Windows, abrir (ou criar) o arquivo:
# C:\Users\leona\.ssh\config
```

Adicione:

```
Host sobrancelha-vm
  HostName 100.x.x.x
  User SEU_USUARIO_UBUNTU
  IdentityFile ~/.ssh/id_ed25519
```

> Substitua `100.x.x.x` pelo IP Tailscale da VM e `SEU_USUARIO_UBUNTU` pelo usuário criado na instalação.

### Gerar chave SSH (se não tiver)

```powershell
# No seu PC Windows
ssh-keygen -t ed25519 -C "dev@sobrancelha"

# Copiar a chave pública para a VM
ssh-copy-id usuario@100.x.x.x
# ou manualmente: copiar conteúdo de ~/.ssh/id_ed25519.pub
# e colar em ~/.ssh/authorized_keys na VM
```

### Conectar via VS Code

1. `Ctrl + Shift + P` → "Remote-SSH: Connect to Host..."
2. Selecionar `sobrancelha-vm`
3. VS Code abre uma janela conectada à VM
4. File → Open Folder → `/home/SEU_USUARIO/sobrancelha`

Agora você edita os arquivos da VM direto no VS Code, com terminal integrado,
extensões e tudo funcionando como se fosse local.

---

## 9. Acesso ao frontend (Vite) pela rede Tailscale

Para acessar o frontend do outro PC via Tailscale, edite o [frontend/vite.config.js](frontend/vite.config.js):

```js
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // escuta em todas as interfaces
    port: 5174,
  }
})
```

Depois inicie: `npm run dev` no frontend da VM.
Acesse de qualquer máquina Tailscale: `http://100.x.x.x:5174`

---

## Resumo — Portas a abrir no firewall da VM

| Porta | Serviço |
|-------|---------|
| 22    | SSH     |
| 3333  | Backend API |
| 5174  | Frontend Vite (dev) |

```bash
sudo ufw allow 22/tcp
sudo ufw allow 3333/tcp
sudo ufw allow 5174/tcp
sudo ufw status
```

---

## Manutenção: sincronizar código do PC para a VM

Depois de editar no PC e querer enviar para a VM:

```bash
# Via rsync (rápido, só envia o que mudou)
rsync -avz --exclude node_modules --exclude .git \
  "C:/Users/leona/Desktop/CPW/SobrancelhaExpress/" \
  usuario@100.x.x.x:~/sobrancelha/

# Reiniciar o backend na VM
ssh usuario@100.x.x.x "pm2 restart sobrancelha-backend"
```

Ou simplesmente edite diretamente na VM pelo VS Code Remote SSH — mais prático.
