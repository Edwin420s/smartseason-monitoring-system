export default function StyleTest() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-gradient">Custom Gradient Text</h2>
      <button className="test-btn px-6 py-3">Test Button</button>
      <div className="test-card p-4">
        <p>Test Card with hover effect</p>
      </div>
      <div className="stat-card">
        <p>Stat Card Test</p>
      </div>
      <div className="badge-active px-3 py-1 rounded-full text-sm">Active Badge</div>
      <div className="badge-at-risk px-3 py-1 rounded-full text-sm">At Risk Badge</div>
      <div className="badge-completed px-3 py-1 rounded-full text-sm">Completed Badge</div>
    </div>
  )
}
