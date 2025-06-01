// src/components/admin/ChapterApprovalInterface.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@//components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@//components/ui/tabs';
import { Button } from '@//components/ui/button';
import { Badge } from '@//components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@//components/ui/dialog';
import { Textarea } from '@//components/ui/textarea';
import { Input } from '@//components/ui/input';
import { Label } from '@//components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  Users,
  Calendar,
  Hash,
  MessageSquare
} from 'lucide-react';

interface ChapterSubmission {
  id: string;
  series_id: string;
  series_title: string;
  chapter_number: number;
  chapter_title: string;
  release_notes: string;
  page_count: number;
  start_image_url: string;
  end_image_url: string;
  submitted_at: string;
  approved_at?: string;
  review_notes?: string;
  group_name: string;
  group_slug: string;
  approved_chapter_id?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
}

export default function ChapterApprovalInterface() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingSubmissions, setPendingSubmissions] = useState<ChapterSubmission[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<ChapterSubmission[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ChapterSubmission | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/chapter/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch pending submissions
  const fetchPendingSubmissions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chapter/pending?page=${page}&limit=20`);
      const data = await response.json();
      if (data.success) {
        setPendingSubmissions(data.submissions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved submissions
  const fetchApprovedSubmissions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chapter/approved?page=${page}&limit=20`);
      const data = await response.json();
      if (data.success) {
        setApprovedSubmissions(data.submissions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching approved submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle submission review
  const handleReview = async () => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(`/api/admin/chapter/${selectedSubmission.id}/approve`, {
        method: 'POST ',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: reviewAction,
          reviewNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReviewDialog(false);
        setReviewNotes('');
        setSelectedSubmission(null);
        // Refresh data
        fetchStats();
        if (activeTab === 'pending') {
          fetchPendingSubmissions();
        } else {
          fetchApprovedSubmissions();
        }
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchPendingSubmissions();
  }, []);

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingSubmissions();
    } else if (activeTab === 'approved') {
      fetchApprovedSubmissions();
    }
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openReviewDialog = (submission: ChapterSubmission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission);
    setReviewAction(action);
    setReviewDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({stats.approved})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <Card key={submission.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {submission.series_title}
                              </h3>
                              <Badge variant="outline">
                                Chapter {submission.chapter_number}
                              </Badge>
                            </div>
                            
                            {submission.chapter_title && (
                              <p className="text-sm font-medium">
                                {submission.chapter_title}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {submission.group_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {submission.page_count} pages
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(submission.submitted_at)}
                              </span>
                            </div>
                            
                            {submission.release_notes && (
                              <p className="text-sm bg-muted p-2 rounded">
                                {submission.release_notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(submission, 'approve')}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(submission, 'reject')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {pendingSubmissions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending submissions
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {approvedSubmissions.map((submission) => (
                    <Card key={submission.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {submission.series_title}
                              </h3>
                              <Badge variant="outline">
                                Chapter {submission.chapter_number}
                              </Badge>
                              <Badge variant="secondary" className="text-green-600">
                                Approved
                              </Badge>
                            </div>
                          </div>
                          
                          {submission.chapter_title && (
                            <p className="text-sm font-medium">
                              {submission.chapter_title}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {submission.group_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {submission.page_count} pages
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Approved {submission.approved_at && formatDate(submission.approved_at)}
                            </span>
                          </div>
                          
                          {submission.review_notes && (
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-sm font-medium text-green-800">Review Notes:</p>
                              <p className="text-sm text-green-700">{submission.review_notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {approvedSubmissions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No approved submissions
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => {
                  const newPage = pagination.page - 1;
                  if (activeTab === 'pending') {
                    fetchPendingSubmissions(newPage);
                  } else {
                    fetchApprovedSubmissions(newPage);
                  }
                }}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                  const newPage = pagination.page + 1;
                  if (activeTab === 'pending') {
                    fetchPendingSubmissions(newPage);
                  } else {
                    fetchApprovedSubmissions(newPage);
                  }
                }}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Chapter Submission
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <>
                  {reviewAction === 'approve' 
                    ? 'This will create a new chapter and make it available to readers.'
                    : 'This will reject the submission and notify the scanlation group.'
                  }
                  <br />
                  <strong>{selectedSubmission.series_title}</strong> - Chapter {selectedSubmission.chapter_number}
                  {selectedSubmission.chapter_title && `: ${selectedSubmission.chapter_title}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="review-notes">Review Notes (Optional)</Label>
              <Textarea
                id="review-notes"
                placeholder={`Add any notes about this ${reviewAction}...`}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              className={reviewAction === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewAction === 'approve' ? 'Approve Chapter' : 'Reject Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}