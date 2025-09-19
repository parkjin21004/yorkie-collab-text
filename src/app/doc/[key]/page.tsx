'use client';

import React from 'react';
import { YorkieProvider, DocumentProvider } from '@yorkie-js/react';
import TextEditor from '@/app/doc/[key]/_components/text-editor';
import Link from 'next/link';

export default function DocPage({ params }: { params: Promise<{ key: string }> }) {
  const apiKey = process.env.NEXT_PUBLIC_YORKIE_API_KEY!;
  const { key } = React.use(params);
  const docKey = decodeURIComponent(key || '').trim();

  if (!docKey) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <p className="text-lg">문서 키가 비어 있어요.</p>
          <Link href="/" className="mt-2 inline-block text-indigo-600 underline">
            돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50 p-4 sm:p-8 dark:bg-zinc-950">
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] break-all sm:text-3xl">
            /doc/{docKey}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-zinc-300">
            이 URL을 공유하면 같은 문서를 함께 편집할 수 있어요.
          </p>
        </div>
        <Link
          href="/"
          aria-label="돌아가기"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12.5 4.5L6 10l6.5 5.5M6 10h8" />
          </svg>
          <span>돌아가기</span>
        </Link>
      </div>

      <YorkieProvider apiKey={apiKey}>
        {/* 초기 루트에 스키마를 지정해 새 문서에서도 text를 보장 */}
        <DocumentProvider docKey={docKey} initialRoot={{ text: '' }}>
          <TextEditor />
        </DocumentProvider>
      </YorkieProvider>
    </main>
  );
}
