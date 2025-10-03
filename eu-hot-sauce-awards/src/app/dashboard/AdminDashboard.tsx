import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import SauceStatusUpdater from './SauceStatusUpdater';
import BoxManagement from './BoxManagement';
import ExportResultsButton from './ExportResultsButton';
import AddAdminUser from './AddAdminUser';
import StickerGenerator from './StickerGenerator';
import AdminBoxPacker from './AdminBoxPacker';
import JudgeLabelGenerator from './JudgeLabelGenerator';

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: sauces, error } = await supabase
    .from('sauces')
    .select(`
      id,
      name,
      sauce_code,
      status,
      category,
      suppliers ( brand_name )
    `)
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

  if (error) {
    return <p className="text-red-600">Error loading sauces: {error.message}</p>
  }

  if (!sauces) {
    return <p className="text-gray-600">No sauces found.</p>
  }

  return (
    <div className="space-y-8">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Admin Control Panel</h2>
        <ExportResultsButton />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Sauce Management</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Sauce Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sauces.map((sauce) => (
                <tr key={sauce.id} className="border-t text-sm">
                  <td className="whitespace-nowrap px-4 py-3">
                    {sauce.sauce_code ? (
                      <span className="font-mono text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                        {sauce.sauce_code}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{sauce.suppliers?.brand_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-900">{sauce.name}</td>
                  <td className="px-4 py-3 text-gray-600">{sauce.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      sauce.status === 'registered' ? 'bg-blue-200 text-blue-800' :
                      sauce.status === 'arrived' ? 'bg-yellow-200 text-yellow-800' :
                      sauce.status === 'boxed' ? 'bg-purple-200 text-purple-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {sauce.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SauceStatusUpdater sauceId={sauce.id} currentStatus={sauce.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminBoxPacker />

      <BoxManagement />

      <StickerGenerator />

      <JudgeLabelGenerator />

      <AddAdminUser />

    </div>
  );
}
