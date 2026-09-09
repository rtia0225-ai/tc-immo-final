// Détecte la présence d'un numéro de téléphone dans un texte, sous ses
// formes courantes : avec ou sans espaces/points/tirets, avec ou sans
// indicatif international (+225...). Volontairement large pour bloquer
// aussi les numéros "espacés" pour tenter de contourner le filtre
// (ex: "07 01 02 03 04", "07.01.02.03.04", "0701020304").
export function containsPhoneNumber(text) {
  if (!text) return false;

  // Au moins 8 chiffres au total, séparés ou non par espaces/points/tirets/parenthèses
  const digitGroup = /(?:\+?\d[\s.\-()]?){8,}/g;
  const matches = text.match(digitGroup) || [];

  return matches.some((m) => (m.match(/\d/g) || []).length >= 8);
}
