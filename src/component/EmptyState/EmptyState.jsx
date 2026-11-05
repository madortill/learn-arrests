import React, { useEffect } from 'react';

export default function EmptyState({ onComplete }) {
  // מיד כשהקומפוננטה נטענת, היא מאותתת ל-System שהשלב "הושלם"
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  return null; // לא מרנדרת כלום על המסך
}