import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import SauceStatusUpdater from './SauceStatusUpdater';
import BoxManagement from './BoxManagement';
import ExportResultsButton from './ExportResultsButton';

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: sauces, error } = await supabase
    .from('sauces')
    .select(`
      id,
      name,
      status,
      category,
      suppliers ( brand_name )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-red-600">Error loading sauces: {error.message}</p>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Admin Control Panel</h2>
        <ExportResultsButton />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Sauce Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Brand</th>
                <th className="px-4 py-2 text-left">Sauce Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sauces.map((sauce) => (
                <tr key={sauce.id} className="border-t">
                  <td className="px-4 py-2">{sauce.suppliers?.[0]?.brand_name || 'N/A'}</td>
                  <td className="px-4 py-2">{sauce.name}</td>
                  <td className="px-4 py-2">{sauce.category}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      sauce.status === 'registered' ? 'bg-blue-200 text-blue-800' :
                      sauce.status === 'arrived' ? 'bg-yellow-200 text-yellow-800' :
                      sauce.status === 'boxed' ? 'bg-purple-200 text-purple-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {sauce.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <SauceStatusUpdater sauceId={sauce.id} currentStatus={sauce.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <BoxManagement />

    </div>
  );
}
