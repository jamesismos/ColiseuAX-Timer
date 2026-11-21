import type { GuideId } from './device'

export type Pacote = 'apk' | 'webos' | 'tizen'

export interface Metodo {
  titulo: string
  passos: string[]
  baixar?: Pacote
  nota?: string
}

export interface Guia {
  nome: string
  metodos: Metodo[]
}

/** Endereço curto de cada pacote (a Vercel redireciona para o arquivo). {host} vira o endereço do site. */
export const PACOTES: Record<Pacote, { rota: string; arquivo: string; rotulo: string }> = {
  apk: { rota: '/apk', arquivo: 'ColiseuAX-Timer-AndroidTV.apk', rotulo: 'Baixar o APK' },
  webos: { rota: '/webos', arquivo: 'ColiseuAX-Timer-webOS.ipk', rotulo: 'Baixar o pacote webOS' },
  tizen: { rota: '/tizen', arquivo: 'ColiseuAX-Timer-Tizen-projeto.zip', rotulo: 'Baixar o projeto Tizen' },
}

const APK_PASSOS = [
  'Na TV, instale o app Downloader (é gratuito, na loja de apps da TV).',
  'Nas configurações da TV, permita que o Downloader instale apps de fontes desconhecidas.',
  'Abra o Downloader e digite este endereço: {host}/apk',
  'Quando o download terminar, toque em Instalar e depois em Abrir.',
  'O ColiseuAX Timer passa a aparecer na tela inicial da TV, com o banner da equipe.',
]

export const GUIAS: Record<GuideId, Guia> = {
  androidtv: {
    nome: 'Android TV, Google TV e TV Box',
    metodos: [
      {
        titulo: 'Instalar o app (recomendado)',
        passos: APK_PASSOS,
        baixar: 'apk',
        nota: 'Sem internet no Downloader? Baixe o APK no computador, copie para um pendrive e abra o arquivo pelo gerenciador de arquivos da TV.',
      },
      {
        titulo: 'Só abrir o site',
        passos: ['Abra o navegador da TV e acesse {host}.', 'Se a TV não tiver navegador, use o app instalado acima.'],
      },
    ],
  },
  firetv: {
    nome: 'Fire TV e Fire Stick',
    metodos: [
      {
        titulo: 'Instalar o app (recomendado)',
        passos: [
          'No Fire TV, abra Configurações, Meu Fire TV, Opções do desenvolvedor e ative Instalar apps desconhecidos.',
          'Instale o app Downloader pela loja de apps (Amazon Appstore).',
          'Abra o Downloader e digite este endereço: {host}/apk',
          'Quando o download terminar, selecione Instalar e depois Abrir.',
          'Para deixar na frente da tela inicial, aperte o botão de menu sobre o app e escolha Mover para o início.',
        ],
        baixar: 'apk',
      },
    ],
  },
  webos: {
    nome: 'TV LG (webOS)',
    metodos: [
      {
        titulo: 'Sem instalar: favorito no navegador da TV',
        passos: [
          'Abra o navegador de internet da TV.',
          'Acesse {host}.',
          'Adicione aos favoritos (estrela). Pronto, é só abrir pelos favoritos.',
        ],
      },
      {
        titulo: 'Ícone na tela inicial (app instalado)',
        passos: [
          'Crie uma conta gratuita em webostv.developer.lge.com e, na TV, instale o app Developer Mode pela LG Content Store.',
          'Abra o Developer Mode, entre com a conta e ative o Dev Mode Status e o Key Server. A TV reinicia.',
          'No computador, instale o programa gratuito Dev Manager Desktop (da comunidade webOS Brew) e conecte à TV pelo endereço IP que aparece no Developer Mode.',
          'Baixe o pacote abaixo e arraste para o Dev Manager para instalar.',
          'O ColiseuAX Timer aparece na lista de apps da TV e pode ser fixado na tela inicial.',
        ],
        baixar: 'webos',
        nota: 'O modo desenvolvedor da LG expira depois de algum tempo e precisa ser renovado no app Developer Mode. Se não quiser renovar, use o favorito do navegador.',
      },
    ],
  },
  tizen: {
    nome: 'TV Samsung (Tizen)',
    metodos: [
      {
        titulo: 'Sem instalar: favorito no navegador da TV',
        passos: ['Abra o app Internet da Samsung na TV.', 'Acesse {host}.', 'Adicione aos favoritos. É só abrir pelos favoritos depois.'],
      },
      {
        titulo: 'Ícone na tela inicial (avançado, experimental)',
        passos: [
          'Na TV, abra Apps, digite 12345 no controle e ative o Developer Mode com o IP do seu computador.',
          'No computador, instale o Tizen Studio e conecte à TV pelo Device Manager.',
          'Baixe o projeto abaixo, importe no Tizen Studio, assine com seu certificado Samsung e execute na TV.',
        ],
        baixar: 'tizen',
        nota: 'Este pacote ainda não foi testado em TV Samsung. Para uso no dia a dia, o favorito do navegador é o caminho mais simples.',
      },
    ],
  },
  tv: {
    nome: 'Outra Smart TV',
    metodos: [
      {
        titulo: 'Favorito no navegador da TV',
        passos: ['Abra o navegador de internet da TV.', 'Acesse {host}.', 'Adicione aos favoritos.'],
        nota: 'Roku e Apple TV não têm navegador. Nesses aparelhos, abra o site no celular e use Transmitir tela (Chromecast ou AirPlay).',
      },
    ],
  },
  android: {
    nome: 'Celular ou tablet Android',
    metodos: [
      {
        titulo: 'Instalar pelo navegador',
        passos: ['No Chrome, abra {host}.', 'Toque no botão Instalar app desta tela, ou no menu do navegador e em Instalar app.', 'O ícone aparece na tela inicial do celular.'],
      },
    ],
  },
  ios: {
    nome: 'iPhone ou iPad',
    metodos: [
      {
        titulo: 'Adicionar à tela de início',
        passos: ['No Safari, abra {host}.', 'Toque no botão de compartilhar (quadrado com seta).', 'Escolha Adicionar à Tela de Início.'],
      },
    ],
  },
  pc: {
    nome: 'Computador',
    metodos: [
      {
        titulo: 'Instalar pelo navegador',
        passos: ['No Chrome ou no Edge, abra {host}.', 'Clique no botão Instalar app desta tela, ou no ícone de instalar na barra de endereço.', 'O app abre em janela própria e fica no menu iniciar.'],
      },
    ],
  },
}

export const ORDEM_GUIAS: GuideId[] = ['androidtv', 'firetv', 'webos', 'tizen', 'tv', 'android', 'ios', 'pc']
