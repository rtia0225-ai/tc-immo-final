"use client";

import { useRef, useState } from "react";

// Remplace le texte natif du navigateur ("Choose File" / "No file chosen",
// affiché dans la langue du navigateur, pas celle du site) par un bouton
// et un texte entièrement en français.
export default function FileInputButton({
  name,
  accept,
  required,
  multiple,
  label = "Choisir un fichier",
  className = "",
}) {
  const inputRef = useRef(null);
  const [fileNames, setFileNames] = useState("");

  const handleChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setFileNames("");
    } else if (files.length === 1) {
      setFileNames(files[0].name);
    } else {
      setFileNames(`${files.length} fichiers sélectionnés`);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        required={required}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-ink hover:bg-gray-50"
      >
        {label}
      </button>
      <span className="truncate text-sm text-gray-500">
        {fileNames || "Aucun fichier choisi"}
      </span>
    </div>
  );
}
