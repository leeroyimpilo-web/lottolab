import { MyLottoContent } from '@/components/lotto/my-lotto-content'

export function generateStaticParams() {
  return ['saved', 'tickets', 'winnings', 'spending'].map((section) => ({ section }))
}

export default async function MyLottoSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  return <MyLottoContent section={section} />
}
