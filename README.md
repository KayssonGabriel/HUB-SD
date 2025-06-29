# HUB-SD

API em Node.js para um trabalho de Sistemas Distribuídos. O HUB credencia centros de distribuição, consulta o status e os produtos dos centros e registra transações entre eles. O MongoDB armazena os cadastros e as transações.

Uma cópia de [`.env.example`](.env.example) serve de base para configurar o `.env` local.

## Como executar em ambiente local

Tenha Node.js com npm e uma instância local do MongoDB. Configure o endereço do banco e a porta do aplicativo no terminal antes de iniciar o serviço. Por exemplo, no PowerShell:

```powershell
$env:MONGO_URI = 'mongodb://127.0.0.1:27017/hub_sd'
$env:PORT = '3000'
npm ci
npm start
```

Abra a interface Swagger em `http://localhost:3000/api-docs`. Para testar consultas de produtos, cadastre um centro de distribuição de teste que implemente as rotas usadas pelo HUB. O script `npm run dev` inicia o servidor com recarga automática via Nodemon.

## Rotas e arquivos

| Rota | Operação |
| --- | --- |
| `GET /api` | Verificar a disponibilidade da API |
| `POST /api/credenciar`, `GET /api/centros` | Registrar e listar centros |
| `DELETE /api/descredenciar/:id` | Retirar um centro do cadastro |
| `GET /api/status`, `GET /api/produtos` | Consultar status e oferta dos centros |
| `GET /api/transacoes`, `POST /api/transacoes` | Listar e registrar transações. Campos inválidos retornam HTTP 400 |

[server.js](server.js) inicializa o Express e o Swagger. [hubRoutes.js](src/routes/hubRoutes.js) contém o contrato HTTP, [HubController.js](src/controllers/HubController.js) coordena as operações e [src/models](src/models) define os documentos do MongoDB.

Use o projeto em um ambiente de desenvolvimento isolado. Mantenha as credenciais do banco fora do controle de versão e use uma base de teste dedicada.
