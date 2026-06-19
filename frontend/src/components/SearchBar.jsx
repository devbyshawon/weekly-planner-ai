import { useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES } from "../utils/categories";

export default function SearchBar({ onFilter }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const update = (q, cat) => {
    onFilter({ query: q.toLowerCase(), category: cat });
  };

  const clear = () => {
    setQuery("");
    setSelectedCategory("");
    onFilter({ query: "", category: "" });
  };

  const hasFilter = query || selectedCategory;

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <div className="relative flex-1 min-w-40">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); update(e.target.value, selectedCategory); }}
          placeholder="Search events..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-ink-soft border border-white/10 text-sand text-xs placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => { setSelectedCategory(e.target.value); update(query, e.target.value); }}
        className="px-2 py-1.5 rounded-lg bg-ink-soft border border-white/10 text-sand text-xs focus:outline-none focus:ring-1 focus:ring-gold"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {hasFilter && (
        <button onClick={clear} className="flex items-center gap-1 text-ink-faint text-xs hover:text-sand">
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
