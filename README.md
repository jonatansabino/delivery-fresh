# 🥗 FreshBites Fit — Contexto do Negócio

## 🎯 O Problema: A Dor do Cliente

Manter uma alimentação saudável durante a semana pode ser um desafio para pessoas com rotinas intensas, especialmente profissionais que trabalham presencialmente ou em home office.

O FreshBites Fit nasce da identificação de duas principais dificuldades:

**1. Falta de tempo para preparar refeições**

Muitas pessoas não conseguem reservar tempo para planejar, comprar ingredientes e preparar suas marmitas para a semana. Como consequência, acabam recorrendo a alternativas rápidas, que nem sempre atendem às suas preferências alimentares.

**2. Custo e dificuldade dos pedidos diários**

Pedir almoço diariamente em aplicativos de delivery tradicionais pode representar um custo elevado ao longo do mês. Além disso, escolher refeições todos os dias, acompanhar entregas e lidar com possíveis atrasos torna a rotina menos prática.

### 💡 Nossa Solução

O **FreshBites Fit** propõe simplificar a alimentação semanal por meio de marmitas saudáveis, saborosas e prontas para consumo.

Com uma plataforma digital mobile-first, o cliente poderá escolher um plano, personalizar suas refeições, agendar entregas e organizar sua alimentação com antecedência.

**Nossa proposta de valor:**

> Sua semana saudável garantida na geladeira, sem sujar uma panela.

---

## 👥 Público-Alvo

O FreshBites Fit tem como público inicial:

- Profissionais entre 22 e 45 anos.
- Pessoas que trabalham presencialmente ou em home office.
- Trabalhadores com pouco tempo para cozinhar.
- Pessoas que buscam praticidade e alimentação equilibrada.
- Clientes interessados em reduzir a frequência de pedidos avulsos de delivery.

O perfil será validado e ajustado conforme os resultados do MVP.

---

## 📊 Oportunidade de Mercado — TAM, SAM e SOM

| Indicador | Definição                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| **TAM**   | Mercado brasileiro de alimentação saudável e refeições prontas.                                            |
| **SAM**   | Consumidores urbanos que buscam refeições práticas e saudáveis nas cidades onde a operação poderá atender. |
| **SOM**   | Parcela de clientes que o FreshBites Fit pretende conquistar inicialmente na região de lançamento.         |

Esses indicadores representam uma segmentação inicial de mercado. Os valores financeiros e o número estimado de clientes ainda precisam ser calculados com dados de pesquisa e capacidade operacional.

---

## 📋 Business Model Canvas

| Bloco                 | Estratégia                                                                    |
| --------------------- | ----------------------------------------------------------------------------- |
| Segmentos de clientes | Profissionais, trabalhadores urbanos e pessoas com rotinas intensas.          |
| Proposta de valor     | Marmitas saudáveis, práticas e organizadas para a semana.                     |
| Canais                | Plataforma mobile-first, landing page e WhatsApp.                             |
| Relacionamento        | Atendimento personalizado, suporte pelo WhatsApp e relacionamento recorrente. |
| Fontes de receita     | Planos semanais, quinzenais e possíveis vendas avulsas.                       |
| Recursos principais   | Plataforma digital, cozinha, equipe de produção e logística.                  |
| Atividades principais | Preparação de marmitas, gestão de pedidos, atendimento e entregas.            |
| Parcerias principais  | Fornecedores de ingredientes, embalagens e entregadores.                      |
| Estrutura de custos   | Ingredientes, embalagens, mão de obra, entregas, marketing e tecnologia.      |

---

## 🧪 Hipóteses do MVP

O MVP será utilizado para validar três hipóteses principais.

**Hipótese 1 — Preferência por assinaturas**

Os clientes demonstrarão interesse em contratar planos semanais de marmitas em vez de realizar pedidos individuais todos os dias.

**Hipótese 2 — Checkout simplificado**

Um fluxo de compra com envio do pedido diretamente ao WhatsApp poderá reduzir as etapas de conclusão e melhorar a conversão em comparação com um cadastro tradicional.

**Hipótese 3 — Pagamento manual via PIX**

A confirmação manual de pagamentos pelo WhatsApp poderá ser suficiente para iniciar a operação, antes da implementação de um sistema automatizado.

### Indicadores para validação

- Quantidade de visitantes da plataforma.
- Número de pedidos iniciados.
- Pedidos enviados ao WhatsApp.
- Pedidos efetivamente confirmados.
- Taxa de conversão de visitantes em clientes.
- Ticket médio.
- Taxa de recompra.
- Quantidade de assinaturas renovadas.
- Taxa de abandono do checkout.

---

## 🚀 Escopo Operacional do MVP

Para validar o modelo de negócio com menor complexidade inicial, algumas atividades serão realizadas manualmente:

