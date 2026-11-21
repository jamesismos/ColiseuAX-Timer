# App Android TV, Fire TV, TV Box e celular

App nativo simples que abre o ColiseuAX Timer em tela cheia, com o site embutido (funciona sem internet).
Aparece na tela inicial da TV com o banner da equipe (`LEANBACK_LAUNCHER`) e também no celular e no tablet.

## Como é gerado

O APK é gerado automaticamente pelo workflow `.github/workflows/release.yml` quando uma tag `v*` é enviada
(veja o README, seção Releases). O resultado vai para `public/downloads/` e para a Release do GitHub.

O build local não é necessário. Se quiser mesmo assim, é preciso Android SDK e Java 17:

```bash
npm run build:app
mkdir -p android/app/src/main/assets/www && cp -r dist-app/. android/app/src/main/assets/www/
gradle -p android assembleRelease
```

## Assinatura (importante para atualizar)

O Android só atualiza um app se a assinatura for a mesma. Sem configuração, cada Release usa uma chave temporária
e é preciso desinstalar a versão antiga antes de instalar a nova. Para usar sempre a mesma chave, crie uma vez:

```bash
keytool -genkeypair -keystore coliseuax.jks -alias coliseuax -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 coliseuax.jks
```

e cadastre em GitHub, Settings, Secrets and variables, Actions:

- `ANDROID_KEYSTORE_BASE64` (o texto gerado pelo base64)
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS` (`coliseuax`)
- `ANDROID_KEY_PASSWORD` (se for igual à senha do keystore, pode repetir)

Guarde o arquivo `.jks` e as senhas em lugar seguro. Nunca coloque no repositório.
