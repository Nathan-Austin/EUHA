'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DirectorySearchForm() {
  const router = useRouter();
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/makers?q=${encodeURIComponent(q)}` : '/makers');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-w-[320px] max-w-[520px] flex-1 border-[3px] border-[#F5C518] bg-white"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search a maker, country or category"
        className="flex-1 border-0 px-[22px] py-[18px] text-[17px] outline-none"
      />
      <button
        type="submit"
        className="bg-[#F5C518] px-7 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
      >
        Search
      </button>
    </form>
  );
}
