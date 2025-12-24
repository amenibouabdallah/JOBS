"use client";

import React from "react";
import { TeamMemberCard } from "../root/TeamMember";
import ContactForm from "../forms/contact-form";

interface ContactPageProps {}

export default function ContactPage({}: ContactPageProps) {
  const teamMembers = [
    {
      name: "Adem JAOUADI",
      role: "Responsable Systèmes d'Information",
      image: "/assets/Photocontact/Adem.png",
      phone: "95395172",
      email: "adem.jaouadi@jetunisie.com",
    },
    {
      name: "Ayoub TABANI",
      role: "Président",
      phone: "95395172",
      image: "/assets/Photocontact/Ayoub.png",
      email: "ayoub.tabani@jetunisie.com",
    },
    {
      name: "Firas LAOUINI",
      role: "Responsable Événementiel",
      phone: "95395172",
      image: "/assets/Photocontact/Firas.png",
      email: "firas.laouini@jetunisie.com",
    },
    {
      name: "Houssem Hkiri",
      role: "Trésorier",
      phone: "95395172",
      image: "/assets/Photocontact/Houssem.png",
      email: "houssem.hkiri@jetunisie.com",
    },
  ];

  return (
  <div className="min-h-screen py-16 mt-12 bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contactez-nous
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Une question ? Une suggestion ? Notre équipe est là pour vous
            accompagner dans votre parcours <span className="font-bold text-red-700">JOBS 2K26</span>.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={index}
                name={member.name}
                role={member.role}
                phone={member.phone}
                image={member.image}
                email={member.email}
              />
            ))}
          </div>
        </div>
      </section>
      {/* Contact Form Section */}
      <ContactForm />
    </div>
  );
}
