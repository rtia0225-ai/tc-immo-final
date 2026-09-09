"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendVoiceMessage } from "@/app/messages/actions";

export default function VoiceRecorder({ conversationId }) {
  const [status, setStatus] = useState("idle"); // idle | recording | sending | error
  const [errorMsg, setErrorMsg] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const router = useRouter();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        setStatus("sending");
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("audio", blob, "voice-note.webm");

        const result = await sendVoiceMessage(formData);
        if (result?.error) {
          setStatus("error");
          setErrorMsg(result.error);
        } else {
          setStatus("idle");
          router.refresh();
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch {
      setStatus("error");
      setErrorMsg("Autorise l'accès au micro pour envoyer une note vocale.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <div className="flex items-center gap-2">
      {status === "recording" ? (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          Arrêter
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          disabled={status === "sending"}
          aria-label="Enregistrer une note vocale"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-ink hover:bg-gray-50 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
          </svg>
        </button>
      )}

      {status === "sending" && <span className="text-xs text-gray-500">Envoi en cours...</span>}
      {status === "error" && <span className="text-xs text-brand">{errorMsg}</span>}
    </div>
  );
}
