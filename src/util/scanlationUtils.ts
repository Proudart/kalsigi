
// Enums
export enum GroupStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended'
}

export enum GroupRole {
  OWNER = 'owner',
  CO_OWNER = 'co-owner',
  MODERATOR = 'moderator',
  QA = 'qa',
  UPLOADER = 'uploader',
  MEMBER = 'member'
}

export enum MemberStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  DECLINED = 'declined'
}

// Define a type for all possible permissions
export type GroupPermission = 
  | 'manage_group' 
  | 'invite_users' 
  | 'remove_users' 
  | 'upload_content' 
  | 'moderate_content' 
  | 'view_analytics' 
  | 'delete_group'
  | 'view_content';

// Permission mapping
export const GROUP_PERMISSIONS: Record<GroupRole, readonly GroupPermission[]> = {
  [GroupRole.OWNER]: ['manage_group', 'invite_users', 'remove_users', 'upload_content', 'moderate_content', 'view_analytics', 'delete_group'],
  [GroupRole.CO_OWNER]: ['invite_users', 'remove_users', 'upload_content', 'moderate_content', 'view_analytics'],
  [GroupRole.MODERATOR]: ['upload_content', 'moderate_content', 'invite_users'],
  [GroupRole.QA]: ['upload_content', 'moderate_content'],
  [GroupRole.UPLOADER]: ['upload_content'],
  [GroupRole.MEMBER]: ['view_content']
} as const;

// Helper function to check permissions
export function hasPermission(role: GroupRole, permission: GroupPermission): boolean {
  return GROUP_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Helper function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');  // Remove dashes from start and end
}