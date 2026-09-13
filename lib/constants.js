// Listes fixes utilisées dans les menus déroulants du site — jamais de
// saisie libre pour ces champs, afin de garder des données cohérentes et
// filtrables (recherche, mobilité, services).

export const CI_CITIES = [
  "Abidjan - Cocody",
  "Abidjan - Marcory",
  "Abidjan - Plateau",
  "Abidjan - Yopougon",
  "Abidjan - Treichville",
  "Abidjan - Koumassi",
  "Abidjan - Port-Bouët",
  "Abidjan - Attécoubé",
  "Abidjan - Adjamé",
  "Abidjan - Abobo",
  "Abidjan - Anyama",
  "Abidjan - Songon",
  "Abengourou", "Aboisso", "Adiaké", "Adzopé", "Afféry", "Agboville",
  "Agnibilékrou", "Agou", "Akoupé", "Alépé", "Anoumaba", "Arrah", "Assuéfry",
  "Ayamé", "Azaguié", "Bako", "Bangolo", "Bassawa", "Bédiala", "Béoumi",
  "Bettié", "Biankouma", "Bingerville", "Bin-Houyé", "Bloléquin", "Bocanda",
  "Bodokro", "Bondoukou", "Bongouanou", "Boniérédougou", "Bonon", "Bonoua",
  "Booko", "Borotou", "Botro", "Bouaflé", "Bouaké", "Bouna", "Boundiali",
  "Brobo", "Buyo", "Dabakala", "Dabou", "Daloa", "Danané", "Daoukro", "Diabo",
  "Dianra", "Diawala", "Didiévi", "Diégonéfla", "Dikodougou", "Dimbokro",
  "Dioulatièdougou", "Divo", "Djékanou", "Djibrosso", "Doropo", "Dualla",
  "Duékoué", "Ettrokro", "Facobly", "Ferkessédougou", "Foumbolo", "Fresco",
  "Fronan", "Gagnoa", "Gboguhé", "Gbon", "Gbonné", "Gohitafla", "Goulia",
  "Grabo", "Grand-Bassam", "Grand-Béréby", "Grand-Lahou", "Grand-Zattry",
  "Guéyo", "Guibéroua", "Guiembé", "Guintéguéla", "Guiglo", "Guitry", "Hiré",
  "Issia", "Jacqueville", "Kanakono", "Kani", "Kaniasso", "Karakoro",
  "Kasséré", "Katiola", "Kokumbo", "Kolia", "Komborodougou", "Kong",
  "Kongasso", "Koonan", "Korhogo", "Koro", "Kouassi-Datékro",
  "Kouassi-Kouassikro", "Kouibly", "Koumbala", "Kounahiri", "Koun-Fao",
  "Kouto", "Lakota", "Logoualé", "Madinani", "Maféré", "Man", "Mankono",
  "Massala", "Mayo", "M'Bahiakro", "M'Batto", "M'Bengué", "Méagui",
  "Minignan", "Morondo", "Napiéolédougou", "Nassian", "N'Djébonouan",
  "Niablé", "Niakaramandougou", "Niellé", "Niofoin", "Odienné",
  "Ouangolodougou", "Ouaninou", "Ouellé", "Oumé", "Ouragahio", "Prikro",
  "Rubino", "Saïoua", "Sakassou", "Samatiguila", "Sandégué", "Sangouiné",
  "San-Pédro", "Sarhala", "Sassandra", "Satama-Sokoro", "Satama-Sokoura",
  "Séguéla", "Séguélon", "Seydougou", "Sifié", "Sikensi", "Sinématiali",
  "Sinfra", "Sipilou", "Sirasso", "Soubré", "Taabo", "Tabou", "Tafiré",
  "Taï", "Tanda", "Téhini", "Tengréla", "Tiapoum", "Tiassalé", "Tiébissou",
  "Tiémé", "Tiémélékro", "Tié-N'Diékro", "Tiéningboué", "Tienko",
  "Tioroniaradougou", "Tortiya", "Touba", "Toulépleu", "Toumodi", "Transua",
  "Vavoua", "Worofla", "Yakassé-Attobrou", "Yamoussoukro", "Zikisso",
  "Zouan-Hounien", "Zoukougbeu", "Zuénoula",
].sort((a, b) => a.localeCompare(b, "fr"));

export const SENIOR_TRADES = ["Architecture", "Ingénieur génie civil"];

// Architecte et Topographe : le client ne définit qu'une seule échéance,
// payée en un seul virement, déclenché par l'envoi du document livré.
// Tous les autres métiers (maçonnerie en tête) : minimum 5 échéances
// obligatoires, jamais un paiement en une seule fois.
export const SINGLE_INSTALLMENT_TRADES = {
  "Architecture": "Permis de Construire",
  "Topographe": "ACD",
};
export const MIN_INSTALLMENTS_OTHER_TRADES = 5;

export const CONSTRUCTION_SERVICES = [
  "Topographe",
  "Architecture",
  "Ingénieur génie civil",
  "Gros-œuvre",
  "Maçonnerie",
  "Plomberie",
  "Électricité",
  "Menuiserie",
  "Peinture",
  "Carrelage",
  "Climatisation & Froid",
  "Étanchéité",
  "Charpente",
  "Soudure & Métallerie",
  "Décoration",
  "Terrassement",
  "Second-œuvre",
];

export const HOUSE_TYPES = [
  "Studio",
  "Appartement",
  "Villa",
  "Duplex",
  "Immeuble",
  "Bureau / Local commercial",
  "Autre",
];

export const RECOMMENDATION_OPTIONS = [
  { value: "top3", label: "3 recommandations de notre part" },
  { value: "all", label: "Toute la liste" },
];

export const MOBILE_MONEY_OPERATORS = [
  "Wave",
  "MTN Mobile Money",
  "Orange Money",
  "Moov Money",
];

export const ID_DOCUMENT_TYPES = [
  "Carte Nationale d'Identité (CNI)",
  "Passeport",
  "Attestation d'identité",
  "Autre",
];

export const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
