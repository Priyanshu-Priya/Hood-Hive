import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useEffect } from "react";

type Location = {
  lat: number;
  lng: number;
};

type Area = {
  coordinates: Location[];
  color: string;
};

type ProjectFormData = {
  title: string;
  description: string;
  category: string;
  location: Location;
  area?: Area;
  image: string;
};
import { Button } from "@/components/ui/button";
import LocationPicker from "@/components/location-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  "Community Garden",
  "Clean-up Drive",
  "Education",
  "Infrastructure",
  "Social Services",
];

export default function SubmitProject() {
  const [, setLocation] = useLocation();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: {  lat: 28.6139, lng: 77.2088 },
      area: undefined,
      image: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const res = await apiRequest("POST", "/api/projects", {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setLocation(`/projects/${data.id}`);
    },
  });

  useEffect(() => {
    // Get user's location for the form
    navigator.geolocation.getCurrentPosition((pos) => {
      form.setValue("location", {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, [form]);

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Submit a New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>Location and Area</FormLabel>
                  <FormControl>
                    <LocationPicker
                    value={field.value}
                    onChange={field.onChange}
                    area={form.getValues("area")}
                    onAreaChange={(area) => form.setValue("area", area)}
                    enableAreaSelection={true}
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
                />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                Submit Project
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}