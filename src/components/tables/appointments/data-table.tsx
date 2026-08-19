import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../shared/DataTable'
import { AppointmentsToolbar } from './toolbar'

interface AppointmentsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function AppointmentsDataTable<TData, TValue>({
  columns,
  data,
}: AppointmentsDataTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => <AppointmentsToolbar table={table} />}
      emptyMessage="No appointments found."
      initialSorting={[{ id: 'slotTime', desc: false }]}
    />
  )
}
