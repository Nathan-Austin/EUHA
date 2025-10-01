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

  // Load initial data from localStorage
  useEffect(() => {
    const allScores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{') as ScoreStorage;
    const savedData = allScores[sauceId];
    if (savedData) {
      setScores(savedData.scores || {});
      setComment(savedData.comment || '');
    }
  }, [sauceId]);

  const updateStorage = useCallback((key: 'scores' | 'comment', value: any) => {
    const allScores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{') as ScoreStorage;
    
    const currentData = allScores[sauceId] || {
      sauceId,
      sauceName,
      scores: {},
      comment: '',
    };

    const updatedData = { ...currentData, [key]: value };
    
    const newAllScores = { ...allScores, [sauceId]: updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllScores));
  }, [sauceId, sauceName]);


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
