# RPA - Cadastro de Produtos

Aplicação web estática para testes de cadastro e consulta de medicamentos. Não requer banco de dados, servidor de aplicação ou instalação de dependências.

## Funcionalidades

- Cadastro de medicamentos com código interno, nome, princípio ativo, categoria, forma farmacêutica, concentração, fabricante, código de barras, lote, validade, estoque e preço.
- Busca no inventário, indicação de estoque baixo e acompanhamento de validade.
- Exclusão de um produto ou limpeza do inventário.
- Armazenamento no `localStorage` do navegador.
- API JavaScript `window.RPAProdutos` para integração com automações na página.

## Como executar localmente

1. Baixe ou clone este repositório.
2. Abra a pasta no Visual Studio Code e inicie um servidor estático, por exemplo com a extensão **Live Server**.
3. Abra `templates/login.html` no navegador. Com Live Server, use o endereço local mostrado pela extensão, seguido de `/templates/login.html`.

Também é possível iniciar um servidor simples do Python na pasta raiz do projeto:

```powershell
py -m http.server 8000
```

Depois, abra <http://localhost:8000/templates/login.html>.

Login demonstrativo: usuário `demo`, senha `RpaTeste!Produtos-9mK4`.

## Publicar com GitHub Pages

Nas configurações do repositório, habilite **Settings > Pages** e escolha a branch `main` e a pasta raiz (`/(root)`) como origem. Após a publicação, abra:

```text
https://willian837.github.io/rpa-cadastro-produtos/templates/login.html
```

## Avisos

- Este projeto é uma demonstração de front-end: o login `demo` / `RpaTeste!Produtos-9mK4` é validado no próprio JavaScript e **não oferece segurança real**. Não use senhas reais, dados pessoais ou informações confidenciais.
- Os produtos são salvos somente no navegador e no perfil/origem do site em que foram cadastrados. Não são enviados a um servidor, compartilhados com outros usuários ou sincronizados entre dispositivos. Limpar os dados do navegador pode apagá-los.
- A API `window.RPAProdutos` só fica disponível na página do painel depois do login de demonstração.

## Estrutura

```text
css/        Estilos da aplicação e do login
js/         Lógica do login, inventário e API para automação
static/     Imagens e outros arquivos estáticos
templates/ Páginas de login e do painel
```
