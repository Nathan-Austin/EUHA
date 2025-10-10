'use client'

// Mock data until backend is connected
const mockResults = [
  {
    id: '1',
    year: 2025,
    category: 'Mild',
    sauce_name: 'Mild Mania',
    supplier_name: 'Sauce Co.',
    award: 'Gold',
  },
  {
    id: '2',
    year: 2025,
    category: 'Hot',
    sauce_name: 'Volcano Burst',
    supplier_name: 'Heat Inc.',
    award: 'Silver',
  },
]

const ResultsManager = () => {
  return (
    <div className="mt-8 rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-amber-400">Manage Past Results</h2>
        <button className="w-full rounded-full bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:w-auto sm:px-6">
          Import Results (CSV)
        </button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="mt-6 min-w-full text-left text-sm">
          <thead>
            <tr className="text-white/70">
              <th className="px-3 py-2 font-medium">Year</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Sauce Name</th>
              <th className="px-3 py-2 font-medium">Supplier</th>
              <th className="px-3 py-2 font-medium">Award</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockResults.map((result) => (
              <tr key={result.id} className="border-t border-white/10 text-white/90">
                <td className="px-3 py-2">{result.year}</td>
                <td className="px-3 py-2">{result.category}</td>
                <td className="px-3 py-2">{result.sauce_name}</td>
                <td className="px-3 py-2">{result.supplier_name}</td>
                <td className="px-3 py-2">{result.award}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-3">
                    <button className="text-blue-300 transition hover:text-blue-200">Edit</button>
                    <button className="text-red-300 transition hover:text-red-200">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:hidden">
        {mockResults.map((result) => (
          <div
            key={result.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200">
                {result.year}
              </span>
              <div className="flex gap-3">
                <button className="text-blue-300 transition hover:text-blue-200">Edit</button>
                <button className="text-red-300 transition hover:text-red-200">Delete</button>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-base font-semibold text-white">{result.sauce_name}</p>
              <p className="text-sm text-white/70">{result.supplier_name}</p>
              <div className="flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/20 px-2 py-1">{result.category}</span>
                <span className="rounded-full border border-white/20 px-2 py-1">{result.award}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultsManager
