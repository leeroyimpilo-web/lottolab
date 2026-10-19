import {
  BarChart3,
  BookOpen,
  CircleHelp,
  Combine,
  FlaskConical,
  Flame,
  History,
  Home,
  Info,
  LayoutGrid,
  ListChecks,
  type LucideIcon,
  Percent,
  RefreshCw,
  ScanSearch,
  Sigma,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Wallet,
  Waypoints,
  Library,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Latest Results', href: '/results', icon: Trophy },
      { label: 'Generate Numbers', href: '/generate', icon: Sparkles },
      { label: 'Check My Numbers', href: '/check', icon: ScanSearch },
    ],
  },
  {
    title: 'Lotto Laboratory',
    items: [
      { label: 'Number Frequency', href: '/lab/frequency', icon: BarChart3, description: 'How often each number has been drawn' },
      { label: 'Hot & Cold Numbers', href: '/lab/hot-cold', icon: Flame, description: 'Recently common and rare numbers' },
      { label: 'Combination Analyzer', href: '/lab/combinations', icon: Combine, description: 'Has your combination ever come up?' },
      { label: 'Historical Draws', href: '/lab/history', icon: History, description: 'Browse and compare past draws' },
      { label: 'Number Patterns', href: '/lab/patterns', icon: Waypoints, description: 'Odd/even, ranges and consecutive numbers' },
      { label: 'Probability Explorer', href: '/lab/probability', icon: Percent, description: 'Your real odds for every prize' },
      { label: 'Advanced Statistics', href: '/lab/advanced', icon: Sigma, description: 'Heatmaps and sum distributions' },
    ],
  },
  {
    title: 'My Lotto',
    items: [
      { label: 'Saved Numbers', href: '/my-lotto/saved', icon: Star },
      { label: 'My Tickets', href: '/my-lotto/tickets', icon: Ticket },
      { label: 'Winnings Checker', href: '/my-lotto/winnings', icon: ListChecks },
      { label: 'Spending Tracker', href: '/my-lotto/spending', icon: Wallet },
    ],
  },
  {
    title: 'Information',
    items: [
      { label: 'Lottery Game Guide', href: '/info/guide', icon: Library },
      { label: 'User Manual', href: '/info/manual', icon: BookOpen },
      { label: 'Frequently Asked Questions', href: '/info/faq', icon: CircleHelp },
      { label: 'Data Updates', href: '/info/updates', icon: RefreshCw },
      { label: 'About LottoLab', href: '/info/about', icon: Info },
    ],
  },
]

export const BOTTOM_NAV: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Results', href: '/results', icon: Trophy },
  { label: 'Generate', href: '/generate', icon: Sparkles },
  { label: 'Lab', href: '/lab', icon: FlaskConical },
  { label: 'My Lotto', href: '/my-lotto', icon: LayoutGrid },
]

export const LAB_TOOLS = NAV_SECTIONS[1].items

export function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
