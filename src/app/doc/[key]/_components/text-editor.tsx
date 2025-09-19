'use client';

import { useDocument } from '@yorkie-js/react';
import { useCallback, useMemo } from 'react';

interface TextSchema {
  text: string;
}

const TextEditor = () => {
  const { root, presences, update, loading, error } = useDocument<TextSchema>();

  const userCount = useMemo(() => presences?.length || 0, [presences]);

  // 초기화는 DocumentProvider의 initialRoot가 보장하므로 별도 처리 없음

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      update((r) => {
        (r as TextSchema).text = next;
      });
    },
    [update],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 h-6 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-zinc-800" />
        <div className="h-[60vh] w-full animate-pulse rounded-2xl border border-gray-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          에디터 로딩 중 오류가 발생했어요: {error.message}
        </div>
      </div>
    );
  }

  const value = (root as Partial<TextSchema>)?.text ?? '';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
          <span className="inline-block size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-xs font-medium">현재 {userCount}명 편집 중</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <textarea
          className="h-[60vh] w-full resize-none bg-transparent p-2 text-base leading-7 text-gray-900 placeholder-gray-400 outline-none focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
          placeholder="여기에 자유롭게 메모를 남겨 보세요. 링크를 공유하면 함께 편집할 수 있어요."
          value={value}
          onChange={handleChange}
          spellCheck={false}
        />
        <div className="mt-1 text-right text-[11px] text-gray-500 select-none dark:text-zinc-400">
          {value.length.toLocaleString()}자
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
