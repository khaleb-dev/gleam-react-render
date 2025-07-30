import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Star, 
  MessageCircle, 
  Briefcase, 
  Users, 
  FileText,
  Activity as ActivityIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/services/notificationApi';

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'task':
        return <Briefcase className="h-4 w-4 text-purple-600" />;
      case 'linkup':
        return <Users className="h-4 w-4 text-orange-600" />;
      case 'score':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-700';
      case 'comment':
        return 'bg-green-100 text-green-700';
      case 'task':
        return 'bg-purple-100 text-purple-700';
      case 'linkup':
        return 'bg-orange-100 text-orange-700';
      case 'score':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filterActivities = (activities: Activity[], filter: string) => {
    switch (filter) {
      case 'all':
        return activities;
      case 'posts':
        return activities.filter(a => a.type === 'post');
      case 'comments':
        return activities.filter(a => a.type === 'comment');
      case 'tasks':
        return activities.filter(a => a.type === 'task');
      case 'social':
        return activities.filter(a => ['linkup', 'score'].includes(a.type));
      default:
        return activities;
    }
  };

  const filteredActivities = filterActivities(activities, activeTab);

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 day ago';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return `${Math.floor(diffInDays / 30)} months ago`;
      }
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          Activity
        </h3>
        <p className="text-sm text-gray-600 mt-1">Your recent activities and interactions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-100 px-6">
          <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="text-sm py-3 px-0 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              All
              <Badge variant="secondary" className="ml-2 text-xs px-2 py-0.5 h-5">
                {activities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="text-sm py-3 px-0 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="text-sm py-3 px-0 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="text-sm py-3 px-0 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="text-sm py-3 px-0 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
            >
              Social
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredActivities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredActivities.map((activity) => (
                  <div key={activity._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        getTypeColor(activity.type)
                      )}>
                        {getIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs capitalize", getTypeColor(activity.type))}
                          >
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(activity.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ActivityIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h4>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'all' 
                    ? "Start interacting to see your activities here" 
                    : `No ${activeTab} activities yet`
                  }
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};