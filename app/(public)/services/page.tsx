import ConsultationExperience from '@/components/features/services/ConsultationExperience';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Asesoría personal con Melina Jimenez Isaza | MAI Natural',
  description: 'Un espacio de escucha con la creadora de MAI. Explora tu cuidado, solicita un encuentro inicial y conoce un camino de acompañamiento personal.',
  path: '/services',
});

export default function ServicesPage() {
  return <ConsultationExperience />;
}
