import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';

const DemoBanner = () => {
  const { isDemo } = useAuth();
  const { t } = useLanguage();

  if (!isDemo) return null;

  return (
    <div className="bg-accent text-accent-foreground text-center text-xs font-bold py-1.5 px-4">
      🎭 {t.auth.demoBanner}
    </div>
  );
};

export default DemoBanner;
