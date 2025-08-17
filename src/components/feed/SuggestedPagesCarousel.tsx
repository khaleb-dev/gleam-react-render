import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useSuggestedPages } from "@/hooks/useSuggestedPages";
import { useFollowCompanyPage, useUnfollowCompanyPage, useFollowStatus } from "@/hooks/useCompanyPageFollow";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";

export const SuggestedPagesCarousel: React.FC = () => {
  const { data: suggestedPages, isLoading } = useSuggestedPages();
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate("/discover?tab=pages");
  };

  if (isLoading) {
    return (
      <Card className="mx-4 lg:mx-0">
        <CardHeader>
          <CardTitle className="text-sm">Suggested Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-40">
                <div className="w-12 h-12 bg-muted rounded-full animate-pulse mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse mx-auto mb-2"></div>
                <div className="w-16 h-8 bg-muted rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestedPages?.success || !suggestedPages.data.pages.length) {
    return null;
  }

  return (
    <Card className="lg:mx-0 mb-6" style={{ borderRadius: 0 }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Suggested Pages</CardTitle>
          <span
            onClick={handleViewMore}
            className="text-xs cursor-pointer flex items-center text-primary hover:underline"
          >
            See all
            <ArrowRight className="h-3 w-3 ml-1" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {suggestedPages.data.pages.map((page) => (
              <CarouselItem key={page._id} className="pl-2 md:pl-4 basis-auto">
                <SuggestedPageCarouselItem page={page} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
};

interface SuggestedPageCarouselItemProps {
  page: any;
}

const SuggestedPageCarouselItem: React.FC<SuggestedPageCarouselItemProps> = ({ page }) => {
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
    <div className="w-40 p-3 border rounded-lg hover:shadow-md transition-shadow">
      <div className="text-center">
        <Avatar
          className="w-12 h-12 cursor-pointer mx-auto mb-3"
          onClick={handlePageClick}
        >
          <AvatarImage src={page.logo} />
          <AvatarFallback>
            {page.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="cursor-pointer mb-3" onClick={handlePageClick}>
          <p className="font-medium text-sm truncate mb-1">{page.name}</p>
          <p className="text-xs text-muted-foreground truncate">{page.industry}</p>
        </div>
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowToggle}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="h-7 px-3 text-xs w-full"
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    </div>
  );
};