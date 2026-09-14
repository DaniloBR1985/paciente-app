# PacienteApp (Frontend Angular)

Resumo curto
- Aplicação frontend Angular 16 para cadastro e edição de pacientes.
- UI: Angular Material, formulários reativos, máscaras via ngx-mask.
- Comunicação com API em https://localhost:7137/ via Axios.

Instalação (local)
1. Clone o repositório:
   git clone https://github.com/DaniloBR1985/paciente-app.git
   cd paciente-app

2. Instale dependências:
   npm install

3. Execute em modo desenvolvimento:
   npm start
   - Abre em: http://localhost:4200

4. Build para produção:
   npm run build

Configuração da API
- URL da API configurada em:
  - `src/environments/environment.ts` (dev)
  - `src/environments/environment.prod.ts` (prod)
- Padrão atual: `https://localhost:7137`

Se o backend estiver em outra origem, atualize os arquivos acima.

CORS e HTTPS (problemas comuns)
- Se o navegador bloquear chamadas para `https://localhost:7137` por CORS, habilite CORS no backend (ex.: API .NET). Exemplo mínimo para Program.cs (.NET 6+):
- Program.cs builder.Services.AddCors(opt => { opt.AddPolicy("AllowAngularDev", p => p.WithOrigins("http://localhost:4200") .AllowAnyHeader() .AllowAnyMethod()); });
app.UseCors("AllowAngularDev");

- Se usar certificado de desenvolvimento no Windows, rode:
  dotnet dev-certs https --trust

Arquitetura (visão geral)
- Lazy-loaded module por domínio:
  - `src/app/modules/pacientes/` — módulo lazy com componentes:
    - `paciente-list` — listagem, inativação, navegação para editar/criar.
    - `paciente-form` — create/edit, validações e máscaras.
- Serviços (integração HTTP):
  - `src/app/services/*.ts` — `paciente.service`, `genero.service`, `convenio.service`
  - Implementados com Axios (`src/app/core/api.service.ts`) e environment-based baseURL.
- Models / DTOs:
  - `src/app/models/*.ts` — interfaces para Dtos (Paciente, Genero, Convenio).
- Formulários:
  - Reactive Forms com validações customizadas:
    - Nome / Sobrenome obrigatórios
    - Data de nascimento não pode ser futura
    - Gênero obrigatório
    - RG + UF do RG obrigatórios e UF validada contra lista de siglas
    - CPF (opcional): sanitização e validação de dígitos; verificação básica de unicidade no frontend
    - Pelo menos um telefone válido (mín. 8 dígitos)
    - Validade da carteirinha: formato MM/YYYY
- UI:
  - Angular Material (tabela, formulários, select, snackbar, spinner)
  - Máscaras com ngx-mask
- Erros e feedback:
  - Tratamento central básico de erros no serviço (parse de erro de API)
  - Mensagens de erro da API são aplicadas nos campos quando possível

Padrões e boas práticas
- Separação de camadas: components (UI) ↔ services (API) ↔ models (tipos)
- Lazy-loading para módulos pesados
- Environment-based configuration para endpoints
- Validações no cliente para UX; backend mantém validações finais (unicidade, integridade)
- Uso de MatSnackBar para feedback consistente

Endpoints usados (exemplos)
- GET  /api/Pacientes           — lista pacientes
- GET  /api/Pacientes/{id}      — obter paciente
- POST /api/Pacientes           — criar paciente
- PUT  /api/Pacientes/{id}      — atualizar paciente
- DELETE /api/Pacientes/{id}    — inativar paciente (exclusão lógica)
- GET  /api/Generos             — lista gêneros
- GET  /api/Convenios           — lista convênios
