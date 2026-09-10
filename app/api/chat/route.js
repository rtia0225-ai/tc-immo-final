import { NextResponse } from "next/server";

// Décrit TC-Immo au chatbot pour qu'il réponde avec les bonnes informations,
// sans halluciner de fonctionnalités qui n'existent pas.
const SYSTEM_PROMPT = `Tu es l'assistant d'aide de TC-Immo, une marketplace qui connecte la diaspora ivoirienne à des artisans vérifiés en Côte d'Ivoire pour construire ou rénover en toute sécurité, à distance.

Fonctionnement de la plateforme :
- Le client recherche un artisan (métier, ville), consulte son profil (expérience, tarifs, réalisations, avis).
- Il peut échanger par message ou prendre un rendez-vous vidéo avec l'artisan avant de s'engager.
- Une fois d'accord sur un devis, un projet est créé avec un chronogramme standard (Fondations, Dalle, Murs, Toiture, Finitions).
- Le paiement du client reste séquestré sur la plateforme et n'est libéré à l'artisan qu'au fur et à mesure de la validation des étapes du chantier — c'est le principe central de sécurité.
- Le client peut suivre son chantier via une caméra installée sur place.
- Les artisans sont vérifiés (RCCM) avant d'être référencés.
- Les échanges de numéros de téléphone dans la messagerie ne sont pas autorisés (pour garder les échanges et paiements sur la plateforme).

Réponds toujours en français, de façon brève et utile (2-4 phrases maximum sauf si la question demande plus de détail). Si tu ne connais pas la réponse à une question précise (ex: tarifs exacts, disponibilité d'un artisan en particulier), dis-le simplement et invite la personne à contacter le support ou à consulter la page "Comment ça marche" / "FAQ". Ne donne jamais de conseils juridiques ou financiers définitifs — reste informatif.`;

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Le chatbot n'est pas encore configuré (clé API manquante)." },
      { status: 500 }
    );
  }

  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Erreur API Anthropic:", errText);
      return NextResponse.json(
        { error: "Le chatbot est momentanément indisponible." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Désolé, je n'ai pas de réponse à te donner.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Erreur chatbot:", err);
    return NextResponse.json(
      { error: "Le chatbot est momentanément indisponible." },
      { status: 500 }
    );
  }
}
