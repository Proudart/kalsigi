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
  User,
  Tag,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SeriesSubmission {
  id: string;
  title: string;
  alternativeTitles?: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  type: string;
  genres: string[]; // API returns array
  author?: string;
  artist?: string;
  releaseYear?: string;
  coverImageUrl?: string;
  sourceUrl?: string;
  submittedAt: string; // API returns camelCase
  reviewedAt?: string; // API returns camelCase
  reviewNotes?: string; // API returns camelCase (rejection reason)
  groupName?: string;
  approvedSeriesId?: string;
}

interface SubmissionsListProps {
  groupId: string;
}

export default function SubmissionsList({ groupId }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<SeriesSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SeriesSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [groupId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/groups/series/submissions?groupId=${groupId}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");
      
      const data = await response.json();
      // API returns array directly, not wrapped in { submissions: [] }
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
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
      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Series Submissions</span>
            <Badge variant="outline">{submissions.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-600">No submissions yet.</p>
              <p className="text-sm text-text-500 mt-1">
                Submit your first series to get started!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 hover:bg-background-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(submission.status)}
                          <h3 className="font-semibold text-lg">{submission.title}</h3>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>
                        
                        {submission.alternativeTitles && (
                          <p className="text-sm text-text-500 mb-1">
                            Alt: {submission.alternativeTitles}
                          </p>
                        )}
                        
                        <p className="text-sm text-text-600 mb-3 line-clamp-2">
                          {submission.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-text-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{submission.type}</span>
                          </div>
                          
                          {submission.author && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{submission.author}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {submission.genres.slice(0, 3).map((genre, index) => (
                            <Badge key={`${genre}-${index}`} variant="outline" className="text-xs">
                              {genre.trim()}
                            </Badge>
                          ))}
                          {submission.genres.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{submission.genres.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {submission.coverImageUrl && (
                          <img
                            src={submission.coverImageUrl}
                            alt={submission.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        
                        {submission.sourceUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={submission.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Source
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {submission.reviewNotes && (
                      <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                        <p className="text-sm">
                          <span className="font-medium text-red-800">Review Notes:</span> {submission.reviewNotes}
                        </p>
                        {submission.reviewedAt && (
                          <p className="text-xs text-red-600 mt-1">
                            Reviewed {formatDistanceToNow(new Date(submission.reviewedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detailed View Modal */}
      {selectedSubmission && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 md:inset-8 bg-background border rounded-lg shadow-lg overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(selectedSubmission.status)}
                  <span>{selectedSubmission.title}</span>
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
            
            <CardContent className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {selectedSubmission.alternativeTitles && (
                    <div>
                      <h4 className="font-medium mb-2">Alternative Titles</h4>
                      <p className="text-sm text-text-700">
                        {selectedSubmission.alternativeTitles}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-text-700 leading-relaxed">
                      {selectedSubmission.description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.genres.map((genre, index) => (
                        <Badge key={`${genre}-${index}`} variant="outline">
                          {genre.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {selectedSubmission.reviewNotes && (
                    <div>
                      <h4 className="font-medium mb-2">Review Notes</h4>
                      <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                        <p className="text-sm text-red-800">{selectedSubmission.reviewNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {selectedSubmission.coverImageUrl && (
                    <div>
                      <h4 className="font-medium mb-2">Cover Image</h4>
                      <img
                        src={selectedSubmission.coverImageUrl}
                        alt={selectedSubmission.title}
                        className="w-full max-w-48 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedSubmission.type}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedSubmission.status}
                    </div>
                    {selectedSubmission.author && (
                      <div>
                        <span className="font-medium">Author:</span> {selectedSubmission.author}
                      </div>
                    )}
                    {selectedSubmission.artist && (
                      <div>
                        <span className="font-medium">Artist:</span> {selectedSubmission.artist}
                      </div>
                    )}
                    {selectedSubmission.releaseYear && (
                      <div>
                        <span className="font-medium">Release Year:</span> {selectedSubmission.releaseYear}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Submitted:</span>{" "}
                      {formatDistanceToNow(new Date(selectedSubmission.submittedAt), { addSuffix: true })}
                    </div>
                    {selectedSubmission.reviewedAt && selectedSubmission.status !== "pending" && (
                      <div>
                        <span className="font-medium">
                          {selectedSubmission.status === "approved" ? "Approved" : "Reviewed"}:
                        </span>{" "}
                        {formatDistanceToNow(new Date(selectedSubmission.reviewedAt), { addSuffix: true })}
                      </div>
                    )}
                    {selectedSubmission.groupName && (
                      <div>
                        <span className="font-medium">Group:</span> {selectedSubmission.groupName}
                      </div>
                    )}
                    {selectedSubmission.approvedSeriesId && (
                      <div>
                        <span className="font-medium">Series ID:</span> {selectedSubmission.approvedSeriesId}
                      </div>
                    )}
                  </div>
                  
                  {selectedSubmission.sourceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a 
                        href={selectedSubmission.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Source
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}