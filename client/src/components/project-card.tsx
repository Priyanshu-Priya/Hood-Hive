import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, MapPin, ThumbsUp, Banknote, Users } from "lucide-react";

export default function ProjectCard({ project }: { project: Project }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date | string | { seconds: number; nanoseconds: number }) => {
    if (!date) return 'Invalid date';

    if (typeof date === 'object' && 'seconds' in date) {
      // Handle Firebase Timestamp
      return new Date(date.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      {project.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{project.title}</h3>
            <p className="text-sm text-muted-foreground">
              {project.description.substring(0, 100)}...
            </p>
          </div>
          <Badge variant="secondary">{project.category}</Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDate(project.createdAt)}
          </div>
          <div className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          {project.votes} votes
          </div>
          {project.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {project.location.lat.toFixed(2)}, {project.location.lng.toFixed(2)}
          </div>
          )}
        </div>

        {(project.donationRequirement > 0 || project.volunteerRequirement > 0) && (
          <div className="flex gap-4 mt-4 text-sm">
          {project.donationRequirement > 0 && (
            <div className="flex items-center gap-1 text-primary">
            <Banknote className="h-4 w-4" />
            {formatCurrency(project.donationRequirement)}
            </div>
          )}
          {project.volunteerRequirement > 0 && (
            <div className="flex items-center gap-1 text-primary">
            <Users className="h-4 w-4" />
            {project.volunteerRequirement} {project.volunteerRequirement === 1 ? 'volunteer' : 'volunteers'}
            </div>
          )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}