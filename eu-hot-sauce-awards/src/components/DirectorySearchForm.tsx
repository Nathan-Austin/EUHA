'use client';

// TODO: wire up once the maker/sauce directory + search results page exists.
export default function DirectorySearchForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex min-w-[320px] max-w-[520px] flex-1 border-[3px] border-[#F5C518] bg-white"
    >
      <input
        type="text"
        placeholder="Search a maker, sauce, country or chilli"
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
