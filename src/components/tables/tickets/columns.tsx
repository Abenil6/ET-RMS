import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import type { Ticket } from '../../../lib/types'
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
import i18n from '../../../lib/i18n'

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
      accessorKey: 'ticketNumber',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {i18n.t('table.ticket_number')}
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
      header: i18n.t('table.status'),
      cell: ({ row }) => {
        const status = row.original.status
        const config = STATUS_CONFIG[status]
        return (
          <Badge className={cn(config.bg, config.color, 'border-0')}>
            {i18n.t(`status.${status.toLowerCase()}`, {
              defaultValue: config.label,
            })}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'subject',
      header: i18n.t('table.subject'),
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
      header: i18n.t('table.priority'),
      cell: ({ row }) => {
        const priority = row.original.priority
        const config = PRIORITY_CONFIG[priority]
        return (
          <Badge className={cn(config.bg, config.color, 'border-0')}>
            {i18n.t(`priority.${priority.toLowerCase()}`, {
              defaultValue: config.label,
            })}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'category',
      header: i18n.t('table.category'),
      cell: ({ row }) => {
        const category = row.original.category
        return (
          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
            {i18n.t(`category.${category.toLowerCase()}`, {
              defaultValue: CATEGORY_LABELS[category] || category,
            })}
          </span>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'serviceNumber',
      header: i18n.t('table.service'),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('serviceNumber')}</span>
      ),
    },
    {
      accessorKey: 'technician',
      header: i18n.t('table.assigned_to'),
      cell: ({ row }) => {
        const technician = row.original.technician
        return (
          <span className="text-sm">
            {technician ? (
              technician.name
            ) : (
              <span className="text-text-secondary italic">
                {i18n.t('table.unassigned')}
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'queue',
      header: i18n.t('navigation.queue'),
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
        const ticket = row.original

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
                onClick={() => navigator.clipboard.writeText(ticket.id)}
              >
                {i18n.t('table.copy_ticket_id')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/tickets/$ticketId" params={{ ticketId: ticket.id }}>
                  {i18n.t('table.view_details')}
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
      header: i18n.t('table.customer'),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.customer.name}</span>
      ),
    })
  }

  return columns
}
