      'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ContactFormProps {}

export default function ContactForm({}: ContactFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted');
  };

  return (
    <section className="mb-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Envoyez-nous un message</h2>
          <p className="text-xl text-muted-foreground">
            Nous vous répondrons dans les plus brefs délais
          </p>
        </div>

        <Card className="bg-card text-foreground border-border">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground placeholder-muted-foreground"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground placeholder-muted-foreground"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground placeholder-muted-foreground"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground placeholder-muted-foreground"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="inscription">
                    Question sur l'inscription
                  </option>
                  <option value="technique">Problème technique</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="media">Médias et presse</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-vertical bg-background text-foreground placeholder-muted-foreground"
                  placeholder="Écrivez votre message ici..."
                />
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/80 px-8 py-3 text-primary-foreground"
                >
                  Envoyer le message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}