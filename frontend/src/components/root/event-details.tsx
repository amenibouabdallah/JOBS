'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { activityTypeService } from '@/lib/services/activity-type.service';
import { ActivityType } from '@/types/activity-type.types';

interface EventDetailsProps {}

export default function EventDetails({}: EventDetailsProps) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const data = await activityTypeService.list();
        setActivityTypes(data);
      } catch (error) {
        console.error('Failed to fetch activity types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityTypes();
  }, []);

  const day1Activities = activityTypes.filter(type => type.day === 'J_1');
  const day2Activities = activityTypes.filter(type => type.day === 'J_2');

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Aperçu du programme
          </h2>
          <p className="text-xl text-muted-foreground">
            Deux jours intenses pour maximiser votre potentiel entrepreneurial
          </p>
        </div>

        {/* Location and Date Card */}
        <Card className="mb-16 overflow-hidden bg-red-700 border-border">
          <CardContent>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 text-white p-6 flex flex-col justify-center items-center text-center">
                <FaCalendarAlt className="w-12 h-12 mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">Dates</h3>
                <p className="text-xl font-semibold">7 - 8 Février 2026</p>
                
                <div className="my-6 w-16 h-1 bg-white/30 rounded-full"></div>
                
                <FaMapMarkerAlt className="w-12 h-12 mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">Lieu</h3>
                <p className="text-xl font-semibold">Diar Lemdina</p>
                <p className="text-sm opacity-90 mt-1">Hammamet, Tunisie</p>
              </div>
              <div className="md:w-2/3 h-68 md:h-auto relative min-h-[300px]">
                <iframe 
                  src="https://maps.google.com/maps?q=36.366463,10.5328695&hl=fr&z=15&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((day) => {
            const isDay1 = day === 1;
            const activities = isDay1 ? day1Activities : day2Activities;

            return (
              <Card key={day} className="bg-card border-border h-full">
                <CardHeader className={`border-b border-border pb-4`}>
                  <CardTitle className={`flex items-center text-2xl "text-red-700 dark:text-red-400"`}>
                    <span className={`bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3`}>
                      {day}
                    </span>
                    Jour {day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-md"></div>
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {activities.map((type) => (
                        <Badge 
                          key={type.id} 
                          variant="outline" 
                          className={`text-base py-2 px-4 "border-red-200 bg-red-700 text-red-100 hover:bg-red-100"`}
                        >
                          {type.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Programme à venir</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
