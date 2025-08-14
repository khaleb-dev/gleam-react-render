import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSuggestedPages } from "@/hooks/useSuggestedPages";
import { useFollowCompanyPage, useUnfollowCompanyPage, useFollowStatus } from "@/hooks/useCompanyPageFollow";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";

export const SuggestedPagesCard: React.FC = () => {
  const { data: suggestedPages, isLoading } = useSuggestedPages();
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate("/discover?tab=pages");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Suggested Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestedPages?.success || !suggestedPages.data.pages.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Suggested Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No suggested pages available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold">Suggested Pages</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewMore}
          className="h-8 px-2"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestedPages.data.pages.slice(0, 3).map((page) => (
          <SuggestedPageItem key={page._id} page={page} />
        ))}
        {suggestedPages.data.pages.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewMore}
            className="w-full"
          >
            View More
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface SuggestedPageItemProps {
  page: any;
}

const SuggestedPageItem: React.FC<SuggestedPageItemProps> = ({ page }) => {
  const { data: followStatus } = useFollowStatus(page._id);
  const followMutation = useFollowCompanyPage();
  const unfollowMutation = useUnfollowCompanyPage();
  const navigate = useNavigate();

  const isFollowing = followStatus?.data?.isFollowing || false;

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate(page._id);
    } else {
      followMutation.mutate(page._id);
    }
  };

  const handlePageClick = () => {
    navigate(`/company/page/${page.company_url}`);
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar 
        className="w-10 h-10 cursor-pointer" 
        onClick={handlePageClick}
      >
        <AvatarImage src={page.logo} />
        <AvatarFallback>
          {page.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handlePageClick}>
        <p className="font-medium text-sm truncate">{page.name}</p>
        <p className="text-xs text-muted-foreground truncate">{page.industry}</p>
      </div>
      <Button
        size="sm"
        variant={isFollowing ? "outline" : "default"}
        onClick={handleFollowToggle}
        disabled={followMutation.isPending || unfollowMutation.isPending}
        className="h-7 px-2 text-xs"
      >
        {isFollowing ? "Following" : <Plus className="h-3 w-3" />}
      </Button>
    </div>
  );
};