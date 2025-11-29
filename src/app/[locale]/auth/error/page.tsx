import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const t = useTranslations('auth.error');

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-semibold text-white">{t('title')}</h1>
        <p className="mb-6 text-zinc-400">{t('message')}</p>
        <Link href={ROUTES.HOME()}>
          <Button>{t('go_home')}</Button>
        </Link>
      </div>
    </div>
  );
}

