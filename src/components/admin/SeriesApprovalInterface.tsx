'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@//components/ui/card';
import { Button } from '@//components/ui/button';
import { Badge } from '@//components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@//components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@//components/ui/tabs';
import { Input } from '@//components/ui/input';
import { Textarea } from '@//components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@//components/ui/dialog';
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Search,
  Users,
  Calendar,
  ExternalLink,
  MessageSquare,
  Edit
} from 'lucide-react';
import { useToast } from '@//components/ui/use-toast';
import { Alert, AlertDescription } from '@//components/ui/alert';

interface PendingSubmission {
  id: string;
  title: string;
  alternative_titles?: string;
  description?: string;
  status: string;
  type: string;
  genres?: string;
  author?: string;
  artist?: string;
  release_year?: string;
  source_url?: string;
  cover_image_url?: string;
  created_at: string;
  groupName?: string;
  groupSlug?: string;
}

interface ApprovedSeries {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  author?: string;
  artist?: string;
  status: string;
  type: string[];
  total_chapters: number;
  total_views: number;
  created_at: string;
  groupName?: string;
  groupSlug?: string;
}

interface SeriesStats {
  totalSeries: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  recentSeries: number;
  recentSubmissions: number;
  approvalRate: number;
}

export default function SeriesManagementInterface() {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [approvedSeries, setApprovedSeries] = useState<ApprovedSeries[]>([]);
  const [stats, setStats] = useState<SeriesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionDialog, setRejectionDialog] = useState<{ open: boolean; submissionId: string; title: string }>({
    open: false,
    submissionId: '',
    title: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingResponse, approvedResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/series/pending'),
        fetch('/api/admin/series/approved'),
        fetch('/api/admin/series/stats')
      ]);

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingSubmissions(pendingData.submissions || []);
      }

      if (approvedResponse.ok) {
        const approvedData = await approvedResponse.json();
        setApprovedSeries(approvedData.series || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch series data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/series/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 'current-admin-id', // You'll need to get this from your auth system
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Submission approved',
          description: `"${result.series.title}" has been approved and added to the platform.`,
        });
        fetchData();
      } else {
        throw new Error('Failed to approve submission');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve submission',
        variant: 'destructive',
      });
    }
  };

  const openRejectionDialog = (submissionId: string, title: string) => {
    setRejectionDialog({ open: true, submissionId, title });
    setRejectionReason('');
  };

  const rejectSubmission = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/series/${rejectionDialog.submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason,
          adminId: 'current-admin-id', // You'll need to get this from your auth system
        }),
      });

      if (response.ok) {
        toast({
          title: 'Submission rejected',
          description: `"${rejectionDialog.title}" has been rejected.`,
        });
        setRejectionDialog({ open: false, submissionId: '', title: '' });
        fetchData();
      } else {
        throw new Error('Failed to reject submission');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject submission',
        variant: 'destructive',
      });
    }
  };

  const SubmissionCard = ({ submission }: { submission: PendingSubmission }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex space-x-4">
            {submission.cover_image_url && (
              <Avatar className="w-16 h-20 rounded-md">
                <AvatarImage src={submission.cover_image_url} alt={submission.title} className="object-cover" />
                <AvatarFallback className="rounded-md">{submission.title.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <CardTitle className="text-lg">{submission.title}</CardTitle>
              <CardDescription>
                Submitted by {submission.groupName || 'Unknown Group'} • {new Date(submission.created_at).toLocaleDateString()}
              </CardDescription>
              {submission.alternative_titles && (
                <p className="text-sm text-muted-foreground mt-1">
                  Alt: {submission.alternative_titles}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="secondary">Pending</Badge>
            <Badge variant="outline">{submission.type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submission.description && (
            <div>
              <h4 className="font-semibold text-sm">Description</h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{submission.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {submission.author && (
              <div>
                <span className="font-semibold">Author:</span> {submission.author}
              </div>
            )}
            {submission.artist && (
              <div>
                <span className="font-semibold">Artist:</span> {submission.artist}
              </div>
            )}
            {submission.status && (
              <div>
                <span className="font-semibold">Status:</span> {submission.status}
              </div>
            )}
            {submission.release_year && (
              <div>
                <span className="font-semibold">Release Year:</span> {submission.release_year}
              </div>
            )}
            {submission.genres && (
              <div className="col-span-2">
                <span className="font-semibold">Genres:</span> {submission.genres}
              </div>
            )}
            {submission.source_url && (
              <div className="col-span-2">
                <span className="font-semibold">Source:</span>{' '}
                <a href={submission.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                  {submission.source_url}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
          </div>

          {submission.groupName && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Submitted by {submission.groupName}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              onClick={() => approveSubmission(submission.id)}
              className="flex items-center"
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openRejectionDialog(submission.id, submission.title)}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
            {submission.source_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={submission.source_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-1" />
                  View Source
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SeriesCard = ({ series }: { series: ApprovedSeries }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex space-x-4">
            {series.cover_image_url && (
              <Avatar className="w-16 h-20 rounded-md">
                <AvatarImage src={series.cover_image_url} alt={series.title} className="object-cover" />
                <AvatarFallback className="rounded-md">{series.title.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <CardTitle className="text-lg">{series.title}</CardTitle>
              <CardDescription>
                {series.groupName ? `By ${series.groupName}` : 'No group'} • {new Date(series.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="default">Approved</Badge>
            {series.type && series.type.length > 0 && (
              <Badge variant="outline">{series.type.join(', ')}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {series.description && (
            <div>
              <h4 className="font-semibold text-sm">Description</h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{series.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {series.author && (
              <div>
                <span className="font-semibold">Author:</span> {series.author}
              </div>
            )}
            {series.artist && (
              <div>
                <span className="font-semibold">Artist:</span> {series.artist}
              </div>
            )}
            <div>
              <span className="font-semibold">Status:</span> {series.status}
            </div>
            <div>
              <span className="font-semibold">Chapters:</span> {series.total_chapters || 0}
            </div>
            <div>
              <span className="font-semibold">Views:</span> {series.total_views?.toLocaleString() || 0}
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button size="sm" variant="outline" asChild>
              <a href={`/series/${series.id}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4 mr-1" />
                View Series
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`/admin/series/${series.id}/edit`}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredPendingSubmissions = pendingSubmissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.groupName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApprovedSeries = approvedSeries.filter(series =>
    series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    series.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    series.groupName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading series data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Series Management</h1>
          <p className="text-muted-foreground">Review and manage series submissions and approved series</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recentSubmissions} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Series</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSeries}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recentSeries} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvalRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.approvedSubmissions} approved
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.rejectedSubmissions} rejected
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search series, authors, or groups..."
            value={searchTerm}
            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending ({filteredPendingSubmissions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Approved ({filteredApprovedSeries.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredPendingSubmissions.length > 0 ? (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Review each series submission carefully. Approved series will be immediately available to readers.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                {filteredPendingSubmissions.map((submission) => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending submissions</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No submissions match your search.' : 'All series submissions have been reviewed.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredApprovedSeries.length > 0 ? (
            <div className="grid gap-4">
              {filteredApprovedSeries.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No approved series</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No series match your search.' : 'No series have been approved yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog.open} onOpenChange={(open: any) => 
        setRejectionDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {rejectionDialog.title}. This will be sent to the submitting group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectionDialog({ open: false, submissionId: '', title: '' })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={rejectSubmission}>
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}