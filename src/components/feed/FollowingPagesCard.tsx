import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFollowingPages } from "@/hooks/useFollowingPages";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FollowingPagesCard: React.FC = () => {
  const { data: followingPages, isLoading } = useFollowingPages();
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate("/discover?tab=pages");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pages You Follow</CardTitle>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!followingPages?.success || !followingPages.data.pages.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Pages You Follow</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMore}
            className="h-8 px-2"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            You're not following any pages yet
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewMore}
            className="w-full"
          >
            Discover Pages
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Pages You Follow</CardTitle>
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
        {followingPages.data.pages.slice(0, 4).map((page) => (
          <FollowingPageItem key={page._id} page={page} />
        ))}
        {followingPages.data.pages.length > 4 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewMore}
            className="w-full"
          >
            View All ({followingPages.data.count})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface FollowingPageItemProps {
  page: any;
}

const FollowingPageItem: React.FC<FollowingPageItemProps> = ({ page }) => {
  const navigate = useNavigate();

  const handlePageClick = () => {
    navigate(`/company/${page.company_url}`);
  };

  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={handlePageClick}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={page.logo} />
        <AvatarFallback>
          {page.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{page.name}</p>
        <p className="text-xs text-muted-foreground truncate">{page.industry}</p>
      </div>
    </div>
  );
};