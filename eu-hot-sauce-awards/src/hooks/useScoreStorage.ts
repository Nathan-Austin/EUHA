'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'judgeScores';

export interface StoredScoreData {
  sauceId: string;
  sauceCode: string;
  scores: Record<string, number>;
  comment: string;
}

type ScoreStorage = Record<string, StoredScoreData>;

export function useScoreStorage(sauceId: string, sauceCode: string, categoryIds: string[] = [], initialScores?: Record<string, number>, initialComment?: string) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  const readAllScores = useCallback((): ScoreStorage => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? parsed as ScoreStorage : {};
    } catch (parseError) {
      console.warn('Unable to read saved scores from localStorage', parseError);
      return {};
    }
  }, []);

  // Load initial data from localStorage, seeding any unset categories to 1 (or DB value if editing)
  useEffect(() => {
    const allScores = readAllScores();
    const savedData = allScores[sauceId];
    const existingScores = savedData?.scores || {};

    // Seed missing categories from DB initial values, then fall back to 1
    const seededScores = { ...existingScores };
    let needsWrite = false;
    for (const categoryId of categoryIds) {
      if (seededScores[categoryId] === undefined) {
        seededScores[categoryId] = initialScores?.[categoryId] ?? 1;
        needsWrite = true;
      }
    }

    if (needsWrite) {
      const updatedData = {
        ...(savedData || { sauceId, sauceCode, comment: '' }),
        scores: seededScores,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...allScores, [sauceId]: updatedData }));
      } catch (writeError) {
        console.warn('Unable to persist judge scores', writeError);
      }
    }

    setScores(seededScores);
    setComment(savedData?.comment ?? initialComment ?? '');
  }, [readAllScores, sauceId]);

  const updateStorage = useCallback((key: 'scores' | 'comment', value: Record<string, number> | string) => {
    const allScores = readAllScores();

    const currentData = allScores[sauceId] || {
      sauceId,
      sauceCode,
      scores: {},
      comment: '',
    };

    const updatedData = { ...currentData, [key]: value };

    const newAllScores = { ...allScores, [sauceId]: updatedData };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllScores));
    } catch (writeError) {
      console.warn('Unable to persist judge scores', writeError);
    }
  }, [readAllScores, sauceId, sauceCode]);


  const handleScoreChange = (categoryId: string, newScore: number) => {
    const newScores = { ...scores, [categoryId]: newScore };
    setScores(newScores);
    updateStorage('scores', newScores);
  };

  const handleCommentChange = (newComment: string) => {
    setComment(newComment);
    updateStorage('comment', newComment);
  };

  return {
    scores,
    comment,
    handleScoreChange,
    handleCommentChange,
  };
}
