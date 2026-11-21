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

A logo da equipe está em `public/logo.png` (PNG transparente, para assentar em qualquer fundo). Para trocar:

- Coloque `public/logo.png` no repositório (aparece no topo de todas as telas), ou
- Em **Personalizar > Logo > Escolher imagem**, direto no aparelho.

Os ícones em `public/icons/` já usam a logo da equipe sobre fundo vermelho.

## Controle remoto

| Tecla | Ação |
| --- | --- |
| Setas | Move o foco entre os botões |
| OK / Enter | Aciona o botão em foco |
| Voltar | Volta à tela anterior (Android TV, Fire TV, Tizen, webOS) |
| Play/Pause | Inicia e pausa o timer |

## Instalar nos aparelhos

O endereço **`seu-site.vercel.app/baixar`** abre a tela de instalação. Ela detecta o aparelho e mostra o passo a passo dele.

- **Android TV, TV Box e Fire TV:** app (APK) pelo app Downloader, digitando `seu-site.vercel.app/apk`. Aparece na tela inicial da TV.
- **Celular Android e computador:** atalho pelo navegador (botão Adicionar à tela inicial ou menu do Chrome). O APK também serve no Android.
- **iPhone:** Safari, Compartilhar, Adicionar à Tela de Início.
- **TV LG, Samsung e outras:** favorito no navegador da TV.

Timers, playlists e ajustes ficam salvos no próprio aparelho. No iPhone, o app da tela de início guarda os dados separados do Safari.

## Releases

O workflow `.github/workflows/release.yml` compila o APK e cria a Release no GitHub com ele. O endereço `/apk` sempre aponta
para a Release mais recente, então não é preciso mexer no site a cada versão.

```bash
npm version patch          # sobe a versão (1.0.1), cria commit e tag
git push --follow-tags     # o workflow roda sozinho
```

Detalhes de assinatura do APK em `android/LEIAME.md`.
