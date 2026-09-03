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
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
} from '../../../data/tickets'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TicketsToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
}

export function TicketsToolbar<TData>({
  table,
  onRefresh,
}: TicketsToolbarProps<TData>) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const isFiltered = table.getState().columnFilters.length > 0
  const subjectColumn = table.getColumn('subject')
  const statusColumn = table.getColumn('status')
  const priorityColumn = table.getColumn('priority')
  const categoryColumn = table.getColumn('category')

  if (!subjectColumn || !statusColumn || !priorityColumn || !categoryColumn) {
    return null
  }

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
            placeholder={t('table.search_tickets')}
            value={String(subjectColumn.getFilterValue() ?? '')}
            onChange={(event) =>
              subjectColumn.setFilterValue(event.target.value)
            }
            className="h-10 w-[200px] lg:w-[300px]"
          />

          {/* Status Filter */}
          <Select
            value={
              (statusColumn.getFilterValue() as string[] | undefined)?.join(
                ',',
              ) ?? ''
            }
            onValueChange={(value) => {
              if (value) {
                statusColumn.setFilterValue([value])
              } else {
                statusColumn.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder={t('table.status')} />
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
            value={
              (priorityColumn.getFilterValue() as string[] | undefined)?.join(
                ',',
              ) ?? ''
            }
            onValueChange={(value) => {
              if (value) {
                priorityColumn.setFilterValue([value])
              } else {
                priorityColumn.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder={t('table.priority')} />
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
            value={
              (categoryColumn.getFilterValue() as string[] | undefined)?.join(
                ',',
              ) ?? ''
            }
            onValueChange={(value) => {
              if (value) {
                categoryColumn.setFilterValue([value])
              } else {
                categoryColumn.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder={t('table.category')} />
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
              {t('common.reset')}
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
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          )}

          {user?.role === 'CUSTOMER' && (
            <Button asChild size="sm" className="h-10">
              <Link to="/report">
                <Plus className="h-4 w-4 mr-2" />
                {t('table.new_ticket')}
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
            {t('table.showing_tickets', {
              filtered: table.getFilteredRowModel().rows.length,
              total: table.getCoreRowModel().rows.length,
            })}
          </span>
        </div>
      )}
    </div>
  )
}
