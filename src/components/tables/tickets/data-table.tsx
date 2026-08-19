import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../shared/DataTable'
import { TicketsToolbar } from './toolbar'

interface TicketsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRefresh?: () => void
}

export function TicketsDataTable<TData, TValue>({
  columns,
  data,
  onRefresh,
}: TicketsDataTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => <TicketsToolbar table={table} onRefresh={onRefresh} />}
      emptyMessage="No tickets found."
    />
  )
}
