'use client';
import React, { useState, useEffect } from 'react';
import { type Post } from '@/api/orations';
import EditionColumn from './edition-column';
import { Split } from 'lucide-react';

interface ParallelViewProps {
  initialPost: Post;
  availablePosts: Post[];
  contentType: 'orations' | 'letters' | 'sayings';
  highlightRef?: string | null;
  englishWord?: string | null;
  arabicWord?: string | null;
}

const ParallelView = ({
  initialPost,
  availablePosts,
  contentType,
  highlightRef,
  englishWord,
  arabicWord
}: ParallelViewProps) => {
  const [leftPost, setLeftPost] = useState<Post>(initialPost);
  const [rightPost, setRightPost] = useState<Post | null>(null);

  useEffect(() => {
    setLeftPost(initialPost);
    setRightPost(null);
  }, [initialPost]);

  // Initialize right post with a different edition if available
  useEffect(() => {
    if (availablePosts.length > 1 && !rightPost) {
      const otherPost = availablePosts.find(p => p.id !== initialPost.id);
      if (otherPost) {
        setRightPost(otherPost);
      } else {
        setRightPost(availablePosts[0]);
      }
    } else if (availablePosts.length > 0 && !rightPost) {
      setRightPost(availablePosts[0]);
    }
  }, [availablePosts, initialPost.id, rightPost]);

  const handleLeftEditionChange = (editionId: string) => {
    const post = availablePosts.find(p => {
      if (p.editions && Array.isArray(p.editions)) {
        return p.editions.some((e: any) => e.id.toString() === editionId);
      } else if (p.editions && p.editions.id) {
        return p.editions.id.toString() === editionId;
      }
      return false;
    });
    if (post) setLeftPost(post);
  };

  const handleRightEditionChange = (editionId: string) => {
    const post = availablePosts.find(p => {
      if (p.editions && Array.isArray(p.editions)) {
        return p.editions.some((e: any) => e.id.toString() === editionId);
      } else if (p.editions && p.editions.id) {
        return p.editions.id.toString() === editionId;
      }
      return false;
    });
    if (post) setRightPost(post);
  };

  return (
    <div className="parallel-view">
      <div className="parallel-view__grid">
        <div className="parallel-view__col">
          <EditionColumn
            content={leftPost}
            availablePosts={availablePosts}
            contentType={contentType}
            highlightRef={highlightRef}
            englishWord={englishWord}
            arabicWord={arabicWord}
            onEditionChange={handleLeftEditionChange}
            side="left"
          />
        </div>
        <div className="parallel-view__col">
          {rightPost ? (
            <EditionColumn
              content={rightPost}
              availablePosts={availablePosts}
              contentType={contentType}
              highlightRef={highlightRef}
              englishWord={englishWord}
              arabicWord={arabicWord}
              onEditionChange={handleRightEditionChange}
              side="right"
            />
          ) : (
            <div className="parallel-view__empty">
              <div className="parallel-view__empty-icon">
                <Split className="w-7 h-7" />
              </div>
              <h3 className="parallel-view__empty-title">Compare Editions</h3>
              <p className="parallel-view__empty-text">
                Select another edition from the dropdown to see them side-by-side.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParallelView;
