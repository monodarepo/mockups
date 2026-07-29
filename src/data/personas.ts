export interface Persona {
  id: string
  nome: string
  papel: string
  iniciais: string
  /** Primeiro nome usado na saudação do Copiloto Gemini. */
  tratamento: string
}

export const personas: Persona[] = [
  {
    id: 'camila',
    nome: 'Camila Azevedo',
    papel: 'PCP',
    iniciais: 'CA',
    tratamento: 'Camila',
  },
  {
    id: 'ricardo',
    nome: 'Ricardo Martins',
    papel: 'Diretor de Operações',
    iniciais: 'RM',
    tratamento: 'Ricardo',
  },
  {
    id: 'marina',
    nome: 'Marina Oliveira',
    papel: 'Administradora',
    iniciais: 'MO',
    tratamento: 'Marina',
  },
]

/** Persona padrão da demo. */
export const personaPadrao = personas[0]
