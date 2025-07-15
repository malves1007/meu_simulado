# meu_simulado
Projeto trabalhado na Disciplina projeto interdisciplinar 2 
Aplicativo de Simulados personalizados, cliente que define, o que será realizado de questões.

Aventuras do Conhecimento


Sobre o Projeto
Aventuras do Conhecimento é uma plataforma de aprendizagem gamificada, desenvolvida como uma Single Page Application (SPA) com React e PHP. O objetivo é transformar o estudo para concursos e provas numa experiência interativa e envolvente, utilizando quizzes, jogos de simulação e um sistema de progressão de níveis para motivar os utilizadores.

A aplicação conta com um painel de administração completo que permite a gestão de todo o conteúdo pedagógico, desde as perguntas dos quizzes até aos cenários do jogo educativo.

Funcionalidades Principais
Sistema de Autenticação: Registo e login de utilizadores com hashing de senhas.

Quiz Interativo: Responda a perguntas de múltipla escolha baseadas no seu nível de conhecimento, com feedback instantâneo.

Jogo Educativo: Um mini-jogo de gestão de projetos onde as suas decisões afetam recursos como orçamento, cronograma e moral da equipa.

Dashboard de Progresso: Acompanhe o seu desempenho com estatísticas de exercícios concluídos, taxa de acerto e um gráfico de progresso para o próximo nível.

Sistema de Níveis: Progrida através dos níveis (Iniciante, Intermediario, Perito) ao atingir metas de desempenho.

Gestão de Perfil: Os utilizadores podem editar as suas informações pessoais e apagar a sua conta.

Painel de Administração Completo:

CRUD (Criar, Ler, Atualizar, Apagar) para perguntas do quiz.

CRUD para cenários do jogo educativo.

Interface com abas para uma gestão de conteúdo organizada.

Tecnologias Utilizadas (Tech Stack)
A arquitetura do projeto é desacoplada, com um front-end moderno e um back-end robusto.

Front-end (Cliente)
React (v18+): Biblioteca principal para a construção da interface.

Vite: Ferramenta de build e servidor de desenvolvimento rápido.

React Router (v6+): Para o roteamento do lado do cliente.

Tailwind CSS: Framework CSS para estilização rápida e consistente.

Recharts: Biblioteca para a criação dos gráficos do dashboard.

Back-end (Servidor)
PHP: Linguagem de scripting para a API RESTful.

PDO (PHP Data Objects): Para uma conexão segura e padronizada com o banco de dados.

Banco de Dados
MySQL: Sistema de gestão de banco de dados relacional.

Instalação e Configuração
Para executar este projeto localmente, siga os passos abaixo.

Pré-requisitos
Um ambiente de servidor local como WAMP ou XAMPP.

Node.js e npm instalados.

1. Configuração do Back-end
Clone o repositório:

git clone (https://github.com/malves1007/meu_simulado?tab=readme-ov-file)

Mova a pasta do projeto para o diretório do seu servidor local (ex: C:\wamp64\www\).

Crie o Banco de Dados:

Abra o phpMyAdmin.

Crie uma nova base de dados chamada simulados.

Importe o Esquema SQL:

Selecione a base de dados simulados.

Vá para a aba "SQL" e execute o script .sql completo do projeto para criar todas as tabelas.

Configure a Conexão:

Abra o ficheiro api/db_config.php.

Verifique se as variáveis $host, $dbname, $user e $pass correspondem às credenciais do seu ambiente MySQL.

2. Configuração do Front-end
Navegue até à pasta do projeto no seu terminal:

cd caminho/para/seu-projeto

Instale as dependências:

npm install

Inicie o servidor de desenvolvimento:

npm run dev

Abra o seu navegador e aceda a http://localhost:5173 (ou o endereço indicado no terminal).

Roadmap Futuro
Monetização: Implementar Google AdSense e explorar modelos de subscrição.

Melhorias de Acesso: Alterar o login para email e senha e adicionar a funcionalidade "Esqueci a minha senha".

Funcionalidades Sociais: Desenvolver um "Modo Competição" com rankings e permitir a partilha de resultados.

Expansão de Conteúdo: Adicionar mais matérias e um sis


-----link do jira https://estudantes-team-mbd77gg1.atlassian.net/jira/software/projects/KAN/list
