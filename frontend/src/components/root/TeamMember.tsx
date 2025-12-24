"use-client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import { PhoneIcon } from "lucide-react";
interface TeamMemberCardProps {
  name: string;
  role: string;
  phone: string;
  image: string;
  email?: string;
}

export function TeamMemberCard({
  name,
  role,
  image,
  phone,
  email,
}: TeamMemberCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 bg-card text-foreground border-border">
      <CardContent className="p-6 text-center">
        <div className="relative mx-auto mb-4">
          <img
            src={image}
            alt={name}
            width={38}
            height={32}
            className="w-2/3 h-1/3 mx-auto rounded-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{role}</p>
        <div className="flex justify-center space-x-2">
          {phone && (
            <Button variant="outline" size="sm" asChild className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
              <a href={phone} target="_blank" rel="noopener noreferrer">
                <PhoneIcon className="w-4 h-4" />
              </a>
            </Button>
          )}
          {email && (
            <Button variant="outline" size="sm" asChild className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
              <a href={`mailto:${email}`}>
                <FaEnvelope className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}