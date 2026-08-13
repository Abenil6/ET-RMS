import type { Table } from '@tanstack/react-table'
import { X, RefreshCw, Plus, Filter } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_LABELS } from '../../../data/tickets'
import type { TicketStatus, TicketPriority, TicketCategory } from '../../../lib/types'
import { useAuth } from '../../../context/auth'
import { useState } from 'react'

interface TicketsToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
}

export function TicketsToolbar<TData>({
  table,
  onRefresh,
}: TicketsToolbarProps<TData>) {
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const isFiltered = table.getState().columnFilters.length > 0

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true)
      await onRefresh()
      setRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search tickets..."
            value={(table.getColumn('subject')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('subject')?.setFilterValue(event.target.value)
            }
            className="h-10 w-[200px] lg:w-[300px]"
          />
          
          {/* Status Filter */}
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string[])?.join(',') ?? ''}
            onValueChange={(value) => {
              const column = table.getColumn('status')
              if (value) {
                column?.setFilterValue([value])
              } else {
                column?.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={(table.getColumn('priority')?.getFilterValue() as string[])?.join(',') ?? ''}
            onValueChange={(value) => {
              const column = table.getColumn('priority')
              if (value) {
                column?.setFilterValue([value])
              } else {
                column?.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                <SelectItem key={priority} value={priority}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={(table.getColumn('category')?.getFilterValue() as string[])?.join(',') ?? ''}
            onValueChange={(value) => {
              const column = table.getColumn('category')
              if (value) {
                column?.setFilterValue([value])
              } else {
                column?.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
                <SelectItem key={category} value={category}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-10 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-10"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {user?.role === 'CUSTOMER' && (
            <Button asChild size="sm" className="h-10">
              <Link to="/report">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filter info */}
      {isFiltered && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Filter className="h-4 w-4" />
          <span>
            Showing {table.getFilteredRowModel().rows.length} of{' '}
            {table.getCoreRowModel().rows.length} tickets
          </span>
        </div>
      )}
    </div>
  )
}
