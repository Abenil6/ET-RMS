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
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          #{row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
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
      header: 'Branch',
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
            Date & Time
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
      header: 'Notes',
      cell: ({ row }) => {
        const notes = row.original.notes
        return (
          <span className="text-sm">
            {notes || (
              <span className="text-text-secondary italic">No notes</span>
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
            Created
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(appointment.id)}
              >
                Copy appointment ID
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  {userRole === 'CUSTOMER' ? (
                    <DropdownMenuItem
                      onClick={() => onCancel?.(appointment.id)}
                      className="text-error"
                    >
                      Cancel appointment
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => onComplete?.(appointment.id)}
                      >
                        Mark as completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onCancel?.(appointment.id)}
                        className="text-error"
                      >
                        Cancel appointment
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
      header: 'Customer',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.user.name}</span>
      ),
    })
  }

  return columns
}
