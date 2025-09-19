'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = name.trim();
    if (!key) return;
    // 안전하게 인코딩하여 이동
    router.push(`/doc/${encodeURIComponent(key)}`);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold tracking-[-0.01em] sm:text-3xl">
          Yorkie Text Collab Demo
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          문서 이름을 입력해 새 문서를 만들거나 기존 문서를 열어보세요.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 caret-indigo-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:caret-indigo-400"
            placeholder="예: team-notes, sprint-2025-09, my-doc"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:hover:bg-indigo-500/90"
            aria-label="Open document"
          >
            열기
          </button>
        </form>

        <div className="mt-3 text-xs text-gray-500 dark:text-zinc-400">
          생성된 URL을 공유하면 같은 문서에서 동시에 편집할 수 있어요.
        </div>
      </div>
    </main>
  );
}
