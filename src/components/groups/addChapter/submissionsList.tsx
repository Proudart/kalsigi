"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { useToast } from "../../ui/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  Book,
  Hash,
  FileText,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChapterSubmission {
  series_url: any;
  series_url_code: any;
  id: string;
  series_id: string;
  series_title: string;
  chapter_number: string;
  chapter_title?: string;
  volume_number?: string;
  release_notes?: string;
  status: "pending" | "approved" | "rejected";
  page_count: number;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  group_name?: string;
  approved_chapter_id?: string;
}

interface ChapterSubmissionsListProps {
  groupId: string;
}

export default function ChapterSubmissionsList({ groupId }: ChapterSubmissionsListProps) {
  const [submissions, setSubmissions] = useState<ChapterSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ChapterSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [groupId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/groups/chapters/submissions?groupId=${groupId}`);
      if (!response.ok) throw new Error("Failed to fetch chapter submissions");
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Error fetching chapter submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load chapter submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background-100">
        <CardHeader>
          <CardTitle>Your Chapter Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-text-600">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-background-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Chapter Submissions</span>
            <Badge variant="outline">{submissions.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-600">No chapter submissions yet.</p>
              <p className="text-sm text-text-500 mt-1">
                Submit your first chapter to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-background-200 rounded-lg p-4 hover:bg-background-200 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(submission.status)}
                        <h3 className="font-semibold text-lg truncate">
                          {submission.series_title}
                        </h3>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
                        <div className="flex items-center space-x-1 text-primary-600">
                          <Hash className="w-3 h-3" />
                          <span>Chapter {submission.chapter_number}</span>
                        </div>
                        {submission.volume_number && (
                          <div className="flex items-center space-x-1 text-text-500">
                            <Book className="w-3 h-3" />
                            <span>Vol. {submission.volume_number}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-text-500">
                          <FileText className="w-3 h-3" />
                          <span>{submission.page_count} pages</span>
                        </div>
                      </div>
                      
                      {submission.chapter_title && (
                        <p className="text-sm text-text-600 mb-2 font-medium truncate">
                          {submission.chapter_title}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 text-xs text-text-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      
                      {submission.approved_chapter_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full sm:w-auto"
                        >
                          <a
                            href={`/series/${submission.series_url}-${submission.series_url_code}/chapter-${submission.chapter_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Read
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {submission.review_notes && (
                    <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                      <p className="text-sm">
                        <span className="font-medium text-red-800">Review Notes:</span> {submission.review_notes}
                      </p>
                      {submission.reviewed_at && (
                        <p className="text-xs text-red-600 mt-1">
                          Reviewed {formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-background-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background-100">
            <CardHeader className="border-b border-background-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(selectedSubmission.status)}
                  <span className="truncate">{selectedSubmission.series_title} - Ch. {selectedSubmission.chapter_number}</span>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </Badge>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Series Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Series:</span> {selectedSubmission.series_title}
                      </div>
                      <div>
                        <span className="font-medium">Chapter:</span> {selectedSubmission.chapter_number}
                      </div>
                      {selectedSubmission.volume_number && (
                        <div>
                          <span className="font-medium">Volume:</span> {selectedSubmission.volume_number}
                        </div>
                      )}
                      {selectedSubmission.chapter_title && (
                        <div>
                          <span className="font-medium">Title:</span> {selectedSubmission.chapter_title}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Pages:</span> {selectedSubmission.page_count}
                      </div>
                    </div>
                  </div>
                  
                  {selectedSubmission.release_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Release Notes</h4>
                      <p className="text-sm text-text-700 leading-relaxed">
                        {selectedSubmission.release_notes}
                      </p>
                    </div>
                  )}
                  
                  {selectedSubmission.review_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Review Notes</h4>
                      <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                        <p className="text-sm text-red-800">{selectedSubmission.review_notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Status:</span> {selectedSubmission.status}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>{" "}
                      {formatDistanceToNow(new Date(selectedSubmission.submitted_at), { addSuffix: true })}
                    </div>
                    {selectedSubmission.reviewed_at && selectedSubmission.status !== "pending" && (
                      <div>
                        <span className="font-medium">
                          {selectedSubmission.status === "approved" ? "Approved" : "Reviewed"}:
                        </span>{" "}
                        {formatDistanceToNow(new Date(selectedSubmission.reviewed_at), { addSuffix: true })}
                      </div>
                    )}
                    {selectedSubmission.group_name && (
                      <div>
                        <span className="font-medium">Group:</span> {selectedSubmission.group_name}
                      </div>
                    )}
                  </div>
                  
                  {selectedSubmission.approved_chapter_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a 
                        href={`/series/${selectedSubmission.series_url}-${selectedSubmission.series_url_code}/chapter-${selectedSubmission.chapter_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read Chapter
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}