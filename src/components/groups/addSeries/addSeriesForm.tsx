"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { useToast } from "../../ui/use-toast";
import { Plus, X, Upload, AlertCircle } from "lucide-react";

const seriesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  alternative_titles: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["ongoing", "completed", "hiatus", "cancelled"]),
  type: z.enum(["manga", "manhwa", "manhua", "webtoon", "novel"]),
  genres: z.string().min(1, "At least one genre is required"),
  author: z.string().optional(),
  artist: z.string().optional(),
  release_year: z.string().optional(),
  cover_image: z.any().optional(),
  source_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SeriesFormData = z.infer<typeof seriesSchema>;

const GENRES = [
  "Action", "Adult", "Adventure", "Comedy", "Doujinshi", "Drama", "Ecchi",
  "Fantasy", "Gender Bender", "Harem", "Historical", "Horror", "Josei",
  "Martial Arts", "Mature", "Mecha", "Mystery", "One Shot", "Psychological",
  "Romance", "School Life", "Sci-fi", "Seinen", "Shoujo", "Shoujo Ai",
  "Shounen", "Shounen Ai", "Slice of Life", "Sports", "Supernatural",
  "Tragedy", "Webtoons", "Yaoi"
];

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "Hiatus" },
  { value: "cancelled", label: "Cancelled" }
];

const TYPE_OPTIONS = [
  { value: "manga", label: "Manga" },
  { value: "manhwa", label: "Manhwa" },
  { value: "manhua", label: "Manhua" },
  { value: "webtoon", label: "Webtoon" },
  { value: "novel", label: "Novel" }
];

interface AddSeriesFormProps {
  groupId: string;
  onSuccess?: () => void;
}

export default function AddSeriesForm({ groupId, onSuccess }: AddSeriesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      genres: ""
    }
  });

  const handleGenreToggle = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    
    setSelectedGenres(newGenres);
    setValue("genres", newGenres.join(", "));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("cover_image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SeriesFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      formData.append("title", data.title);
      if (data.alternative_titles) {
        formData.append("alternative_titles", data.alternative_titles);
      }
      formData.append("description", data.description);
      formData.append("status", data.status);
      formData.append("type", data.type);
      formData.append("genres", data.genres);
      if (data.author) {
        formData.append("author", data.author);
      }
      if (data.artist) {
        formData.append("artist", data.artist);
      }
      if (data.release_year) {
        formData.append("release_year", data.release_year);
      }
      if (data.source_url) {
        formData.append("source_url", data.source_url);
      }
      if (data.cover_image instanceof File) {
        formData.append("cover_image", data.cover_image);
      }
      
      formData.append("group_id", groupId);

      const response = await fetch("/api/groups/series/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit series");
      }

      toast({
        title: "Series Submitted",
        description: "Your series submission is now pending review by administrators.",
      });

      reset();
      setSelectedGenres([]);
      setCoverPreview(null);
      onSuccess?.();

    } catch (error) {
      console.error("Error submitting series:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Plus className="w-5 h-5" />
          Submit New Series
        </CardTitle>
        <p className="text-sm text-text-600">
          Submit a new series for review. Your group will be credited as the original submitter.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("title")}
                  placeholder="Enter series title"
                  className={`h-11 ${errors.title ? "border-red-500" : ""}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Alternative Titles
                </label>
                <Input
                  {...register("alternative_titles")}
                  placeholder="Alternative titles (separated by commas)"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={(value) => setValue("status", value as any)}>
                    <SelectTrigger className={`h-11 ${errors.status ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-background-100">
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={(value) => setValue("type", value as any)}>
                    <SelectTrigger className={`h-11 ${errors.type ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background-100">
                      {TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <Input
                    {...register("author")}
                    placeholder="Author name"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Artist</label>
                  <Input
                    {...register("artist")}
                    placeholder="Artist name"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Release Year</label>
                  <Input
                    {...register("release_year")}
                    placeholder="e.g., 2023"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Source URL</label>
                  <Input
                    {...register("source_url")}
                    placeholder="https://example.com"
                    type="url"
                    className="h-11"
                  />
                  {errors.source_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.source_url.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-background-300 rounded-lg p-4 text-center">
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="mx-auto max-h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setCoverPreview(null);
                          setValue("cover_image", undefined);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                          id="cover-upload"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="cursor-pointer text-sm text-primary-600 hover:text-primary-500"
                        >
                          Click to upload cover image
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Genres <span className="text-red-500">*</span>
                </label>
                <div className="max-h-32 overflow-y-auto border border-background-300 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {GENRES.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`genre-${genre}`}
                          checked={selectedGenres.includes(genre)}
                          onChange={() => handleGenreToggle(genre)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor={`genre-${genre}`} className="text-xs">
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedGenres.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="text-xs"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.genres && (
                  <p className="text-red-500 text-sm mt-1">{errors.genres.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register("description")}
              placeholder="Enter series description..."
              rows={4}
              className={`resize-none ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Submission Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>All submissions are reviewed by administrators</li>
                  <li>Your group will be credited as the submitter</li>
                  <li>Ensure all information is accurate</li>
                  <li>Duplicate submissions will be rejected</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedGenres([]);
                setCoverPreview(null);
              }}
              className="h-11"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6"
            >
              {isSubmitting ? "Submitting..." : "Submit Series"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}