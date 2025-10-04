'use client';

import { useScoreStorage } from '@/hooks/useScoreStorage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { submitAllScores } from '@/app/actions';

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
  const router = useRouter();
  const { scores, comment, handleScoreChange, handleCommentChange } = useScoreStorage(sauceId, sauceName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

      {submitError && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
          {submitError}
        </div>
      )}

      <div className="pt-6 space-y-3">
        <button
          type="button"
          onClick={async () => {
            // Scores are already saved in local storage, just navigate to scanner
            router.push('/judge/scan');
          }}
          className="w-full flex justify-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          Save & Scan Next Sauce
        </button>

        <button
          type="button"
          onClick={async () => {
            setIsSubmitting(true);
            setSubmitError(null);

            try {
              // Get all scores from local storage
              const allScores = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('sauce_')) {
                  const scoreData = localStorage.getItem(key);
                  if (scoreData) {
                    allScores.push(JSON.parse(scoreData));
                  }
                }
              }

              if (allScores.length === 0) {
                setSubmitError('No scores to submit.');
                setIsSubmitting(false);
                return;
              }

              // Submit all scores to database
              const result = await submitAllScores(JSON.stringify(allScores));

              if ('error' in result) {
                setSubmitError(result.error);
                setIsSubmitting(false);
                return;
              }

              // Clear local storage on success
              for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key?.startsWith('sauce_')) {
                  localStorage.removeItem(key);
                }
              }

              // Redirect to dashboard
              router.push('/dashboard');
            } catch (err) {
              setSubmitError('An unexpected error occurred. Please try again.');
              setIsSubmitting(false);
            }
          }}
          className="w-full flex justify-center px-4 py-3 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Save & Continue Later'}
        </button>

        <p className="text-xs text-center text-gray-500">
          Scores are saved automatically as you go. "Continue Later" submits all your scores to the database.
        </p>
      </div>
    </form>
  );
}