- Confirmação de pagamento por PIX.
- Atendimento e fechamento de pedidos pelo WhatsApp.
- Envio do cardápio semanal em PDF ou imagem.
- Organização manual das rotas de entrega.
- Atualização administrativa dos pedidos.

Essas decisões são intencionais e permitem concentrar os esforços na validação da demanda, no funcionamento do processo de compra e na satisfação dos clientes.

O sistema deverá registrar os pedidos e permitir a atualização manual dos pagamentos por administradores autorizados, sem confundir pedido recebido com pagamento confirmado.

---

## 🎯 Objetivo do FreshBites Fit

Validar a viabilidade de uma plataforma digital de marmitas saudáveis, oferecendo uma experiência simples, acessível pelo celular e orientada à recorrência.

**Mais do que vender marmitas, queremos facilitar a rotina alimentar de quem não tem tempo para cozinhar, mas deseja comer bem.**
---

## Implementação front-end local

FreshBites Fit é um **protótipo demonstrativo 100% front-end**, mobile-first, em React, TypeScript, Vite, Tailwind CSS, React Router DOM, shadcn/ui, Lucide React, React Hook Form, Zod e Recharts.

**Os dados são locais ao navegador e dispositivo. Não há persistência compartilhada, autenticação segura, confirmação operacional real ou pagamentos integrados.** Não utiliza backend, Supabase, Firebase, Lovable Cloud, servidor de pedidos ou banco remoto. Node.js é usado somente nas ferramentas de desenvolvimento/build. A única consulta pública de dados é o ViaCEP; WhatsApp e mapas são abertos por links externos mediante interação.

### Instalar e executar

Requer Node.js 22.12+ e npm.

```bash
npm ci
npm run dev
```

Validação e build:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

O build gera arquivos estáticos em `dist/`. Publique com HTTPS e fallback das rotas para `index.html`. Não há servidor Node.js em produção, variáveis de ambiente ou credenciais para configurar. Nenhuma publicação ou alteração de histórico Git é necessária para executar localmente.

### Funcionalidades e rotas

| Rota            | Funcionalidades                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/`             | Home, endereço selecionado, sacola, categorias, destaques, planos, benefícios e promoções demonstrativas                                  |
| `/cardapio`     | Busca, categoria, preço mínimo/máximo, disponibilidade, preferências, ingrediente e ordenação por popularidade, preço ou nome             |
| `/produto/:id`  | Foto, peso, ingredientes/alérgenos cadastrados, nutrição, adicionais, favoritos e avaliações locais                                       |
| `/planos`       | Seleção rápida dos planos Essencial (5/R$110), Executivo (10/R$200) e Casal/Foco (15/R$285), editáveis no Admin                           |
| `/montar-plano` | Wizard de oito etapas com progresso salvo localmente                                                                                      |
| `/meu-plano`    | Calendário de consumo, troca de dias e totais nutricionais por dia/semana                                                                 |
| `/carrinho`     | Quantidades, remoção, adicionais por unidade, cupom, subtotal, estimativa de frete e total                                                |
| `/checkout`     | Endereços por CEP, zona atendida, faixa de entrega, contato, observações e WhatsApp                                                       |
| `/pedidos`      | Filtros, detalhes históricos, timeline demonstrativa, repetição com preços atuais e WhatsApp                                              |
| `/favoritos`    | Lista persistente de favoritas e inclusão no carrinho                                                                                     |
| `/freshpoints`  | Saldo, histórico e recompensas virtuais sem valor comercial                                                                               |
| `/economia`     | Simulação interativa com planos completos e frete separado                                                                                |
| `/notificacoes` | Histórico de eventos locais e marcação de leitura, sem push remoto                                                                        |
| `/perfil`       | Nome, WhatsApp, e-mail opcional, preferências, tema claro/escuro/sistema e endereços estruturados                                         |
| `/admin`        | Dashboard, gráficos, produtos, categorias, planos, pedidos, clientes, produção, entregas, cupons, zonas, horários, configurações e backup |

O Admin tem uma entrada explicitamente demonstrativa e **não constitui uma barreira de segurança**. Qualquer pessoa com acesso ao navegador pode alterar dados. A navegação administrativa usa sidebar no desktop e menu compacto no mobile.

### Montagem do plano e alimentação

O fluxo guiado segue: **objetivo → plano → preferências → marmitas → organização semanal → entrega → revisão → finalização**. Quantidades são limitadas ao plano, e o avanço é bloqueado até selecionar e distribuir todas as unidades. A seleção rápida continua disponível para quem prefere ir direto ao cardápio.

Objetivos e preferências são escolhas pessoais, sem prescrição médica. Sugestões usam somente os campos cadastrados. Os dias do calendário são dias de consumo, não datas de entrega. Não há renovação de assinatura, pausa contratual ou cobrança recorrente.

Informações nutricionais iniciais são dados fictícios já cadastrados no protótipo. Campos ausentes aparecem como `N/I` e produzem totais parciais. Novos produtos começam com nutrição desconhecida; o Admin deve cadastrar os valores. Adicionais sem informação nutricional não entram nos totais. Alérgenos desconhecidos são identificados como tal: não se deve presumir ausência de glúten, lactose ou outros alérgenos por falta de informação.

### Endereço, ViaCEP e frete

O CEP aceita somente oito dígitos e exibe máscara `XXXXX-XXX`. Após uma pausa curta, o frontend consulta `https://viacep.com.br/ws/{CEP}/json/`. Veja a [documentação oficial do ViaCEP](https://viacep.com.br/).

