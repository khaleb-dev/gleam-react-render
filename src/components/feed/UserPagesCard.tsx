import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPages } from "@/hooks/useUserPages";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { UserPagesResponse } from "@/services/companyPageApi";

export const UserPagesCard = () => {
  const { data: userPages, isLoading, error } = useUserPages();
  const navigate = useNavigate();

  const handlePageClick = (companyUrl: string) => {
    navigate(`/company/page/${companyUrl}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            My Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !(userPages as UserPagesResponse)?.success) {
    return null;
  }

  const { count, pages } = (userPages as UserPagesResponse).data;

  if (count === 0) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Pages {count}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pages.map((page) => (
          <div
            key={page._id}
            onClick={() => handlePageClick(page.company_url)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={page.logo}
                alt={page.name}
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${page.name}`;
                }}
                className="cover"
              />
              <AvatarFallback>
                {page.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {page.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {page.industry}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};