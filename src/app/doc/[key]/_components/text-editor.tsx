'use client';

import { useDocument } from '@yorkie-js/react';
import { useCallback, useMemo, useRef, useEffect } from 'react';

interface TextSchema {
  text: string;
}

const TextEditor = () => {
  const { root, presences, update, loading, error } = useDocument<TextSchema>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 커서 위치를 렌더 없이 추적
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const prevValueRef = useRef<string | null>(null);
  const isLocalChangeRef = useRef(false);

  const userCount = useMemo(() => presences?.length || 0, [presences]);
  const value = (root as Partial<TextSchema>)?.text ?? '';

  // 최소 변경 영역(diff-요약) 계산
  const summarizeChange = (prev: string, curr: string) => {
    if (prev === curr) return { start: 0, removedLen: 0, insertedLen: 0 };

    let start = 0;
    const minLen = Math.min(prev.length, curr.length);
    while (start < minLen && prev.charCodeAt(start) === curr.charCodeAt(start)) start++;

    let suffix = 0;
    while (
      suffix < minLen - start &&
      prev.charCodeAt(prev.length - 1 - suffix) === curr.charCodeAt(curr.length - 1 - suffix)
    ) {
      suffix++;
    }

    const removedLen = prev.length - start - suffix;
    const insertedLen = curr.length - start - suffix;
    return { start, removedLen, insertedLen };
  };

  // 원격 변경 시 커서 위치 보정
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    // 최초 마운트 시 기준값만 세팅
    if (prevValueRef.current === null) {
      prevValueRef.current = value;
      return;
    }

    const prev = prevValueRef.current;
    const curr = value;

    // 로컬 변경이면 브라우저의 커서 이동을 신뢰
    if (isLocalChangeRef.current) {
      isLocalChangeRef.current = false;
      selectionRef.current = {
        start: ta.selectionStart ?? selectionRef.current.start,
        end: ta.selectionEnd ?? selectionRef.current.end,
      };
      prevValueRef.current = curr;
      return;
    }

    // 원격 변경에 의한 값 변화라면 커서를 보정
    if (prev !== curr) {
      const { start, removedLen, insertedLen } = summarizeChange(prev, curr);
      const delta = insertedLen - removedLen;

      let s = selectionRef.current.start;
      let e = selectionRef.current.end;

      // 변경이 커서 앞이면 통째로 밀기
      if (start < s) {
        s += delta;
        e += delta;
      }
      // 변경이 선택 구간 안이면 끝쪽만 밀기
      else if (start <= e) {
        e += delta;
      }

      // 범위 보정
      s = Math.max(0, Math.min(s, curr.length));
      e = Math.max(0, Math.min(e, curr.length));

      // 레이아웃 이후 적용하면 깜빡임이 덜해요
      requestAnimationFrame(() => ta.setSelectionRange(s, e));
      selectionRef.current = { start: s, end: e };
    }

    prevValueRef.current = curr;
  }, [value]);

  // 로컬 입력: 값 업데이트 + 현재 커서 기억 + 로컬 플래그
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      isLocalChangeRef.current = true;
      selectionRef.current = {
        start: e.target.selectionStart ?? selectionRef.current.start,
        end: e.target.selectionEnd ?? selectionRef.current.end,
      };

      const next = e.target.value;
      if (next !== value) {
        update((r) => {
          (r as TextSchema).text = next;
        });
      }
    },
    [update, value],
  );

  // 마우스/키보드로 커서만 이동했을 때도 추적
  const handleSelect = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    selectionRef.current = {
      start: ta.selectionStart ?? selectionRef.current.start,
      end: ta.selectionEnd ?? selectionRef.current.end,
    };
  }, []);
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
          ref={textareaRef}
          className="h-[60vh] w-full resize-none bg-transparent p-2 text-base leading-7 text-gray-900 placeholder-gray-400 outline-none focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
          placeholder="여기에 자유롭게 메모를 남겨 보세요. 링크를 공유하면 함께 편집할 수 있어요."
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
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
