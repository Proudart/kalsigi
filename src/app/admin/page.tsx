import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@//components/ui/card';
import { Badge } from '@//components/ui/badge';
import {
  BookOpen,
  Users,
  FileText,
  Settings,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from '@/lib/icons';
import type { Session } from '@/types';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrative control panel for managing the platform',
};

const adminCapabilities = [
  {
    title: 'Chapter Management',
    description: 'Review and approve pending chapter submissions from scanlation groups',
    href: '/admin/chapter',
    icon: BookOpen,
    color: 'bg-blue-500',
    features: [
      'Review pending chapter submissions',
      'Approve or reject chapters',
      'View chapter statistics',
      'Manage chapter content'
    ]
  },
  {
    title: 'Series Management', 
    description: 'Manage manga/manhwa series submissions and approvals',
    href: '/admin/series',
    icon: FileText,
    color: 'bg-green-500',
    features: [
      'Review series submissions',
      'Approve new series',
      'Edit series metadata',
      'View series analytics'
    ]
  },
  {
    title: 'Groups Management',
    description: 'Oversee scanlation groups, memberships, and permissions',
    href: '/admin/groups',
    icon: Users,
    color: 'bg-purple-500',
    features: [
      'Approve group applications',
      'Manage group permissions',
      'Review group members',
      'Handle group disputes'
    ]
  }
];

const quickStats = [
  {
    label: 'Pending Chapters',
    value: 'Check API',
    icon: Clock,
    color: 'text-orange-500'
  },
  {
    label: 'Approved Today',
    value: 'Check API', 
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    label: 'Rejected Today',
    value: 'Check API',
    icon: XCircle,
    color: 'text-red-500'
  },
  {
    label: 'Active Groups',
    value: 'Check API',
    icon: Shield,
    color: 'text-blue-500'
  }
];

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  }) as Session | null;

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}. Manage platform operations from here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {adminCapabilities.map((capability) => (
          <Card key={capability.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${capability.color}`}>
                    <capability.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{capability.title}</CardTitle>
                  </div>
                </div>
                <Badge variant="secondary">Admin</Badge>
              </div>
              <CardDescription>{capability.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {capability.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href={capability.href}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                Open {capability.title}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Admin Tools */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Additional Admin Tools
            </CardTitle>
            <CardDescription>
              More administrative functions and system management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View platform statistics and user engagement metrics
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold mb-1">User Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Settings className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-semibold mb-1">System Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure platform settings and preferences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}