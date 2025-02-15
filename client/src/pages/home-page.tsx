import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import ProjectMap from "@/components/project-map";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

const categories = [
  "All",
  "Community Garden",
  "Clean-up Drive",
  "Education",
  "Infrastructure",
  "Social Services",
];

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      category === "All" || project.category === category;
    const matchesSearch =
      search === "" ||
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen">
      <div className="w-[400px] border-r p-6 overflow-y-auto">
      <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div>Loading projects...</div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>

        <div className="flex-1" style={{ height: 'calc(100vh - 4rem)' }}>
        <ProjectMap projects={filteredProjects} />
      </div>
    </div>
  );
}
