"use client";

import { useState } from "react";
import Link from "next/link";

const QUESTIONS = [
  {
    key: "q1",
    question: "Où se situe votre terrain ?",
    options: [
      { value: "A", label: "En zone villageoise / hors lotissement approuvé par l'État" },
      { value: "B", label: "En ville, dans un quartier loti et approuvé par le Ministère" },
    ],
  },
  {
    key: "q2",
    question: "Quel document avez-vous en main ?",
    options: [
      { value: "A", label: "Un papier provisoire (attestation villageoise, lettre d'attribution, attestation de cession)" },
      { value: "B", label: "Un titre de propriété officiel et définitif de l'État (ACD ou Titre Foncier)" },
    ],
  },
  {
    key: "q3",
    question: "Avez-vous le Certificat d'Urbanisme (CU) du Guichet Unique ?",
    options: [
      { value: "A", label: "Non" },
      { value: "B", label: "Oui, j'ai déjà le Certificat d'Urbanisme signé et mes extraits topo tamponnés" },
    ],
  },
  {
    key: "q4",
    question: "Que souhaitez-vous construire ?",
    options: [
      { value: "A", label: "Une maison d'habitation simple (villa basse ou duplex R+1)" },
      { value: "B", label: "Un grand bâtiment (immeuble R+2 ou plus, sous-sol, local commercial/bureaux)" },
    ],
  },
];

// Construit la feuille de route complète, cumulée, jusqu'au dépôt du
// Permis de Construire — pas seulement la toute prochaine étape.
function buildRoadmap(answers) {
  const steps = [];

  if (answers.q1 === "A") {
    steps.push({
      title: "Rattacher le terrain à un lotissement approuvé",
      text: "Votre terrain relève encore du droit traditionnel coutumier. Il doit d'abord être officiellement rattaché à un lotissement approuvé par le Ministère de la Construction — sans cette reconnaissance, aucune demande de permis ne peut être reçue.",
      professional: { trade: "Topographe" },
    });
  }

  if (answers.q1 === "A" || answers.q2 === "A") {
    steps.push({
      title: "Obtenir l'ACD (Arrêté de Concession Définitive)",
      text: "L'État exige ce titre de propriété définitif pour délivrer un permis de construire. Un papier provisoire (attestation, lettre d'attribution...) ne suffit pas.",
      professional: { trade: "Topographe", note: "pour monter le dossier technique de bornage" },
    });
  }

  if (answers.q1 === "A" || answers.q2 === "A" || answers.q3 === "A") {
    steps.push({
      title: "Obtenir le Certificat d'Urbanisme (Guichet Unique, étape 1)",
      text: "Ce document confirme ce qu'il est permis de bâtir sur la parcelle et valide les accès à l'eau, à l'électricité et à l'évacuation des eaux.",
      professional: { trade: "Topographe", note: "pour imprimer les 5 exemplaires du plan officiel du terrain" },
    });
  }

  if (answers.q4 === "A") {
    steps.push({
      title: "Concevoir les plans et déposer le Permis de Construire (Guichet Unique, étape 2)",
      text: "Les plans officiels de la maison sont réalisés au format A3, puis le dossier complet est déposé pour obtenir le Permis de Construire.",
      professional: { trade: "Architecture", note: "il dessine l'ensemble des plans réglementaires et appose son cachet officiel" },
    });
  } else if (answers.q4 === "B") {
    steps.push({
      title: "Concevoir les plans, étudier le sol et déposer le Permis de Construire (Guichet Unique, étape 2)",
      text: "Un projet à charges lourdes (étages multiples, activité commerciale) demande en plus une étude de la résistance du sol et des calculs de solidité du béton avant le dépôt du dossier final.",
      professional: [
        { trade: "Architecture", note: "pour les plans" },
        { trade: "Ingénieur génie civil", note: "pour l'étude de sol et le ferraillage" },
      ],
    });
  }

  return steps;
}

export default function ConstructionWizard() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0); // index dans QUESTIONS, ou QUESTIONS.length pour le résultat
  const [answers, setAnswers] = useState({});

  const choose = (value) => {
    setAnswers((a) => ({ ...a, [QUESTIONS[step].key]: value }));
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  if (!started) {
    return (
      <section className="border-b border-gray-100 bg-forest-light px-4 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-xl font-bold text-forest-dark">
            Vous ne savez pas par où commencer ?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Répondez à quelques questions sur votre terrain et votre projet — on vous montre toute la feuille de route jusqu'au permis de construire, avec le bon professionnel à contacter à chaque étape.
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

  const isResult = step >= QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];
  const roadmap = isResult ? buildRoadmap(answers) : [];

  return (
    <section className="border-b border-gray-100 bg-forest-light px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        {!isResult && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">
              Question {step + 1}/{QUESTIONS.length}
            </p>
            <h3 className="font-heading mt-2 text-lg font-bold text-ink">
              {currentQuestion.question}
            </h3>
            <div className="mt-4 flex flex-col gap-2">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => choose(opt.value)}
                  className="rounded-lg border border-gray-300 p-3 text-left text-sm hover:border-forest hover:bg-forest-light"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {step > 0 && (
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

        {isResult && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">
              Votre feuille de route
            </p>
            <h3 className="font-heading mt-2 text-lg font-bold text-ink">
              {roadmap.length === 0
                ? "Vous êtes déjà prêt·e à déposer votre Permis de Construire."
                : `Voici les ${roadmap.length} étape${roadmap.length > 1 ? "s" : ""} qu'il vous reste avant le Permis de Construire`}
            </h3>

            <div className="mt-4 flex flex-col gap-4">
              {roadmap.map((s, i) => {
                const pros = Array.isArray(s.professional) ? s.professional : [s.professional];
                return (
                  <div key={s.title} className="border-l-2 border-forest pl-4">
                    <p className="text-xs font-semibold text-forest">Étape {i + 1}</p>
                    <p className="font-heading font-bold text-ink">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pros.map((p) => (
                        <Link
                          key={p.trade}
                          href={`/artisans?trade=${encodeURIComponent(p.trade)}`}
                          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
                        >
                          Voir les {p.trade.toLowerCase()}s
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex gap-4">
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
