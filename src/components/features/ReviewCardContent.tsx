'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

const MAX_PREVIEW_LENGTH = 300;

interface ReviewCardContentProps {
  content: string;
}

export function ReviewCardContent({ content }: ReviewCardContentProps) {
  const t = useTranslations('review');
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongContent = content.length > MAX_PREVIEW_LENGTH;
  const displayContent = isLongContent && !isExpanded
    ? content.substring(0, MAX_PREVIEW_LENGTH) + '...'
    : content;

  return (
    <div>
      <p className="text-sm whitespace-pre-wrap text-zinc-300 leading-relaxed md:text-base">
        {displayContent}
      </p>
      {isLongContent && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {t('show_less')}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {t('read_more')}
            </>
          )}
        </button>
      )}
    </div>
  );
}

