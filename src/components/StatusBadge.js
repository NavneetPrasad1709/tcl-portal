export default function StatusBadge({ status }) {
  const colors = {
    new: 'bg-blue-100 text-blue-700',
    proof_pending: 'bg-yellow-100 text-yellow-700',
    proof_ready: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    in_production: 'bg-orange-100 text-orange-700',
    shipped: 'bg-teal-100 text-teal-700',
    complete: 'bg-gray-100 text-gray-700',
  }

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace(/_/g, ' ').toUpperCase()}
    </span>
  )
}