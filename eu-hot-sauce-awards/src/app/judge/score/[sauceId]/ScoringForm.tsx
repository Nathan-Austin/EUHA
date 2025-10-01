'use client';

import { useScoreStorage } from '@/hooks/useScoreStorage';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface ScoringFormProps {
  sauceId: string;
  sauceName: string;
  categories: Category[];
}

export default function ScoringForm({
  sauceId,
  sauceName,
  categories,
}: ScoringFormProps) {
  const { scores, comment, handleScoreChange, handleCommentChange } = useScoreStorage(sauceId, sauceName);

  return (
    <form className="space-y-6">
      {categories.map(category => (
        <div key={category.id}>
          <label htmlFor={`score-${category.id}`} className="block text-md font-medium text-gray-800">
            {category.name}
          </label>
          <div className="flex items-center gap-4 mt-1">
            <input
              type="range"
              id={`score-${category.id}`}
              min="0"
              max="100"
              value={scores[category.id] || 0}
              onChange={(e) => handleScoreChange(category.id, parseInt(e.target.value, 10))}
              className="w-full"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={scores[category.id] || 0}
              onChange={(e) => handleScoreChange(category.id, parseInt(e.target.value, 10))}
              className="w-20 p-1 border rounded-md text-center"
            />
          </div>
        </div>
      ))}

      <div className="pt-4 border-t">
        <label htmlFor="overallComment" className="block text-md font-medium text-gray-800">
          Overall Comments
        </label>
        <textarea
          id="overallComment"
          name="overallComment"
          rows={4}
          value={comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Overall thoughts on the sauce..."
        />
      </div>

      <div className="pt-6">
        <Link
          href="/dashboard"
          className="w-full flex justify-center px-4 py-3 font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Save & Close
        </Link>
        <p className="text-xs text-center text-gray-500 mt-2">Your progress is saved automatically.</p>
      </div>
    </form>
  );
}
