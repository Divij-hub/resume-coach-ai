import { ClerkProvider } from '@clerk/nextjs'
import type { AppProps } from 'next/app'
import '../styles/globals.css' // Note the relative path fix here

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  )
}