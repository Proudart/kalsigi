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
    ssr: false
  }
);

export const DynamicSeriesApprovalInterface = dynamic(
  () => import('@//components/admin/SeriesApprovalInterface'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

export const DynamicGroupApprovalInterface = dynamic(
  () => import('@//components/admin/GroupApprovalInterface'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

// Group Components
export const DynamicGroupCreationForm = dynamic(
  () => import('@//components/groups/GroupCreationForm'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

export const DynamicGroupDashboard = dynamic(
  () => import('@//components/groups/GroupDashboard'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

export const DynamicMemberManagement = dynamic(
  () => import('@//components/groups/MemberManagement'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

export const DynamicInviteModal = dynamic(
  () => import('@//components/groups/InviteModal'),
  {
    loading: LoadingSpinner,
    ssr: false
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
    ssr: false // User-specific, no SSR needed
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
    ssr: false // Interactive component, no SSR needed
  }
);

// Heavy Libraries - Load only when needed
export const DynamicFramerMotion = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  {
    loading: LoadingSpinner,
    ssr: false
  }
) as ComponentType<any>;

export const DynamicCarousel = dynamic(
  () => import('@//components/ui/carousel'),
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
    ssr: false
  }
);

export const DynamicAddSeriesForm = dynamic(
  () => import('@//components/groups/addSeries/addSeriesForm'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

// Settings and Auth Forms
export const DynamicSettingsForm = dynamic(
  () => import('@//components/auth/settings/settingsForm'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

export const DynamicLogin = dynamic(
  () => import('@//components/auth/login'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

export const DynamicRegister = dynamic(
  () => import('@//components/auth/register'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);