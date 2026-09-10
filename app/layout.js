import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "TC-Immo — Construire en Côte d'Ivoire, en toute sécurité",
  description:
    "Soyez maître de vos travaux : trouvez votre artisan, suivez vos travaux en temps réel, payez à votre rythme.",
};

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
