// Gera os pacotes de TV a partir de dist-app (npm run package:tv):
//   release/ColiseuAX-Timer-webOS.ipk            LG webOS
//   release/ColiseuAX-Timer-Tizen-projeto.zip    Samsung Tizen (projeto para o Tizen Studio)
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const raiz = resolve(import.meta.dirname, '..')
const app = join(raiz, 'dist-app')
const saida = join(raiz, 'release')
const stage = join(saida, '.stage')
const versao = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8')).version

if (!existsSync(join(app, 'index.html'))) {
  console.error('dist-app não existe. Rode: npm run build:app')
  process.exit(1)
}

rmSync(saida, { recursive: true, force: true })
mkdirSync(stage, { recursive: true })

// ---------- webOS ----------
const webos = join(stage, 'webos')
cpSync(app, webos, { recursive: true })
rmSync(join(webos, 'sw.js'), { force: true }) // service worker não roda em file://
cpSync(join(raiz, 'tv/webos'), webos, { recursive: true })
const info = JSON.parse(readFileSync(join(webos, 'appinfo.json'), 'utf8'))
info.version = versao
writeFileSync(join(webos, 'appinfo.json'), JSON.stringify(info, null, 2) + '\n')

execFileSync('npx', ['--yes', '--package', '@webos-tools/cli', 'ares-package', '--no-minify', '--outdir', saida, webos], { stdio: 'inherit' })
renameSync(join(saida, `${info.id}_${versao}_all.ipk`), join(saida, 'ColiseuAX-Timer-webOS.ipk'))

// ---------- Tizen ----------
const tizen = join(stage, 'tizen')
cpSync(app, tizen, { recursive: true })
rmSync(join(tizen, 'sw.js'), { force: true })
cpSync(join(raiz, 'tv/tizen'), tizen, { recursive: true })
const cfg = readFileSync(join(tizen, 'config.xml'), 'utf8').replace(/version="[^"]*" viewmodes/, `version="${versao}" viewmodes`)
writeFileSync(join(tizen, 'config.xml'), cfg)
execFileSync('zip', ['-qr', join(saida, 'ColiseuAX-Timer-Tizen-projeto.zip'), '.'], { cwd: tizen, stdio: 'inherit' })

rmSync(stage, { recursive: true, force: true })
console.log(`Pacotes da versão ${versao} gerados em release/`)
