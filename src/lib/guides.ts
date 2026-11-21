import type { GuideId } from './device'

export type Pacote = 'apk'

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

/** Endereço curto do download (a Vercel redireciona para a Release do GitHub). */
export const PACOTES: Record<Pacote, { rota: string; arquivo: string; rotulo: string }> = {
  apk: { rota: '/apk', arquivo: 'ColiseuAX-Timer-AndroidTV.apk', rotulo: 'Baixar o APK' },
}

export const GUIAS: Record<GuideId, Guia> = {
  androidtv: {
    nome: 'Android TV, TV Box e Fire TV',
    metodos: [
      {
        titulo: 'Instalar o app',
        passos: [
          'Na TV, instale o app Downloader (gratuito, na loja de apps da TV).',
          'Permita que o Downloader instale apps de fontes desconhecidas quando a TV pedir.',
          'Abra o Downloader e digite: {host}/apk',
          'Quando terminar, toque em Instalar e depois em Abrir.',
          'O app aparece na tela inicial da TV, com o banner da equipe.',
        ],
        baixar: 'apk',
      },
    ],
  },
  android: {
    nome: 'Celular ou tablet Android',
    metodos: [
      {
        titulo: 'Pelo navegador (atalho na tela inicial)',
        passos: ['No Chrome, abra {host}.', 'Toque em Adicionar à tela inicial aqui embaixo, ou no menu do Chrome e em Instalar app.', 'O ícone aparece na tela inicial e abre em tela cheia.'],
      },
      {
        titulo: 'Pelo APK',
        passos: ['Baixe o APK abaixo e abra o arquivo.', 'Se o celular pedir, permita instalar apps desta fonte.'],
        baixar: 'apk',
      },
    ],
  },
  ios: {
    nome: 'iPhone ou iPad',
    metodos: [
      {
        titulo: 'Adicionar à tela de início',
        passos: ['No Safari, abra {host}.', 'Toque no botão de compartilhar (quadrado com seta).', 'Escolha Adicionar à Tela de Início.'],
        nota: 'No iPhone, o app da tela de início guarda os dados separados do Safari. Depois de adicionar, ajuste a logo e os timers por ele.',
      },
    ],
  },
  tv: {
    nome: 'TV LG, Samsung e outras',
    metodos: [
      {
        titulo: 'Pelo navegador da TV',
        passos: ['Abra o navegador de internet da TV.', 'Acesse {host}.', 'Adicione aos favoritos. Depois é só abrir pelos favoritos.'],
        nota: 'Roku e Apple TV não têm navegador. Nesses, abra o site no celular e transmita a tela.',
      },
    ],
  },
  pc: {
    nome: 'Computador',
    metodos: [
      {
        titulo: 'Pelo navegador',
        passos: ['No Chrome ou no Edge, abra {host}.', 'Clique em Adicionar à tela inicial aqui embaixo, ou no ícone de instalar na barra de endereço.', 'O app abre em janela própria e fica no menu iniciar.'],
      },
    ],
  },
}

export const ORDEM_GUIAS: GuideId[] = ['androidtv', 'android', 'tv', 'ios', 'pc']
