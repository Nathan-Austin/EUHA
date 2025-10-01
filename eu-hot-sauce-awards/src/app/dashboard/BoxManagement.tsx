import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AssignSauceToBox from './AssignSauceToBox';

export default async function BoxManagement() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: assignments, error } = await supabase
    .from('box_assignments')
    .select(`
      box_label,
      sauces ( name )
    `);

  if (error) {
    return <p className="text-red-600">Error loading boxes: {error.message}</p>
  }

  // Group sauces by box_label
  const boxes = assignments.reduce((acc, assignment) => {
    const { box_label, sauces } = assignment;
    if (!acc[box_label]) {
      acc[box_label] = [];
    }
    if (sauces) {
      acc[box_label].push(sauces.name);
    }
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Box Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <AssignSauceToBox />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Existing Boxes</h3>
          {Object.keys(boxes).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(boxes).map(([label, sauceNames]) => (
                <div key={label} className="p-4 bg-gray-100 rounded-md border">
                  <h3 className="font-bold text-lg">{label}</h3>
                  <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                    {sauceNames.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No boxes created yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
