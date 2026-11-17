# APK para Android TV e Fire TV

O app Android é uma casca (TWA) que abre o site publicado na Vercel em tela cheia, sem barra de endereço.
Por isso o APK só pode ser gerado depois que o site estiver no ar e tiver um endereço fixo.

## Passo a passo

1. Publique o site na Vercel (veja o README) e anote o endereço, por exemplo `https://coliseuax-timer.vercel.app`.
2. Gere o APK com o endereço, o nome `ColiseuAX Timer` e o pacote `br.com.coliseuax.timer`.
   Peça ao Claude para gerar, ou use o PWABuilder (pwabuilder.com > Package for stores > Android).
3. Guarde o arquivo de chave (`.keystore`) e a senha em lugar seguro. Sem ela não é possível atualizar o app.
4. Coloque o fingerprint SHA-256 da chave em `public/.well-known/assetlinks.json` e publique de novo.
   Sem isso o app abre com a barra do navegador por cima.
5. Instale na TV: Android TV pelo navegador ou pendrive; Fire TV pelo app Downloader.

## Para TV é obrigatório

- Categoria `LEANBACK_LAUNCHER` na atividade principal.
- Banner de 320x180 px (`banner_tv`).
- `touchscreen` como não obrigatório.

## Outros sistemas (Samsung, LG, Roku, Apple TV)

Abra o endereço do site no navegador da TV. A navegação por controle remoto já está pronta.
