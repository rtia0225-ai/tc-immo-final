import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "TC-Immo",
  description:
    "Soyez maître de vos travaux : trouvez votre artisan, suivez vos travaux en temps réel, payez à votre rythme.",
};

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <Navbar user={user} isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
