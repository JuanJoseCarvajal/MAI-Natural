
import { SiteText } from "@/components/common/SiteText";
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import AccountProfileForm from '@/components/features/account/AccountProfileForm';

export default async function AccountProfilePage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; email?: string | null } | undefined;

  if (!session?.user || (!sessionUser?.id && !sessionUser?.email)) {
    redirect('/login?callbackUrl=/account/profile');
  }

  const user =
    (sessionUser.id ? await db.user.findUnique({ where: { id: sessionUser.id } }) : null) ??
    (sessionUser.email ? await db.user.findUnique({ where: { email: sessionUser.email } }) : null);

  const initialUser = {
    name: user?.name ?? session.user.name ?? 'Usuario MAI',
    email: user?.email ?? session.user.email ?? '',
    phone: user?.phone ?? '',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900"><SiteText id="43efa3b56b07787b5ed8">{"Perfil"}</SiteText></h1>
      <p className="mt-2 text-slate-700"><SiteText id="87857bce41c9395fde1e">{"Configura tus datos personales y preferencias."}</SiteText></p>
      <AccountProfileForm initialUser={initialUser} />
    </div>
  );
}
