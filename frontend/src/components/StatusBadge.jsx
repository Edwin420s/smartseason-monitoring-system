export default function StatusBadge({ status }) {
  const badgeClasses = {
    Active: 'badge-active',
    'At Risk': 'badge-at-risk',
    Completed: 'badge-completed',
  }

  return (
    <span className={`px-3 py-1 text-xs font-medium border rounded-full ${badgeClasses[status] || badgeClasses.Active}`}>
      {status}
    </span>
  )
}