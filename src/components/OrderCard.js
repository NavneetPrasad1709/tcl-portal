import Link from 'next/link'
import StatusBadge from './StatusBadge'

export default function OrderCard({ order }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center hover:shadow-md transition-shadow">
      <div>
        <h4 className="font-semibold text-gray-800">{order.event_name}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-gray-500">
            📅 Due: {order.due_date 
              ? new Date(order.due_date).toLocaleDateString() 
              : 'N/A'}
          </span>
          <span className="text-sm text-gray-500">
            🖨️ {order.print_type?.replace(/_/g, ' ') || 'N/A'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={order.status} />
        <Link
          href={`/orders/${order.id}/proofs`}
          className="text-blue-600 text-sm hover:underline font-medium"
        >
          View →
        </Link>
      </div>
    </div>
  )
}