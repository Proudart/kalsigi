"use client";

import { useState, useEffect } from "react";
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
import { Plus, Upload, AlertCircle, Search, X, FileText } from "lucide-react";

const chapterSchema = z.object({
  series_id: z.string().uuid("Please select a series"),
  chapter_number: z.string().min(1, "Chapter number is required"),
  chapter_title: z.string().optional(),
  release_notes: z.string().optional(),
  chapter_pages: z.any().refine((files) => {
    return files && files.length > 0;
  }, "At least one page is required"),
  start_image: z.any().optional(),
  end_image: z.any().optional(),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface Series {
  id: string;
  title: string;
  type: string;
  status: string;
}

interface AddChapterFormProps {
  groupId: string;
  onSuccess?: () => void;
}

export default function AddChapterForm({ groupId, onSuccess }: AddChapterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [startImagePreview, setStartImagePreview] = useState<string | null>(null);
  const [endImagePreview, setEndImagePreview] = useState<string | null>(null);
  const [availableSeries, setAvailableSeries] = useState<Series[]>([]);
  const [seriesSearch, setSeriesSearch] = useState("");
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
  });

  const selectedSeriesId = watch("series_id");

  useEffect(() => {
    fetchAvailableSeries();
  }, [groupId]);

  const fetchAvailableSeries = async () => {
    setIsLoadingSeries(true);
    try {
      const response = await fetch(`/api/groups/series/available?groupId=${groupId}`);
      if (!response.ok) throw new Error("Failed to fetch series");
      
      const data = await response.json();
      setAvailableSeries(data.series || []);
    } catch (error) {
      console.error("Error fetching series:", error);
      toast({
        title: "Error",
        description: "Failed to load available series",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSeries(false);
    }
  };

  const handleStartImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("start_image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStartImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEndImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("end_image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEndImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB per file
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were skipped. Only images under 20MB are allowed.",
        variant: "destructive",
      });
    }

    setSelectedFiles(validFiles);
    setValue("chapter_pages", validFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setValue("chapter_pages", newFiles);
  };

  const filteredSeries = availableSeries.filter(series =>
    series.title.toLowerCase().includes(seriesSearch.toLowerCase())
  );

  const onSubmit = async (data: ChapterFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append("series_id", data.series_id);
      formData.append("chapter_number", data.chapter_number);
      if (data.chapter_title) {
        formData.append("chapter_title", data.chapter_title);
      }
      if (data.release_notes) {
        formData.append("release_notes", data.release_notes);
      }
      formData.append("group_id", groupId);

      // Add chapter pages
      selectedFiles.forEach((file, index) => {
        formData.append(`chapter_pages`, file);
        formData.append(`page_order_${index}`, index.toString());
      });

   

      const response = await fetch("/api/groups/chapters/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit chapter");
      }

      const result = await response.json();

      toast({
        title: "Chapter Submitted Successfully",
        description: "Your chapter submission is now pending review by administrators.",
      });

      // Reset form
      reset();
      setSelectedFiles([]);
      onSuccess?.();

    } catch (error) {
      console.error("Error submitting chapter:", error);
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Submit New Chapter
        </CardTitle>
        <p className="text-sm text-text-600">
          Upload a new chapter for an existing series. Your group will be credited as the translator.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Series <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search for a series..."
                      value={seriesSearch}
                      onChange={(e) => setSeriesSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select onValueChange={(value) => setValue("series_id", value)}>
                    <SelectTrigger className={errors.series_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a series" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSeries ? (
                        <SelectItem value="loading" disabled>Loading series...</SelectItem>
                      ) : filteredSeries.length === 0 ? (
                        <SelectItem value="no-results" disabled>
                          {seriesSearch ? "No series found" : "No available series"}
                        </SelectItem>
                      ) : (
                        filteredSeries.map((series) => (
                          <SelectItem key={series.id} value={series.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{series.title}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {series.type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {errors.series_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.series_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Chapter Number <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("chapter_number")}
                  placeholder="e.g., 1, 1.5, 001"
                  className={errors.chapter_number ? "border-red-500" : ""}
                />
                {errors.chapter_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.chapter_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chapter Title</label>
                <Input
                  {...register("chapter_title")}
                  placeholder="Optional chapter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Release Notes</label>
                <Textarea
                  {...register("release_notes")}
                  placeholder="Any notes for readers (optional)"
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {startImagePreview ? (
                    <div className="relative">
                      <img
                        src={startImagePreview}
                        alt="Start image preview"
                        className="mx-auto max-h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setStartImagePreview(null);
                          setValue("start_image", undefined);
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
                          onChange={handleStartImageChange}
                          className="sr-only"
                          id="start-image-upload"
                        />
                        <label
                          htmlFor="start-image-upload"
                          className="cursor-pointer text-sm text-primary-600 hover:text-primary-500"
                        >
                          Upload start/intro image
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Group branding, intro page
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {endImagePreview ? (
                    <div className="relative">
                      <img
                        src={endImagePreview}
                        alt="End image preview"
                        className="mx-auto max-h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setEndImagePreview(null);
                          setValue("end_image", undefined);
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
                          onChange={handleEndImageChange}
                          className="sr-only"
                          id="end-image-upload"
                        />
                        <label
                          htmlFor="end-image-upload"
                          className="cursor-pointer text-sm text-primary-600 hover:text-primary-500"
                        >
                          Upload end/credits image
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Credits, announcements
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Chapter Pages <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                      id="pages-upload"
                    />
                    <label
                      htmlFor="pages-upload"
                      className="cursor-pointer text-sm text-primary-600 hover:text-primary-500"
                    >
                      Click to upload chapter pages
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select multiple images (PNG, JPG, GIF) up to 20MB each
                  </p>
                </div>
                {errors.chapter_pages && (
                  <p className="text-red-500 text-sm mt-1">{errors.chapter_pages.message as string}</p>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Selected Pages ({selectedFiles.length})
                  </label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-background-50 p-2 rounded">
                        <div className="flex items-center space-x-2 flex-1">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Page {index + 1}</span>
                          <span className="text-xs text-gray-500 truncate">
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Pages will be displayed in the order shown above
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Chapter Submission Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>All chapter submissions are reviewed before publication</li>
                  <li>Upload pages in the correct reading order</li>
                  <li>Ensure high quality, readable images</li>
                  <li>Maximum 20MB per page, unlimited pages per chapter</li>
                  <li>Your group will be credited as the translator/scanlator</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedFiles([]);
                setSeriesSearch("");
              }}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0}
              className="px-6"
            >
              {isSubmitting ? "Uploading..." : `Submit Chapter (${selectedFiles.length} pages)`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}