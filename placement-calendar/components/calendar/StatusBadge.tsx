import { cn } from '@/lib/utils/cn'
import type { DriveStatus } from '@/types'

interface StatusBadgeProps {
  status: DriveStatus
  size?: 'sm' | 'md'
  showDot?: boolean
}

export default function StatusBadge({
  status,
  size = 'md',
  showDot = true,
}: StatusBadgeProps) {
  const config = {
    tentative: {
      label: 'Tentative',
      dot:   'bg-amber-400',
      badge: 'bg-amber-100 text-amber-800',
    },
    fixed: {
      label: 'Fixed',
      dot:   'bg-red-500',
      badge: 'bg-red-100 text-red-700',
    },
    cancelled: {
      label: 'Cancelled',
      dot:   'bg-gray-400',
      badge: 'bg-gray-100 text-gray-500',
    },
  }[status]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-semibold',
      size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[13px] px-[10px] py-1',
      config.badge
    )}>
      {showDot && (
        <span className={cn('rounded-full flex-shrink-0', config.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      )}
      {config.label}
    </span>
  )
}
