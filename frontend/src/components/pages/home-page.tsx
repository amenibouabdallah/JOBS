'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface JobInfo {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  subscriptionDeadline?: string;
  payDeadline: string;
  firstPayDeadline: string;
  PayAmount?: number;
  firstPayAmount?: number;
  secondPayAmount?: number;
  nbrParticipants: number;
}

interface HomePageProps {}

const HomePage = ({}: HomePageProps) => {
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [animationFinished, setAnimationFinished] = useState(true); // Skip animation for now

  useEffect(() => {
    // TODO: Fetch job info from API
    // For now, using mock data
    setJobInfo({
      id: 1,
      title: "Jobs 2026",
      description: "Le grand séminaire des Junior Entreprises",
      startDate: "2026-05-15",
      subscriptionDeadline: "2026-04-15",
      payDeadline: "2026-05-01",
      firstPayDeadline: "2026-04-20",
      PayAmount: 350,
      firstPayAmount: 200,
      secondPayAmount: 150,
      nbrParticipants: 0,
    });
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non définie";
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? "Date non définie" : parsedDate.toLocaleDateString('fr-FR');
  };

  return (
    <MainLayout>
      <div>
        {/* Logo Section */}
        <div className="text-center md:mt-16 mb-12">
          <img
            src="/assets/jobs2025_text.svg"
            alt="JOBS Logo"
            className="mx-auto w-80 md:w-[500px] lg:w-[600px]"
          />
          <p className="mt-4 text-xl md:text-lg text-black font-medium max-w-4xl mx-auto">
            JOBS est le séminaire annuel des Junior entreprises en Tunisie organisé par la Confédération Tunisienne des Junior Entreprises.
          </p>
          <p className="mt-4 text-lg md:text-base text-gray-600 max-w-3xl mx-auto">
            C'est également une occasion idéale pour les adhérents du réseau de se réunir et de s'unir dans une atmosphère propice et solidaire.
          </p>
        </div>

        {/* Hero Images Carousel Placeholder */}
        <div className="mt-12">
          <h2 className="text-lg md:text-xl font-bold text-center mb-8 text-red">
            Explorez nos points forts
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <img src="/assets/jobs1.jpg" alt="Jobs highlight 1" className="rounded-lg shadow-md" />
              <img src="/assets/jobs2.jpg" alt="Jobs highlight 2" className="rounded-lg shadow-md" />
              <img src="/assets/jobs3.jpg" alt="Jobs highlight 3" className="rounded-lg shadow-md" />
            </div>
          </div>
        </div>

        {/* Sign-Up Button */}
        <div className="flex justify-center mt-12">
          <Button className="bg-red hover:bg-black text-white py-3 px-8 text-lg transition duration-300">
            <Link href="/signup">S'inscrire</Link>
          </Button>
        </div>

        {/* Event Details Section */}
        {jobInfo && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-lg md:text-xl font-bold text-center text-grayDark mb-6">
              Détails de l'événement
            </h2>
            <div className="space-y-3 text-center">
              <div className="flex justify-between items-center">
                <span className="font-medium">Date de lancement:</span>
                <span>{formatDate(jobInfo.startDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Deadline de l'inscription:</span>
                <span>{formatDate(jobInfo.subscriptionDeadline || '')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Deadline du paiement total:</span>
                <span>{formatDate(jobInfo.payDeadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Deadline du paiement par tranches:</span>
                <span>{formatDate(jobInfo.firstPayDeadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Montant total:</span>
                <span>{jobInfo.PayAmount} DT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Participants inscrits:</span>
                <span>{jobInfo.nbrParticipants}</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Section Placeholder */}
        <div className="mt-16">
          <h2 className="text-lg md:text-xl font-bold text-center text-red mb-6">
            Découvrez notre vidéo
          </h2>
          <div className="w-full max-w-4xl mx-auto bg-gray-200 rounded-lg shadow-lg h-64 flex items-center justify-center">
            <p className="text-gray-500">Vidéo promotionnelle (à ajouter)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 py-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 Jobs - Confédération Tunisienne des Junior Entreprises</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
