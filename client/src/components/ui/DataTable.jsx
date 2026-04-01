import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../lib/animations';
import Skeleton from './Skeleton';

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'Aucune donnee',
  onRowClick,
  rowKey = 'id',
  compact = false,
}) {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-0 overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 text-center">
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-[13px] font-medium text-text-secondary ${compact ? 'px-4 py-3' : 'px-6 py-3'}`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {data.map((row, i) => (
              <motion.tr
                key={row[rowKey] ?? i}
                variants={staggerItem}
                className={`border-b border-[rgba(60,60,67,0.08)] last:border-0 transition-colors duration-150 hover:bg-[#F2F2F7] ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`text-sm text-text ${compact ? 'px-4 py-2.5' : 'px-6 py-3.5'}`}
                  >
                    {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
