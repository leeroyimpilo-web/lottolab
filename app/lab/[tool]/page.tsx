import { LabDetail } from '@/components/lotto/lab-detail'

const TOOLS = ['frequency', 'hot-cold', 'combinations', 'history', 'patterns', 'probability', 'advanced']

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool }))
}

export default async function LabToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params
  return <LabDetail tool={tool} />
}
