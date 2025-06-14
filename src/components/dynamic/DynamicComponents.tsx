import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Admin Components - Only load when needed
export const DynamicChapterApprovalInterface = dynamic(
  () => import('@//components/admin/ChapterApprovalInterface'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicSeriesApprovalInterface = dynamic(
  () => import('@//components/admin/SeriesApprovalInterface'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicGroupApprovalInterface = dynamic(
  () => import('@//components/admin/GroupApprovalInterface'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

// Group Components
export const DynamicGroupCreationForm = dynamic(
  () => import('@//components/groups/GroupCreationForm'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicGroupDashboard = dynamic(
  () => import('@//components/groups/GroupDashboard'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicMemberManagement = dynamic(
  () => import('@//components/groups/MemberManagement').then(mod => mod.MemberManagement),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicInviteModal = dynamic(
  () => import('@//components/groups/InviteModal').then(mod => mod.InviteModal),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

// Feed Components
export const DynamicDiscoverManga = dynamic(
  () => import('@//components/feed/main/discoverManga'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicRecommended = dynamic(
  () => import('@//components/feed/recommended/recommended'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicUpdated = dynamic(
  () => import('@//components/feed/updated/updated'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicContinue = dynamic(
  () => import('@//components/feed/continue/continue'),
  {
    loading: LoadingSpinner,
    ssr: true // User-specific, no SSR needed
  }
);

// Chapter Components
export const DynamicChapterContent = dynamic(
  () => import('@//components/chapter/chapterContent'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicChapterNav = dynamic(
  () => import('@//components/chapter/chapterNav'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicChapterChat = dynamic(
  () => import('@//components/chapter/chapterChat'),
  {
    loading: LoadingSpinner,
    ssr: true // Interactive component, no SSR needed
  }
);

// Heavy Libraries - Load only when needed
export const DynamicFramerMotion = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  {
    loading: LoadingSpinner,
    ssr: true
  }
) as ComponentType<any>;

export const DynamicCarousel = dynamic(
  () => import('@//components/ui/carousel').then(mod => mod.Carousel),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

// Form Components - Load only when forms are needed
export const DynamicAddChapterForm = dynamic(
  () => import('@//components/groups/addChapter/addChapterForm'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicAddSeriesForm = dynamic(
  () => import('@//components/groups/addSeries/addSeriesForm'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

// Settings and Auth Forms
export const DynamicSettingsForm = dynamic(
  () => import('@//components/auth/settings/settingsForm'),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicLogin = dynamic(
  () => import('@//components/auth/login').then(mod => mod.SignInForm),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);

export const DynamicRegister = dynamic(
  () => import('@//components/auth/register').then(mod => mod.SignUpForm),
  {
    loading: LoadingSpinner,
    ssr: true
  }
);