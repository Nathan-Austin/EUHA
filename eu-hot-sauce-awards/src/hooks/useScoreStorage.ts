'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'judgeScores';

export interface StoredScoreData {
  sauceId: string;
  sauceName: string;
  scores: Record<string, number>;
  comment: string;
}

type ScoreStorage = Record<string, StoredScoreData>;

export function useScoreStorage(sauceId: string, sauceName: string) {
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

  // Load initial data from localStorage
  useEffect(() => {
    const allScores = readAllScores();
    const savedData = allScores[sauceId];
    if (savedData) {
      setScores(savedData.scores || {});
      setComment(savedData.comment || '');
    }
  }, [readAllScores, sauceId]);

  const updateStorage = useCallback((key: 'scores' | 'comment', value: Record<string, number> | string) => {
    const allScores = readAllScores();

    const currentData = allScores[sauceId] || {
      sauceId,
      sauceName,
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
  }, [readAllScores, sauceId, sauceName]);


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
