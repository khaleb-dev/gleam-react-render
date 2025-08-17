
import { useMemo } from 'react';
import { useAuthState } from './useAuthState';
import { usePageMembers } from './usePageMembers';

export interface PagePermissions {
  canManagePage: boolean;
  canManageMembers: boolean;
  canCreatePosts: boolean;
  canViewPosts: boolean;
  canManageJobs: boolean;
  canAssignRoles: boolean;
  canFeatureEmployee: boolean;
  canViewAnalytics: boolean;
  canViewActivities: boolean;
  canCreateProduct: boolean;
  canAddMembers: boolean;
  canSeeUserRoles: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  canSeeChannelButton: boolean;
}

export const usePagePermissions = (pageId: string): PagePermissions => {
  const { user } = useAuthState();
  const { data: membersData } = usePageMembers(pageId);

  return useMemo(() => {
    if (!user || !membersData?.data?.members) {
      return {
        canManagePage: false,
        canManageMembers: false,
        canCreatePosts: false,
        canViewPosts: true, // Non-authenticated users can view posts
        canManageJobs: false,
        canAssignRoles: false,
        canFeatureEmployee: false,
        canViewAnalytics: false,
        canViewActivities: false,
        canCreateProduct: false,
        canAddMembers: false,
        canSeeUserRoles: false,
        isMember: false,
        isAdmin: false,
        isSuperAdmin: false,
        isModerator: false,
        canSeeChannelButton: false,
      };
    }

    // Find user's membership in the page
    const userMembership = membersData.data.members.find(
      (member: any) => member.user_id._id === user.user_id || member.user_id._id === user._id
    );
    
    const isMember = !!userMembership && userMembership.status === 'approved';
    
    // Non-members have very limited permissions
    if (!isMember) {
      return {
        canManagePage: false,
        canManageMembers: false,
        canCreatePosts: false, // Cannot create posts
        canViewPosts: true, // Can view posts
        canManageJobs: false,
        canAssignRoles: false,
        canFeatureEmployee: false,
        canViewAnalytics: false,
        canViewActivities: false,
        canCreateProduct: false,
        canAddMembers: false,
        canSeeUserRoles: false, // Cannot see user roles
        isMember: false,
        isAdmin: false,
        isSuperAdmin: false,
        isModerator: false,
        canSeeChannelButton: false, // Cannot see channel button
      };
    }

    const userRole = userMembership.role_id.role_name.toLowerCase();
    const userPermissions = userMembership.role_id.permissions || [];
    
    const isAdmin = userRole === 'admin';
    const isSuperAdmin = userRole === 'super_admin';
    const isModerator = userRole === 'moderator';
    const isAdminLevel = isAdmin || isSuperAdmin || isModerator;

    return {
      canManagePage: isSuperAdmin || (isAdminLevel && userPermissions.includes('manage_page')),
      canManageMembers: isSuperAdmin || (isAdminLevel && userPermissions.includes('manage_members')),
      canCreatePosts: userPermissions.includes('create_posts'),
      canViewPosts: true, // All members can view posts
      canManageJobs: isSuperAdmin || (isAdminLevel && userPermissions.includes('manage_jobs')),
      canAssignRoles: isSuperAdmin || (isAdminLevel && userPermissions.includes('assign_roles')),
      canFeatureEmployee: isSuperAdmin || (isAdminLevel && userPermissions.includes('feature_employee')),
      canViewAnalytics: isSuperAdmin || isAdmin, // Only super_admin and admin can view analytics
      canViewActivities: isSuperAdmin || isAdmin, // Only super_admin and admin can view activities
      canCreateProduct: isSuperAdmin || isAdmin, // Only super_admin and admin can create products
      canAddMembers: isSuperAdmin || isAdmin, // Only super_admin and admin can add members
      canSeeUserRoles: isAdminLevel, // Only admin level can see user roles
      isMember,
      isAdmin,
      isSuperAdmin,
      isModerator,
      canSeeChannelButton: isMember, // All members can see channel button
    };
  }, [user, membersData]);
};
