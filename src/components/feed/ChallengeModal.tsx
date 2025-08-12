import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, X } from 'lucide-react';

interface Challenge {
  _id: string;
  challenge_title: string;
  description: string;
  hashtag: string;
  banner: string;
  status: string;
  number_of_participants: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChallengeModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ challenge, isOpen, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <DialogTitle className="text-xl font-bold text-primary">
                Challenge Details
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Banner Image */}
          {challenge.banner && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={challenge.banner}
                alt={challenge.challenge_title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Challenge Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {challenge.challenge_title}
          </h2>

          {/* Challenge Stats */}
          <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Started {formatDate(challenge.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{challenge.number_of_participants} participants</span>
            </div>
          </div>

          {/* Full Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              About This Challenge
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => {
                // Navigate to challenge hashtag using the dynamic hashtag from API
                window.location.href = `/feed?hashtag=${challenge.hashtag}`;
              }}
              className="bg-primary hover:bg-primary/90 px-8"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Open to all
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
