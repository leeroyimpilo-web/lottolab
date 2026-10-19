'use client'

import { AnimatePresence, motion } from 'motion/react'
import { CloudOff } from 'lucide-react'
import { useOnline } from '@/lib/store/sync-store'

export function OfflineBanner() {
  const online = useOnline()
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-bonus/15 text-bonus"
        >
          <p className="mx-auto flex max-w-lg items-center gap-2 px-4 py-2 text-xs font-medium">
            <CloudOff className="size-4 shrink-0" aria-hidden="true" />
            {"You're offline. Previously downloaded draws remain available on this device. LottoLab will check for updates when you reconnect."}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
