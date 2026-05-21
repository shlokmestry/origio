import { Metadata } from 'next'
import { Suspense } from 'react'
import CompareCitiesClient from './CompareCitiesClient'

export const metadata: Metadata = {
  title: 'Compare Cities — The Math on Paper · Origio',
  description:
    'Compare up to four cities side by side. Rent, groceries, dining, gym, internet, healthcare — the real monthly cost of moving.',
  openGraph: {
    title: 'Compare Cities · Origio',
    description: 'The real monthly cost of living, side by side for up to four cities.',
    images: [{ url: '/og-cities.png', width: 1200, height: 630 }],
  },
}

export default function CompareCitiesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#040407' }} />}>
      <CompareCitiesClient />
    </Suspense>
  )
}
