import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es-AR' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="fixed top-4 right-4"
      title={i18n.language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      <Languages className="h-5 w-5" />
    </Button>
  );
}
