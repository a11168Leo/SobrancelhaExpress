SobrancelhaExpress — Especificação Funcional e Técnica

O SobrancelhaExpress é um sistema web de gestão para salões de estética, desenvolvido para simplificar a operação diária de administradores, profissionais e clientes. O sistema permite o gerenciamento completo de agendamentos, serviços, clientes e finanças, de forma eficiente e segura.
O projeto utiliza a stack MERN (MongoDB, Express, React e Node.js), com autenticação baseada em JWT e arquitetura organizada em camadas (Controllers, Services, Models e Middlewares).

Perfis de Usuário
Administrador: Possui acesso completo ao sistema, podendo visualizar todas as marcações, acessar todos os calendários dos profissionais, criar, editar e remover serviços, visualizar o faturamento total do salão, adicionar e gerenciar profissionais, e criar agendamentos para clientes.

Profissional: Pode visualizar suas próprias marcações e calendário individual, editar apenas os serviços associados às suas especialidades, acessar seu faturamento individual, criar novos agendamentos, iniciar e concluir serviços, e notificar clientes sobre disponibilidade.

Cliente: Pode agendar serviços, consultar o histórico de atendimentos e receber notificações relacionadas aos seus agendamentos.
Regras de Agendamento
O sistema trabalha com blocos de 30 minutos. Cada serviço possui uma duração definida em minutos, podendo ocupar múltiplos blocos consecutivos.
O sistema não permite sobreposição de horários para o mesmo profissional. Qualquer tentativa de criar agendamento que entre em conflito com outro existente deve ser impedida.

Exemplo de conflito:
Um cliente agenda um serviço às 09:30.
Outro cliente tenta agendar um serviço de 50 minutos às 09:00 para o mesmo profissional.
O sistema deve impedir a marcação devido ao conflito de horários.
O sistema também deve disponibilizar botões para:
Iniciar o serviço, registrando o horário real de início.
Concluir o serviço, registrando o valor no financeiro.
Notificar o cliente quando o profissional estiver disponível.
Execução do Serviço
Cada agendamento possui os seguintes estados operacionais:
Pendente
Em andamento
Concluído
Cancelado
Ao iniciar um serviço, o profissional registra a hora de início e pode notificar o cliente. Ao concluir o serviço, o agendamento é marcado como concluído e o valor do serviço é registrado automaticamente no módulo financeiro, associando o rendimento ao profissional e ao salão.

Financeiro
Cada serviço concluído gera um registro financeiro. O profissional visualiza apenas o seu faturamento individual, enquanto o administrador visualiza o faturamento total do salão. Essa estrutura permite gerar relatórios financeiros, como lucro total e ticket médio.
Modelagem de Dados (MongoDB)
User
nome
email (único)
senha (armazenada com bcrypt)
telefone
role: admin, professional ou client
ativo
data de criação
Servico
nome
descrição
preço
duração em minutos
ativo
categoriaPrincipal (ex: Tratamento Facial)
subcategoria1 (ex: Sobrancelha threading e pestanas)
subcategoria2 (ex: Sobrancelhas)
subcategoria3 (ex: Design de linhas)

Agendamento
clienteId (referência para User)
profissionalId (referência para User)
servicoId (referência para Servico)
dataHoraInicio
dataHoraFim
estado: pendente, em andamento, concluído ou cancelado
observações
Segurança
O sistema utiliza autenticação via JWT com expiração. Todas as rotas protegidas passam por middleware de autenticação e autorização baseada em perfil. O backend valida todos os dados recebidos do frontend e nunca deve confiar apenas nas informações enviadas pelo cliente.