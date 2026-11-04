# Rotas

As rotas são declaradas explicitamente em `src/main.tsx` usando React Router DOM.
Cada arquivo desta pasta exporta um componente de tela. `AppShell` fornece navegação
mobile e desktop, e `CartProvider` fornece os dados locais compartilhados.

A rota de detalhes é `/produto/:id`; o componente usa `useParams`. Não há loaders,
server functions, SSR ou arquivos de rotas gerados. Em hospedagem estática, redirecione
rotas desconhecidas para `index.html` para permitir recarregamento de links diretos.
