'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JeLayout } from '@/components/layout/JELayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsersIcon, UserCircleIcon, CalendarIcon, MapPinIcon, FlagIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { jeService, JeDashboardData } from '@/lib/services/je.service';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  href: string;
  stats?: { label: string; value: number | string; icon: React.ElementType }[];
  buttonText?: string;
  buttonDisabled?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon: Icon, color, href, stats, buttonText = 'Accéder', buttonDisabled = false }) => {
  const router = useRouter();

  return (
    <Card className="bg-card border-border w-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {stats && (
          <div className="space-y-2">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <stat.icon className="h-4 w-4 mr-2" />
                  <span>{stat.label}</span>
                </div>
                <span className="font-semibold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => router.push(href)}
          className="w-1/2 mx-auto bg-black dark:bg-white dark:hover:bg-red-700 text-primary-foreground hover:bg-red-700"
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function JeDashboardPage() {
  const [dashboardData, setDashboardData] = useState<JeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await jeService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getZoneCardProps = (): ActionCardProps => {
    const zoneData = dashboardData?.zone;
    if (zoneData?.reservedZone) {
      return {
        title: 'Votre Zone Réservée',
        description: `Vous avez réservé la zone : ${zoneData.reservedZone.name}`,
        icon: MapPinIcon,
        color: 'text-green-500',
        href: '/je/zones',
        buttonText: 'Voir ma zone',
      };
    } else if (zoneData && zoneData.availableZones > 0) {
      return {
        title: 'Réserver une Zone',
        description: 'Des zones sont maintenant disponibles à la réservation.',
        icon: MapPinIcon,
        color: 'text-orange-500',
        href: '/je/zones',
        buttonText: 'Réservez maintenant',
      };
    } else {
      return {
        title: 'Réservation de Zone',
        description: 'Aucune zone n\'est disponible pour le moment. Veuillez attendre l\'ouverture des réservations.',
        icon: MapPinIcon,
        color: 'text-gray-500',
        href: '/je/zones',
        buttonText: 'Voir les zones',
        buttonDisabled: true,
      };
    }
  };

  const actionCards: ActionCardProps[] = dashboardData ? [
    {
      title: 'Mon Compte',
      description: 'Gérez les informations de votre compte.',
      icon: UserCircleIcon,
      color: 'text-green-500',
      href: '/je/profil',
      stats: dashboardData.profile ? [
        { label: 'Nom', value: dashboardData.profile.name || '', icon: UserCircleIcon },
        { label: 'Email', value: dashboardData.profile.email || '', icon: UserCircleIcon },
      ] : [],
      buttonText:'Voir détails'
    },
    {
      title: 'Gérer les Participants',
      description: 'Consultez et gérez la liste de vos participants inscrits.',
      icon: UsersIcon,
      color: 'text-blue-500',
      href: '/je/participants',
      stats: [
        { label: 'Total', value: dashboardData.participants?.total || 0, icon: UsersIcon },
        { label: 'Approuvés', value: dashboardData.participants?.approved || 0, icon: CheckCircleIcon },
        { label: 'Payés', value: dashboardData.participants?.paid || 0, icon: CheckCircleIcon },
      ],
      buttonText:'Gérer mes participants'
    },
    getZoneCardProps(),
    {
      title: 'Signaler un Problème',
      description: 'Contactez le support pour toute question ou problème.',
      icon: FlagIcon,
      color: 'text-red-500',
      href: '/je/reports',
      buttonText:'Réclamer'
    },
  ] : [];

  return (
    <JeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
            <p className="text-muted-foreground mt-1">Accès rapide aux sections clés de votre espace.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionCards.map((card) => (
              <ActionCard key={card.title} {...card} />
            ))}
          </div>
        )}
      </div>
    </JeLayout>
  );
}