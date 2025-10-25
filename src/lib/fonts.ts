import { Alata } from 'next/font/google'
import { Afacad } from 'next/font/google'

export const alata = Alata({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-alata',
})

export const afacad = Afacad({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-afacad',
})