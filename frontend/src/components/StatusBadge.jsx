export default function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    'At Risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Completed: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <span className={`px-3 py-1 text-xs font-medium border rounded-full ${styles[status] || styles.Active}`}>
      {status}
    </span>
  )
}