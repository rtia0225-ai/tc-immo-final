"use client";

import { useState } from "react";
import Link from "next/link";

const QUESTIONS = {
  q1: {
    number: 1,
    question: "Où se situe votre terrain ?",
    options: [
      { label: "En zone villageoise / hors lotissement approuvé par l'État", next: "r1" },
      { label: "En ville, dans un quartier loti et approuvé par le Ministère", next: "q2" },
    ],
  },
  q2: {
    number: 2,
    question: "Quel document avez-vous en main ?",
    options: [
      { label: "Un papier provisoire (attestation villageoise, lettre d'attribution, attestation de cession)", next: "r2" },
      { label: "Un titre de propriété officiel et définitif de l'État (ACD ou Titre Foncier)", next: "q3" },
    ],
  },
  q3: {
    number: 3,
    question: "Avez-vous le Certificat d'Urbanisme (CU) du Guichet Unique ?",
    options: [
      { label: "Non", next: "r3" },
      { label: "Oui, j'ai déjà le Certificat d'Urbanisme signé et mes extraits topo tamponnés", next: "q4" },
    ],
  },
  q4: {
    number: 4,
    question: "Que souhaitez-vous construire ?",
    options: [
      { label: "Une maison d'habitation simple (villa basse ou duplex R+1)", next: "r4" },
      { label: "Un grand bâtiment (immeuble R+2 ou plus, sous-sol, local commercial/bureaux)", next: "r5" },
    ],
  },
};

const RESULTS = {
  r1: {
    situation: "Votre terrain relève encore du droit traditionnel coutumier.",
    action: "Le terrain doit d'abord être officiellement rattaché à un lotissement approuvé par le Ministère de la Construction. Sans cette reconnaissance de la zone par l'État, aucune demande de permis de construire ne peut être reçue.",
    professionals: [{ trade: "Topographe" }],
  },
  r2: {
    situation: "Vous êtes dans un quartier approuvé, mais vous n'avez qu'un papier d'attribution provisoire.",
    action: "Il faut obtenir votre ACD (Arrêté de Concession Définitive) auprès du Ministère de la Construction. L'État exige ce titre de propriété définitif pour délivrer un permis de construire.",
    professionals: [{ trade: "Topographe", note: "pour monter le dossier technique de bornage" }],
  },
  r3: {
    situation: "Vous avez votre ACD, mais le projet n'est pas encore examiné par les services techniques de l'État.",
    action: "Il faut déposer la demande de Certificat d'Urbanisme (étape 1 du Guichet Unique). Ce document confirme ce qu'il est permis de bâtir sur la parcelle et valide les accès à l'eau, à l'électricité et à l'évacuation des eaux.",
    professionals: [{ trade: "Topographe", note: "pour imprimer les 5 exemplaires du plan officiel du terrain" }],
  },
  r4: {
    situation: "Vous avez le feu vert administratif du terrain pour votre projet d'habitation.",
    action: "Il faut faire concevoir les plans officiels de la maison au format A3 et déposer le dossier complet au Guichet Unique pour obtenir votre Permis de Construire (étape 2).",
    professionals: [{ trade: "Architecture", note: "il dessine l'ensemble des plans réglementaires et appose son cachet officiel" }],
  },
  r5: {
    situation: "Votre projet comporte des charges lourdes (étages multiples ou activités commerciales).",
    action: "Il faut réaliser les plans du bâtiment, une analyse de la résistance du sol et des calculs de solidité du béton avant de déposer le dossier final de permis au Guichet Unique.",
    professionals: [
      { trade: "Architecture", note: "pour les plans" },
      { trade: "Ingénieur génie civil", note: "pour l'étude de sol et le ferraillage" },
    ],
  },
};

const TOTAL_QUESTIONS = 4;

export default function ConstructionWizard() {
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState(["q1"]);

  const currentKey = history[history.length - 1];
  const currentQuestion = QUESTIONS[currentKey];
  const currentResult = RESULTS[currentKey];

  const choose = (next) => setHistory((h) => [...h, next]);
  const goBack = () => setHistory((h) => h.slice(0, -1));
  const restart = () => setHistory(["q1"]);

  if (!started) {
    return (
      <section className="border-b border-gray-100 bg-forest-light px-4 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-xl font-bold text-forest-dark">
            Vous ne savez pas par où commencer ?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Répondez à quelques questions sur votre terrain et votre projet — on vous dit exactement quelle démarche entreprendre et quel professionnel contacter sur la plateforme.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-5 rounded-lg bg-forest px-6 py-3 font-heading text-sm font-bold text-white hover:bg-forest-dark"
          >
            Trouver ma démarche
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-gray-100 bg-forest-light px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        {currentQuestion && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">
              Question {currentQuestion.number}/{TOTAL_QUESTIONS}
            </p>
            <h3 className="font-heading mt-2 text-lg font-bold text-ink">
              {currentQuestion.question}
            </h3>
            <div className="mt-4 flex flex-col gap-2">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => choose(opt.next)}
                  className="rounded-lg border border-gray-300 p-3 text-left text-sm hover:border-forest hover:bg-forest-light"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {history.length > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="mt-4 text-xs text-gray-500 hover:text-forest"
              >
                ← Question précédente
              </button>
            )}
          </>
        )}

        {currentResult && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">
              Votre démarche
            </p>
            <h3 className="font-heading mt-2 text-lg font-bold text-ink">
              {currentResult.situation}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {currentResult.action}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {currentResult.professionals.map((p) => (
                <Link
                  key={p.trade}
                  href={`/artisans?trade=${encodeURIComponent(p.trade)}`}
                  className="rounded-lg bg-brand px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-dark"
                >
                  Voir les {p.trade.toLowerCase()}s disponibles
                  {p.note && (
                    <span className="mt-0.5 block text-xs font-normal text-white/80">
                      {p.note}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={goBack}
                className="text-xs text-gray-500 hover:text-forest"
              >
                ← Question précédente
              </button>
              <button
                type="button"
                onClick={restart}
                className="text-xs text-gray-500 hover:text-forest"
              >
                Recommencer
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
