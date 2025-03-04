import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Project, Comment } from "@shared/schema";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

type Location = {
  lat: number;
  lng: number;
};
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ThumbsUp, ThumbsDown, Calendar, MapPin, Trash2, Banknote, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

export default function ProjectDetails() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const projectId = parseInt(params!.id);
  const [hasVoted, setHasVoted] = useState(false);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/projects/${projectId}/comments`],
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: {
      content: "",
      projectId,
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; projectId: number }) => {
      const res = await apiRequest(
        "POST",
        `/api/projects/${projectId}/comments`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}/comments`],
      });
      form.reset();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (value: number) => {
      await apiRequest("POST", `/api/projects/${projectId}/vote`, { value });
    },
    onSuccess: () => {
      setHasVoted(true);
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Vote failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!project) return null;

  const handleContribute = () => {
    toast({
      title: "Coming Soon",
      description: "Online donation feature will be available soon!",
    });
  };

  const handleVolunteer = () => {
    toast({
      title: "Thanks for your interest!",
      description: "The project owner will be notified of your interest to volunteer.",
    });
  };

  const isOwner = user?.id === project.userId;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {project.image && (
            <img
              src={project.image}
              alt={project.title}
              className="w-full rounded-lg aspect-video object-cover"
            />
          )}

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            {isOwner && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this project?")) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

            <p className="text-muted-foreground whitespace-pre-wrap">
            {project.description}
            </p>

            {(project.donationRequirement || project.volunteerRequirement) && (
              <div className="border rounded-lg p-6 bg-muted/50 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 pointer-events-none" />
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 relative">
                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-sm">
                Project Requirements
                </span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 relative">
                {project.donationRequirement > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                      <Banknote className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Donation Needed</h3>
                    </div>
                    <p className="text-3xl font-bold text-primary mb-4">
                      {formatCurrency(project.donationRequirement)}
                    </p>
                    <Button onClick={handleContribute} className="w-full" variant="default">
                      Contribute Now
                    </Button>
                    </CardContent>
                  </Card>
                  </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-primary" />
                      Make a Donation
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                      <p className="text-lg font-medium">Online donation feature coming soon!</p>
                      <p className="text-muted-foreground mt-4">
                      For now, please contact the project owner directly to contribute.
                      </p>
                    </div>
                    </DialogContent>
                </Dialog>
                )}

                  {project.volunteerRequirement > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Volunteers Needed</h3>
                      </div>
                      <p className="text-3xl font-bold text-primary mb-4">
                        {project.volunteerRequirement} {project.volunteerRequirement === 1 ? 'Volunteer' : 'Volunteers'}
                      </p>
                      <Button onClick={handleVolunteer} className="w-full" variant="default">
                        Volunteer Now
                      </Button>
                      </CardContent>
                    </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Volunteer for this Project
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                      <p className="text-lg font-medium">Thanks for your interest in volunteering!</p>
                      <p className="text-muted-foreground mt-4">
                      The project owner will be notified of your interest to help.
                      </p>
                    </div>
                    </DialogContent>
                </Dialog>
                )}
              </div>
              </div>
            )}

            <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => commentMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={commentMutation.isPending}
                >
                  Post Comment
                </Button>
              </form>
            </Form>

            <div className="space-y-4 mt-6">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      User #{comment.userId} • {formatDate(comment.createdAt)}
                    </p>
                    <p>{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => voteMutation.mutate(1)}
                    disabled={hasVoted}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => voteMutation.mutate(-1)}
                    disabled={hasVoted}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-2xl font-bold">{project.votes}</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Created {formatDate(project.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                  {(project.location as Location).lat.toFixed(6)},{" "}
                  {(project.location as Location).lng.toFixed(6)}
                  </span>
                </div>

                {project.donationRequirement > 0 && (
                  <div className="flex items-start gap-2 border-t pt-4">
                  <Banknote className="h-4 w-4 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold">Donation Requirement</h3>
                    <p className="text-sm text-muted-foreground">
                    {formatCurrency(project.donationRequirement)}
                    </p>
                  </div>
                  </div>
                )}

                {project.volunteerRequirement > 0 && (
                  <div className="flex items-start gap-2 border-t pt-4">
                  <Users className="h-4 w-4 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold">Volunteer Requirement</h3>
                    <p className="text-sm text-muted-foreground">
                    {project.volunteerRequirement} {project.volunteerRequirement === 1 ? 'volunteer' : 'volunteers'} needed
                    </p>
                  </div>
                  </div>
                )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}