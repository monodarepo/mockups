import type { Produto } from './types'

/** Portfólio da demo — os 11 produtos do CLAUDE.md, com família e apresentação. */
export const produtos: Produto[] = [
  {
    id: 'buscopan-composto',
    nome: 'Buscopan Composto',
    familia: 'Analgésicos',
    formaFarmaceutica: 'Comprimido revestido',
    apresentacao: 'CP 400/500mg',
    unidade: 'COMP',
  },
  {
    id: 'neosaldina',
    nome: 'Neosaldina',
    familia: 'Analgésicos',
    formaFarmaceutica: 'Comprimido revestido',
    apresentacao: 'CP 30/300/35mg',
    unidade: 'COMP',
  },
  {
    id: 'dorflex',
    nome: 'Dorflex',
    familia: 'Analgésicos',
    formaFarmaceutica: 'Drágea',
    apresentacao: 'DRG 300/35/50mg',
    unidade: 'DRG',
  },
  {
    id: 'novalgina',
    nome: 'Novalgina',
    familia: 'Analgésicos',
    formaFarmaceutica: 'Comprimido',
    apresentacao: 'CP 500mg',
    unidade: 'COMP',
  },
  {
    id: 'benegrip-multi',
    nome: 'Benegrip Multi',
    familia: 'Antigripais',
    formaFarmaceutica: 'Cápsula dura',
    apresentacao: 'CAPS 400/4/20mg',
    unidade: 'CAPS',
  },
  {
    id: 'apracur',
    nome: 'Apracur',
    familia: 'Antigripais',
    formaFarmaceutica: 'Cápsula dura',
    apresentacao: 'CAPS 500/10mg',
    unidade: 'CAPS',
  },
  {
    id: 'benegripe',
    nome: 'Benegripe',
    familia: 'Antigripais',
    formaFarmaceutica: 'Comprimido',
    apresentacao: 'CP 500/2mg',
    unidade: 'COMP',
  },
  {
    id: 'tylenol-750',
    nome: 'Tylenol 750mg',
    familia: 'Antitérmicos',
    formaFarmaceutica: 'Comprimido revestido',
    apresentacao: 'CP 750mg',
    unidade: 'COMP',
  },
  {
    id: 'advil',
    nome: 'Advil',
    familia: 'Antitérmicos',
    formaFarmaceutica: 'Comprimido revestido',
    apresentacao: 'CP 400mg',
    unidade: 'COMP',
  },
  {
    id: 'addera-d3',
    nome: 'Addera D3',
    familia: 'Vitaminas',
    formaFarmaceutica: 'Cápsula mole',
    apresentacao: 'CAPS 7.000UI',
    unidade: 'CAPS',
  },
  {
    id: 'rinosoro',
    nome: 'Rinosoro',
    familia: 'Outros',
    formaFarmaceutica: 'Solução nasal',
    apresentacao: 'FR 30mL',
    unidade: 'FR',
  },
]

export function produtoPorId(id: string): Produto | undefined {
  return produtos.find((produto) => produto.id === id)
}
