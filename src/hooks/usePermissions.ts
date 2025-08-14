import { useMemo } from 'react';
import { useAuthState } from './useAuthState';

export interface UserPermissions {
  canManagePage: boolean;
  canManageMembers: boolean;
  canCreatePosts: boolean;
  canManageJobs: boolean;
  canAssignRoles: boolean;
  canFeatureEmployee: boolean;
  canViewAnalytics: boolean;
  isMember: boolean;
  isOwner: boolean;
}

export const usePermissions = (companyPageData: any): UserPermissions => {
  const { user } = useAuthState();

  return useMemo(() => {
    if (!user || !companyPageData) {
      return {
        canManagePage: false,
        canManageMembers: false,
        canCreatePosts: false,
        canManageJobs: false,
        canAssignRoles: false,
        canFeatureEmployee: false,
        canViewAnalytics: false,
        isMember: false,
        isOwner: false,
      };
    }

    // Check if user is the owner/admin of the page
    const isOwner = companyPageData.admin?.user_id === user.user_id;
    
    // Find user's membership in the page
    const userMembership = companyPageData.members?.find(
      (member: any) => member.user_id === user.user_id
    );
    
    const isMember = isOwner || !!userMembership;
    
    // Get user's permissions from their role
    const userPermissions = userMembership?.role?.permissions || [];
    
    // If user is owner, they have all permissions
    if (isOwner) {
      return {
        canManagePage: true,
        canManageMembers: true,
        canCreatePosts: true,
        canManageJobs: true,
        canAssignRoles: true,
        canFeatureEmployee: true,
        canViewAnalytics: true,
        isMember: true,
        isOwner: true,
      };
    }

    return {
      canManagePage: userPermissions.includes('manage_page'),
      canManageMembers: userPermissions.includes('manage_members'),
      canCreatePosts: userPermissions.includes('create_posts'),
      canManageJobs: userPermissions.includes('manage_jobs'),
      canAssignRoles: userPermissions.includes('assign_roles'),
      canFeatureEmployee: userPermissions.includes('feature_employee'),
      canViewAnalytics: userPermissions.includes('view_analytics'),
      isMember,
      isOwner: false,
    };
  }, [user, companyPageData]);
};