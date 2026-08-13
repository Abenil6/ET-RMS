import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import type { Ticket, TicketStatus, TicketPriority } from '../../../lib/types'
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
} from '../../../data/tickets'
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

export const createTicketsColumns = (
  userRole: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN',
): ColumnDef<Ticket>[] => {
  const columns: ColumnDef<Ticket>[] = [
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
      accessorKey: 'ticketNumber',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Ticket #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Link
          to="/tickets/$ticketId"
          params={{ ticketId: row.original.id }}
          className="font-mono text-xs text-primary-blue hover:underline"
        >
          {row.getValue('ticketNumber')}
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as TicketStatus
        const config = STATUS_CONFIG[status]
        return (
          <Badge className={cn(config.bg, config.color, 'border-0')}>
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <Link
            to="/tickets/$ticketId"
            params={{ ticketId: row.original.id }}
            className="font-semibold truncate hover:underline"
          >
            {row.getValue('subject')}
          </Link>
          <div className="text-sm text-text-secondary truncate">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as TicketPriority
        const config = PRIORITY_CONFIG[priority]
        return (
          <Badge className={cn(config.bg, config.color, 'border-0')}>
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
          {CATEGORY_LABELS[row.getValue('category')] || row.getValue('category')}
        </span>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'serviceNumber',
      header: 'Service',
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('serviceNumber')}</span>
      ),
    },
    {
      accessorKey: 'technician',
      header: 'Assigned To',
      cell: ({ row }) => {
        const technician = row.original.technician
        return (
          <span className="text-sm">
            {technician ? technician.name : (
              <span className="text-text-secondary italic">Unassigned</span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'queue',
      header: 'Queue',
      cell: ({ row }) => {
        const queue = row.original.queue
        const status = row.original.status
        if (status !== 'OPEN' || !queue) return null
        return (
          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
            #{queue.position} (~{queue.estimatedWaitMinutes}m)
          </div>
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
        const ticket = row.original

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
                onClick={() => navigator.clipboard.writeText(ticket.id)}
              >
                Copy ticket ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/tickets/$ticketId" params={{ ticketId: ticket.id }}>
                  View details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Show customer column only for admin/technician
  if (userRole === 'ADMIN' || userRole === 'TECHNICIAN') {
    columns.splice(columns.length - 1, 0, {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.customer.name}</span>
      ),
    })
  }

  return columns
}
