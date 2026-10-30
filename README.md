# CINZAS

Um jogo de decisões de sobrevivência num apocalipse zumbi, que roda no navegador. A cada dia você escolhe o que fazer, cuida de saúde, comida, munição e moral, e ganha quem sobreviver por mais dias.

> *"Não existe um destino. Existe apenas o próximo dia."*

**Este é um projeto de estudo**, criado para treinar desenvolvimento web na prática, com HTML, CSS e JavaScript puros, sem frameworks e sem servidor. Desenvolvido com o apoio do Claude Code (IA) como ferramenta de estudo.

## Como jogar

Cada dia traz uma situação com até 4 escolhas, e cada escolha muda seus atributos e o rumo da história. Se a saúde ou a comida chegar a zero, a partida acaba.

- **Episódios em 3 atos:** histórias com começo, meio e fim, que mudam conforme as suas escolhas.
- **Desafio do dia:** todo mundo joga a mesma rota no mesmo dia, para comparar com os amigos.
- **Álbum de finais:** cada episódio tem finais diferentes para descobrir.
- **Compartilhar:** gera um cartão com o seu resultado.

Para jogar no computador, rode um servidor local na pasta do projeto (os módulos do JavaScript não funcionam abrindo o arquivo direto) e acesse `http://localhost:8000`:

```bash
python3 -m http.server 8000
```

## O que pratiquei

- **JavaScript:** módulos ES, funções assíncronas e organização do projeto em vários arquivos.
- **SVG gerado por código e animações em CSS:** cenas, personagens e clima.
- **Web Audio API:** trilha sonora sintetizada, sem arquivos de áudio.
- **IndexedDB:** placar, desafio e álbum guardados no navegador.
- **Canvas e Web Share API:** imagem e compartilhamento do resultado.
- **Sorteio com semente:** o desafio do dia é igual para todos.
- **Modelagem de histórias:** episódios escritos como dados, com ramificações.
- **Testar antes de integrar:** páginas de teste separadas (`preview-*.html`) para cada ideia nova.
- **Git:** commits pequenos e bem descritos.

## Privacidade

Não há servidor nem coleta de dados. Recorde, placar, desafio e álbum ficam só no navegador de quem joga.

## Licença

Distribuído sob a [licença MIT](LICENSE).
