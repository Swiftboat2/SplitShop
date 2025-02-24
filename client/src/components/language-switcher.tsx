import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SiUnitednations } from "react-icons/si";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es-AR' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      className="fixed top-4 right-4 w-10 h-10"
      title={i18n.language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      {i18n.language === 'en' ? '🇺🇸' : '🇦🇷'}
    </Button>
  );
}