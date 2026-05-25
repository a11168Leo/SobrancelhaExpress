
<!--
====================
SECAO INTERNA PADRAO
====================
-->

SobrancelhaExpress â€” EspecificaÃ§Ã£o Funcional e TÃ©cnica

O SobrancelhaExpress Ã© um sistema web de gestÃ£o para salÃµes de estÃ©tica, desenvolvido para simplificar a operaÃ§Ã£o diÃ¡ria de administradores, profissionais e clientes. O sistema permite o gerenciamento completo de agendamentos, serviÃ§os, clientes e finanÃ§as, de forma eficiente e segura.
O projeto utiliza a stack MERN (MongoDB, Express, React e Node.js), com autenticaÃ§Ã£o baseada em JWT e arquitetura organizada em camadas (Controllers, Services, Models e Middlewares).

Perfis de UsuÃ¡rio
Administrador: Possui acesso completo ao sistema, podendo visualizar todas as marcaÃ§Ãµes, acessar todos os calendÃ¡rios dos profissionais, criar, editar e remover serviÃ§os, visualizar o faturamento total do salÃ£o, adicionar e gerenciar profissionais, e criar agendamentos para clientes.

Profissional: Pode visualizar suas prÃ³prias marcaÃ§Ãµes e calendÃ¡rio individual, editar apenas os serviÃ§os associados Ã s suas especialidades, acessar seu faturamento individual, criar novos agendamentos, iniciar e concluir serviÃ§os, e notificar clientes sobre disponibilidade.

Cliente: Pode agendar serviÃ§os, consultar o histÃ³rico de atendimentos e receber notificaÃ§Ãµes relacionadas aos seus agendamentos.
Regras de Agendamento
O sistema trabalha com blocos de 30 minutos. Cada serviÃ§o possui uma duraÃ§Ã£o definida em minutos, podendo ocupar mÃºltiplos blocos consecutivos.
O sistema nÃ£o permite sobreposiÃ§Ã£o de horÃ¡rios para o mesmo profissional. Qualquer tentativa de criar agendamento que entre em conflito com outro existente deve ser impedida.

Exemplo de conflito:
Um cliente agenda um serviÃ§o Ã s 09:30.
Outro cliente tenta agendar um serviÃ§o de 50 minutos Ã s 09:00 para o mesmo profissional.
O sistema deve impedir a marcaÃ§Ã£o devido ao conflito de horÃ¡rios.
O sistema tambÃ©m deve disponibilizar botÃµes para:
Iniciar o serviÃ§o, registrando o horÃ¡rio real de inÃ­cio.
Concluir o serviÃ§o, registrando o valor no financeiro.
Notificar o cliente quando o profissional estiver disponÃ­vel.
ExecuÃ§Ã£o do ServiÃ§o
Cada agendamento possui os seguintes estados operacionais:
Pendente
Em andamento
ConcluÃ­do
Cancelado
Ao iniciar um serviÃ§o, o profissional registra a hora de inÃ­cio e pode notificar o cliente. Ao concluir o serviÃ§o, o agendamento Ã© marcado como concluÃ­do e o valor do serviÃ§o Ã© registrado automaticamente no mÃ³dulo financeiro, associando o rendimento ao profissional e ao salÃ£o.

Financeiro
Cada serviÃ§o concluÃ­do gera um registro financeiro. O profissional visualiza apenas o seu faturamento individual, enquanto o administrador visualiza o faturamento total do salÃ£o. Essa estrutura permite gerar relatÃ³rios financeiros, como lucro total e ticket mÃ©dio.
Modelagem de Dados (MongoDB)
User
nome
email (Ãºnico)
senha (armazenada com bcrypt)
telefone
role: admin, professional ou client
ativo
data de criaÃ§Ã£o
Servico
nome
descriÃ§Ã£o
preÃ§o
duraÃ§Ã£o em minutos
ativo
categoriaPrincipal (ex: Tratamento Facial)
subcategoria1 (ex: Sobrancelha threading e pestanas)
subcategoria2 (ex: Sobrancelhas)
subcategoria3 (ex: Design de linhas)

Agendamento
clienteId (referÃªncia para User)
profissionalId (referÃªncia para User)
servicoId (referÃªncia para Servico)
dataHoraInicio
dataHoraFim
estado: pendente, em andamento, concluÃ­do ou cancelado
observaÃ§Ãµes
SeguranÃ§a
O sistema utiliza autenticaÃ§Ã£o via JWT com expiraÃ§Ã£o. Todas as rotas protegidas passam por middleware de autenticaÃ§Ã£o e autorizaÃ§Ã£o baseada em perfil. O backend valida todos os dados recebidos do frontend e nunca deve confiar apenas nas informaÃ§Ãµes enviadas pelo cliente.

