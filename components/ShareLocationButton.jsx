"use client";

import { useState } from "react";
import { saveHomeLocation } from "@/app/dashboard/profile/actions";

export default function ShareLocationButton({ capturedAt, latitude, longitude }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleShare = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const result = await saveHomeLocation(lat, lng);
        if (result?.error) {
          setStatus("error");
          setErrorMsg(result.error);
        } else {
          setStatus("done");
        }
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "Autorisation refusée. Active la localisation pour ton navigateur dans les réglages de ton téléphone."
            : "Impossible de récupérer ta position. Réessaie."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <p className="mb-3 text-sm text-ink">
        Attends d'être chez toi, à la maison, avant d'appuyer sur ce bouton. C'est ça qui deviendra ton adresse.
      </p>

      {latitude && longitude && (
        <p className="mb-2 text-sm text-ink">
          Position enregistrée
          {capturedAt && ` le ${new Date(capturedAt).toLocaleDateString("fr-FR")}`} —{" "}
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand hover:underline"
          >
            voir sur la carte
          </a>
        </p>
      )}

      <button
        type="button"
        onClick={handleShare}
        disabled={status === "loading"}
        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50 disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {status === "loading"
          ? "Localisation en cours..."
          : latitude
            ? "Mettre à jour ma position"
            : "Partager ma position"}
      </button>

      {status === "done" && (
        <p className="mt-2 text-sm text-forest">Position enregistrée avec succès.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-brand">{errorMsg}</p>
      )}
      <p className="mt-3 text-xs text-gray-500">
        Les clients ne verront jamais cette adresse.
      </p>
    </div>
  );
}