A integração tem debounce, timeout de 10 segundos, cancelamento por `AbortController`, proteção contra respostas fora de ordem e cache em memória por até 24 horas. O cache não persiste após recarregar. Nenhum pedido ou dado do perfil é enviado ao ViaCEP: a consulta contém apenas o CEP e usa política sem referrer.

Retornos preenchem somente logradouro, bairro, cidade e UF disponíveis. Número, complemento e referência pertencem ao usuário. CEP inexistente, retorno incompleto ou falha de conexão permitem preenchimento manual. Alterar o CEP invalida campos automáticos anteriores; edições manuais são preservadas quando aplicável. O formulário exige CEP, logradouro, bairro, cidade, UF e número (ou “Sem número”), com validação por React Hook Form/Zod.

Exemplo de teste: **01001-000**, Praça da Sé, Sé, São Paulo/SP. O número **100** e o complemento **Sala 5** são exemplos digitados pelo usuário, não retornados da API.

Os endereços podem ser salvos, editados, excluídos, definidos como principal e selecionados no checkout. Encontrar um CEP **não significa que a região é atendida**. O frete é comparado por cidade, bairro e UF, sem geolocalização ou cálculo de distância real.

As zonas iniciais de São Paulo/SP são Sé (R$7,90), Centro (R$7,90), Pinheiros (R$12,90) e Vila Mariana (R$10,90). Valores, prazos, disponibilidade e dias/faixas de entrega são simulados e editáveis em **Admin → Zonas/Horários**. Região sem cadastro ativo bloqueia a criação do pedido e oferece consulta pelo WhatsApp. Sem endereço, o carrinho mostra apenas uma estimativa configurável.

### Checkout, pedidos e WhatsApp

Antes de criar um pedido, o sistema revalida preços locais, disponibilidade, quantidade, cupom, endereço, zona e data/faixa ativa. O ID vem de `crypto.randomUUID()`. Itens, preços, adicionais, endereço e planejamento são guardados como retrato do momento da compra.

O pedido é salvo **antes** de abrir o `wa.me` e permanece `aguardando_pagamento`. Há proteção contra cliques repetidos, confirmação local, link para reabrir o WhatsApp, botão de copiar mensagem e texto selecionável como alternativa. Se o armazenamento falhar, o carrinho permanece e o WhatsApp não é aberto.

**Abrir o WhatsApp não envia automaticamente a mensagem, não confirma comercialmente o pedido, não comprova pagamento e não sincroniza o registro com a empresa.** O usuário precisa enviar a mensagem e aguardar a equipe. A forma de pagamento é PIX a combinar manualmente, sem chave ou cobrança automática.

Configure o número em **Admin → Configurações**. O inicial `5511999999999` é fictício; não envie dados reais para ele. Clientes e pedidos `DEMO-*` também são fictícios. O histórico do cliente mostra pedidos criados no dispositivo; o Admin inclui ambos nos relatórios.

### Cupons, FreshPoints, produção e relatórios

- Cupons suportam desconto percentual/fixo, compra mínima, vencimento, limite local e ativação. `FIT10` dá 10%; `BEMVINDO` dá R$5 com mínimo de R$30 e uma utilização local. O uso é registrado somente quando o pedido é salvo; descontos não ultrapassam o subtotal e não reduzem o frete.
- Confirmar manualmente um pedido no modo demo gera uma única entrada de pontos: 1 ponto por real inteiro do total. Cancelar estorna uma única vez. Alternar status não gera créditos repetidos. Recompensas são selos virtuais, resgatáveis uma vez, sem valor comercial. Tudo é manipulável localmente e não possui controles comerciais contra fraude.
- Produção consolida pedidos selecionados sem repetir IDs. Contagens preparadas são salvas por pedido/produto e limitadas às quantidades solicitadas, mesmo ao alternar a seleção.
- Entregas filtram por data/bairro, mostram endereços e permitem mudar o status demo e abrir um mapa externo. Não há roteirização ou rastreamento em tempo real.
- Recharts exibe pedidos por dia, produtos mais escolhidos, valor por plano, status e evolução semanal. Receita simulada não representa pagamentos recebidos. Relatórios podem ser exportados em CSV.

