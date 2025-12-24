'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiEdit, FiTrash2, FiEye, FiMail } from 'react-icons/fi';
import { JE } from '@/types/je.types';

interface JEListProps {
  jes: JE[];
  loading: boolean;
  handleViewJE: (je: JE) => void;
  handleEditJE: (je: JE) => void;
  handleSendCredentialsEmail: (jeId: number, jeName: string) => void;
  handleDeleteJE: (jeId: number, jeName: string) => void;
}

export function JEList({
  jes,
  loading,
  handleViewJE,
  handleEditJE,
  handleSendCredentialsEmail,
  handleDeleteJE,
}: JEListProps) {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jes.map((je) => (
        <Card key={je.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">{je.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{je.code}</Badge>
                  <Badge 
                    variant={je.user.status === 'APPROVED' ? 'default' : 'secondary'}
                    className={
                      je.user.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-800 border-green-200 dark:border-green-800'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                    }
                  >
                    {je.user.status}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewJE(je)}
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <FiEye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditJE(je)}
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <FiEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSendCredentialsEmail(je.id, je.name)}
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <FiMail className="h-4 w-4 mr-2" />
                  Send Credentials
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteJE(je.id, je.name)}
                  className="text-destructive hover:bg-destructive/20 hover:text-destructive-foreground"
                >
                  <FiTrash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{je.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-foreground">{je._count?.participants}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-muted-foreground">
                  {new Date(je.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
