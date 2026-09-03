import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  MoreHorizontal,
} from 'lucide-react'
import type { Appointment, AppointmentStatus } from '../../../lib/types'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { cn } from '../../../lib/utils'
import i18n from '../../../lib/i18n'

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  RESERVED: 'bg-primary-blue/10 text-primary-blue',
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-text-secondary/10 text-text-secondary',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-ET', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const createAppointmentsColumns = (
  userRole: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN',
  onCancel?: (id: string) => void,
  onComplete?: (id: string) => void,
): ColumnDef<Appointment>[] => {
  const columns: ColumnDef<Appointment>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={i18n.t('table.select_all')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={i18n.t('table.select_row')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: i18n.t('table.id'),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          #{row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: i18n.t('table.status'),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge className={cn(STATUS_BADGE[status], 'border-0')}>
            {status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'branch',
      header: i18n.t('appointments.branch_label'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-text-secondary" />
          <span>{row.getValue('branch')}</span>
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'slotTime',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {i18n.t('table.date_time')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const slotTime = row.original.slotTime
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm">
              <CalendarIcon className="h-3.5 w-3.5 text-text-secondary" />
              {formatDate(slotTime)}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(slotTime)}
            </div>
          </div>
        )
      },
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'notes',
      header: i18n.t('table.notes'),
      cell: ({ row }) => {
        const notes = row.original.notes
        return (
          <span className="text-sm">
            {notes || (
              <span className="text-text-secondary italic">
                {i18n.t('table.no_notes')}
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {i18n.t('ticket_detail.created_label')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return (
          <span className="text-sm">
            {date.toLocaleDateString('en-ET', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )
      },
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const appointment = row.original
        const canManage = appointment.status === 'RESERVED'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{i18n.t('table.open_menu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{i18n.t('table.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(appointment.id)}
              >
                {i18n.t('table.copy_appointment_id')}
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  {userRole === 'CUSTOMER' ? (
                    <DropdownMenuItem
                      onClick={() => onCancel?.(appointment.id)}
                      className="text-error"
                    >
                      {i18n.t('table.cancel_appointment')}
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => onComplete?.(appointment.id)}
                      >
                        {i18n.t('table.mark_completed')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onCancel?.(appointment.id)}
                        className="text-error"
                      >
                        {i18n.t('table.cancel_appointment')}
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Show customer column only for admin/technician
  if (userRole === 'ADMIN' || userRole === 'TECHNICIAN') {
    columns.splice(columns.length - 1, 0, {
      accessorKey: 'user',
      header: i18n.t('table.customer'),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.user.name}</span>
      ),
    })
  }

  return columns
}