### Arquitetura e persistência

```text
src/
  types/                 # modelos de catálogo, endereços, cupons e demais módulos
  data/mock*.ts          # todos os dados iniciais separados por domínio
  data/demo.ts           # schemas Zod e composição do estado inicial
  repositories/local.ts # contratos e repositórios locais de produtos, pedidos,
                         # clientes, planos, endereços e cupons
  services/              # armazenamento, CEP, frete, cupons e WhatsApp
  lib/cart.tsx           # provider compartilhado e operações do domínio
  components/            # cards, formulários, calendário, nutrição e Admin
  routes/                # telas do React Router DOM
  test/                  # testes unitários e de integração
```

O `StorageService` concentra `getItem`, `setItem`, `removeItem`, `clearModule`, `exportData`, `importData` e `resetDemoData`, além de leitura/gravação do estado. Os componentes usam provider, serviços e repositórios, sem chamadas diretas a `localStorage`.

O payload tem **versão 3**. A chave `freshbites-local-v2` é mantida para preservar as instalações da versão anterior: campos novos recebem defaults sem substituir produtos, planos, pedidos ou perfil já alterados. Endereços antigos em texto ficam preservados na seção de endereços anteriores; precisam ser cadastrados com CEP para calcular frete. O protótipo mais antigo `freshbites-cart-v1` não é migrado automaticamente.

O armazenamento valida JSON, tipos, IDs duplicados, referências essenciais e totais. Falhas de leitura/gravação exibem avisos; alterações só entram na interface após a gravação. Limpar dados do site, trocar navegador ou usar outro dispositivo perde/separa os registros. Modo privado e limites de quota podem impedir persistência. Não existe sincronização entre abas simultâneas; prefira uma aba para administrar os dados.

### Backup e restauração

Em **Admin → Backup** é possível exportar JSON versionado, selecionar um backup, validar a estrutura e revisar as quantidades antes de confirmar a substituição. Importação inválida não sobrescreve o estado. O limite do arquivo é 4 MB, e seu conteúdo nunca é executado.

Restaurar Mock Data ou limpar dados de uso exige confirmação em modal. A limpeza de uso remove pedidos, clientes, endereços, perfil, favoritos, avaliações, pontos e histórico, mantendo catálogo, cupons e zonas. `clearModule` restaura somente o módulo solicitado aos valores iniciais. Arquivos exportados podem conter dados pessoais; guarde-os com cuidado.

### PWA e offline

O `vite-plugin-pwa` gera manifesto, ícones 192/512 e service worker. O cache contém **somente arquivos estáticos**, incluindo os módulos de código, fotos e interface. Dados pessoais não são colocados no cache do service worker.

Para testar, faça build, execute preview, visite a aplicação e instale pelo botão disponível nos navegadores compatíveis ou pelo menu do navegador. Em iPhone, use o menu de compartilhamento para adicionar à tela inicial quando suportado. HTTPS (ou localhost) é necessário. O primeiro acesso precisa de conexão para armazenar os arquivos. A interface e os dados locais funcionam offline após esse acesso; ViaCEP e WhatsApp precisam de internet. O service worker não é ativado no servidor de desenvolvimento.

A instalação e o comportamento com teclado/safe areas devem ser conferidos também em aparelhos Android/iPhone reais; emulação de viewport não substitui essa verificação.

### Verificação automatizada

Os testes cobrem CEP válido/inválido, máscara, ausência de campos, erros, edição manual, cancelamento e respostas fora de ordem; carrinho/planos/adicionais; disponibilidade, cupons e uso local; criação e prevenção de duplicidade de pedidos; pontuação sem duplicação; repositórios; migração, exportação/importação e restauração.

Playwright verifica os fluxos completos, temas, endereços, favoritos, avaliações, produção e backup, além de ausência de overflow, navegação e bottom sheets em **320, 360, 375, 390, 414, 430, 768 e 1280 px**. A consulta externa é simulada nos testes para serem determinísticos. Há teste de navegação offline do PWA e capturas de referência para inspeção visual.

### Próxima integração com backend

Uma futura versão deverá implementar repositórios assíncronos com API, autenticação e autorização reais, validações comerciais no servidor, persistência compartilhada, sincronização, estoque, pagamentos e fidelidade com controle contra fraude. Será necessário planejar a migração e o consentimento de envio dos dados locais. Os contratos, modelos e componentes atuais separam esses pontos da apresentação; nenhum desses serviços remotos está ativo nesta versão.
