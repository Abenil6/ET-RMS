import type { Table } from '@tanstack/react-table'
import { X, CalendarPlus, Filter } from 'lucide-react'
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
import type { AppointmentStatus } from '../../../lib/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTranslation } from 'react-i18next'

interface AppointmentsToolbarProps<TData> {
  table: Table<TData>
}

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

// Common branch locations
const BRANCH_OPTIONS = [
  'Addis Ababa',
  'Dire Dawa',
  'Mekelle',
  'Gondar',
  'Bahir Dar',
  'Hawassa',
  'Adama',
  'Jimma',
]

function getSelectFilterValue(value: unknown) {
  return Array.isArray(value) ? value.join(',') : ''
}

function getTextFilterValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function AppointmentsToolbar<TData>({
  table,
}: AppointmentsToolbarProps<TData>) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder={t('table.search_notes')}
            value={getTextFilterValue(
              table.getColumn('notes')?.getFilterValue(),
            )}
            onChange={(event) =>
              table.getColumn('notes')?.setFilterValue(event.target.value)
            }
            className="h-10 w-50 lg:w-62.5"
          />

          {/* Status Filter */}
          <Select
            value={getSelectFilterValue(
              table.getColumn('status')?.getFilterValue(),
            )}
            onValueChange={(value) => {
              const column = table.getColumn('status')
              if (value) {
                column?.setFilterValue([value])
              } else {
                column?.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-35">
              <SelectValue placeholder={t('table.status')} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Branch Filter */}
          <Select
            value={getSelectFilterValue(
              table.getColumn('branch')?.getFilterValue(),
            )}
            onValueChange={(value) => {
              const column = table.getColumn('branch')
              if (value) {
                column?.setFilterValue([value])
              } else {
                column?.setFilterValue(undefined)
              }
            }}
          >
            <SelectTrigger className="h-10 w-37.5">
              <SelectValue placeholder={t('appointments.branch_label')} />
            </SelectTrigger>
            <SelectContent>
              {BRANCH_OPTIONS.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
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
          {user?.role === 'CUSTOMER' && (
            <Button asChild size="sm" className="h-10">
              <Link to="/appointments/new">
                <CalendarPlus className="h-4 w-4 mr-2" />
                {t('appointments.book_button')}
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
            {t('table.showing_appointments', {
              filtered: table.getFilteredRowModel().rows.length,
              total: table.getCoreRowModel().rows.length,
            })}
          </span>
        </div>
      )}
    </div>
  )
}
