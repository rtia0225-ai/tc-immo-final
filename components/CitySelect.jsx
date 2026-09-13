"use client";

import { useState, useRef, useEffect } from "react";

// Remplace un simple <select> par un champ où on tape les premières
// lettres pour filtrer la liste — indispensable avec ~200 villes.
// mode "single" : une seule ville, envoyée via un input caché `name`.
// mode "multiple" : plusieurs villes cochables, chacune via un input
// caché répété avec le même `name` (comme des checkboxes classiques).
export default function CitySelect({
  cities,
  name,
  defaultValue = "",
  defaultValues = [],
  multiple = false,
  required = false,
  placeholder = "Tape le nom d'une ville...",
  inputClassName = "w-full rounded-lg border border-gray-300 p-2 text-sm",
}) {
  const [query, setQuery] = useState(multiple ? "" : defaultValue);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValues);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = cities.filter((c) =>
    c.toLowerCase().startsWith(query.toLowerCase())
  );

  if (multiple) {
    const toggleCity = (city) => {
      setSelected((s) =>
        s.includes(city) ? s.filter((c) => c !== city) : [...s, city]
      );
    };

    return (
      <div ref={containerRef} className="relative">
        {selected.map((c) => (
          <input key={c} type="hidden" name={name} value={c} />
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={inputClassName}
        />
        {selected.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {selected.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 rounded-full bg-forest-light px-2 py-0.5 text-xs text-forest"
              >
                {c}
                <button type="button" onClick={() => toggleCity(c)} aria-label={`Retirer ${c}`}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        {open && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {filtered.slice(0, 50).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCity(c)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  selected.includes(c) ? "bg-forest-light text-forest" : ""
                }`}
              >
                {selected.includes(c) ? "✓ " : ""}{c}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mode "single"
  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={query} required={required} />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.slice(0, 50).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setQuery(c);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
