# ColiseuAX Timer

Timer de treino e placar de Jiu-Jitsu para TV, celular e computador. Feito para a ColiseuAX e a Team Alexandre Xuxa.

- Instagram: [@coliseuax](https://www.instagram.com/coliseuax/) e [@teamalexandrexuxa](https://www.instagram.com/teamalexandrexuxa/)

## O que tem

- **Timers:** rounds, Tabata, circuito, regressivo, progressivo e Open Mat, com modelos prontos (lutas de 5 a 10 min).
- **Placar de Jiu-Jitsu:** pontos, vantagens, punições, desfazer e cronômetro da luta.
- **Playlists:** vários timers em sequência.
- **Modo TV:** tela cheia com tempo gigante, fila de fases, navegação pelo controle remoto (setas, OK e Voltar), tela sempre ligada.
- **Personalização:** nome, equipe, professor, cor, logo, imagem de fundo, sons e frases motivacionais.
- **Funciona offline** depois do primeiro acesso (PWA) e pode ser instalado no celular e no computador.

Tudo fica salvo no próprio aparelho (localStorage). Não há login nem backend.

## Rodar

```bash
npm install
npm run dev        # desenvolvimento
npm test           # testes do motor do timer
npm run build      # gera dist/
```

## Publicar na Vercel

1. Em vercel.com, **Add New > Project** e escolha este repositório.
2. Framework: Vite (detectado sozinho). Build `npm run build`, saída `dist`.
3. Deploy. A cada push na branch principal o site atualiza sozinho.

## Logo

A logo está vazia de propósito. Quando tiver o arquivo, use uma das opções:

- Coloque `public/logo.png` no repositório (aparece no topo de todas as telas), ou
- Em **Personalizar > Logo > Escolher imagem**, direto no aparelho.

Os ícones em `public/icons/` são provisórios (monograma "AX"). Troque pelos definitivos mantendo os nomes e tamanhos.

## Controle remoto

| Tecla | Ação |
| --- | --- |
| Setas | Move o foco entre os botões |
| OK / Enter | Aciona o botão em foco |
| Voltar | Volta à tela anterior (Android TV, Fire TV, Tizen, webOS) |
| Play/Pause | Inicia e pausa o timer |

## APK Android TV

A pasta `android/` descreve como empacotar o site como app Android (TWA) para Android TV e Fire TV. Veja `android/LEIAME.md`.
