"use client";

import { useState } from "react";

export default function PhotoCarousel({ photos }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="mt-3 flex h-48 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
        Aucune photo pour le moment
      </div>
    );
  }

  const goPrev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  const current = photos[index];

  return (
    <>
      <div className="relative mt-3">
        {current.media_type === "video" ? (
          <video
            src={current.photo_url}
            controls
            className="h-64 w-full rounded-xl bg-black object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="block w-full"
            aria-label="Zoomer sur la photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.photo_url}
              alt={current.caption || "Réalisation"}
              className="h-64 w-full rounded-xl object-cover"
            />
          </button>
        )}

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((p, i) => (
                <span
                  key={p.id}
                  className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.photo_url}
            alt={current.caption || "Réalisation"}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Fermer"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
