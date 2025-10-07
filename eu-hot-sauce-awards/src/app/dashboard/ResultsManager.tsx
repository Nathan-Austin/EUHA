
'use client';

// Mock data until backend is connected
const mockResults = [
  { id: '1', year: 2025, category: 'Mild', sauce_name: 'Mild Mania', supplier_name: 'Sauce Co.', award: 'Gold' },
  { id: '2', year: 2025, category: 'Hot', sauce_name: 'Volcano Burst', supplier_name: 'Heat Inc.', award: 'Silver' },
];

const ResultsManager = () => {
  return (
    <div className="bg-white/5 p-6 rounded-2xl mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-amber-400">Manage Past Results</h2>
        <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">
          Import Results (CSV)
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Year</th>
              <th className="p-2">Category</th>
              <th className="p-2">Sauce Name</th>
              <th className="p-2">Supplier</th>
              <th className="p-2">Award</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockResults.map(result => (
              <tr key={result.id} className="border-b border-white/10">
                <td className="p-2">{result.year}</td>
                <td className="p-2">{result.category}</td>
                <td className="p-2">{result.sauce_name}</td>
                <td className="p-2">{result.supplier_name}</td>
                <td className="p-2">{result.award}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-400 hover:text-blue-300">Edit</button>
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsManager;
