import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency } from '@/utils/formatUtils';
import { MessageCircle, FileText, Loader, CheckCircle, ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTask } from '@/hooks/useTask';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { IconicLink } from '@/components/links/IconicLink';

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { getOneTask, isLoading, approveTask } = useTask();
  const [task, setTask] = useState<Task | null>(null);
  const [taskNotFound, setTaskNotFound] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Helper to check deadline status
  const getDeadlineStatus = (deadline: string | Date) => {
    const now = new Date();
    const due = new Date(deadline);
    if (now > due) {
      // Deadline has passed
      // formatDistanceToNow returns "x days ago"
      const overdue = formatDistanceToNow(due, { addSuffix: false });
      return {
        exceeded: true,
        text: `${overdue} past due date`,
      };
    } else {
      // Not due yet
      return {
        exceeded: false,
        text: formatDistanceToNow(due, { addSuffix: true }),
      };
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const fetchedTask = await getOneTask(taskId!);
        if (fetchedTask) {
          setTask(fetchedTask);
          setTaskNotFound(false);
        } else {
          setTask(null);
          setTaskNotFound(true);
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        setTask(null);
        setTaskNotFound(true);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId, getOneTask]);

  const handleChat = () => {
    navigate(`/chat/${taskId}`);
  };

  const handleApproveTask = async () => {
    if (!taskId) return;
    setIsApproving(true);
    const updatedTask = await approveTask(taskId);
    if (updatedTask) {
      setTask(updatedTask);
    }
    setIsApproving(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-20">
          <div className="text-center space-y-4">
            <Loader className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (taskNotFound || !task) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-red-500">Task not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="pb-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-semibold">{task.title}</h1>
                <p className="text-xs text-muted-foreground mt-1">{task.category}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Badge
                  variant="outline"
                  className={`capitalize ${task.status === 'completed' ? 'bg-green-100 text-green-800'
                    : task.status === 'in_progress' ? 'bg-blue-100 text-blue-800'
                      : task.status === 'cancelled' ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {task.status.replace('_', ' ')}
                </Badge>
                {task.difficulty && (
                  <Badge
                    className={`capitalize ${task.difficulty.toLowerCase() === 'hard' ? 'bg-red-100 text-red-800' :
                      task.difficulty.toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}
                  >
                    {task.difficulty}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pb-6 border-b">
            <h2 className="text-base font-semibold mb-3">Description</h2>
            <p className="text-xs text-muted-foreground whitespace-pre-line">{task.description}</p>
          </div>

          {/* Key Notes */}
          {task.key_notes && task.key_notes.length > 0 && (
            <div className="pb-6 border-b">
              <h2 className="text-base font-semibold mb-3">Key Notes</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {task.key_notes.map((note, index) => (
                  <Badge key={index} variant="secondary">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.files && task.files.length > 0 && (
            <div className="pb-6 border-b">
              <h2 className="text-base font-semibold mb-3">Attachments</h2>
              <div className="space-y-2 mt-1">
                {task.files.map((url, index) => (
                  <IconicLink key={index} url={url} label={`Task File ${index + 1}`} isFile={true} />
                ))}
              </div>
            </div>
          )}

          {/* Submission Details */}
          {task.responder_final_decision === 'finished' && task.submit && (
            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50">
              <h2 className="text-base font-semibold mb-3 text-green-800">Submitted Work</h2>
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="font-medium text-gray-700">Submission Note</h3>
                  <p className="whitespace-pre-line text-muted-foreground mt-1">{task.submit.description}</p>
                </div>
                {task.submit.link && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Submission Link</h3>
                    <IconicLink url={task.submit.link} />
                  </div>
                )}
                {task.submit.files_urls && task.submit.files_urls.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700">Submitted Files</h3>
                    <div className="space-y-2 mt-2">
                      {task.submit.files_urls.map((url, index) => (
                        <IconicLink key={index} url={url} label={`Submitted File ${index + 1}`} isFile={true} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="border rounded-lg p-4 divide-y">
            {task.responder && (
              <div className="pb-4">
                <h2 className="text-sm font-semibold mb-3">Assigned to</h2>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={task.responder.first_name ? `https://robohash.org/${encodeURIComponent(task.responder.first_name)}?set=set4&size=200x200` : undefined} alt={task.responder.first_name || 'Responder'} />
                    <AvatarFallback>{task.responder.first_name ? task.responder.first_name.substring(0, 2).toUpperCase() : 'RS'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{task.responder.first_name || 'Assigned'} {task.responder.last_name || 'Responder'}</h3>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      {task.responder.is_verified && <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Verified</Badge>}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mt-3 text-xs text-muted-foreground">
                  {task.responder.email && <div className="flex items-center gap-2"> <Mail size={12} /> <span>{task.responder.email}</span> </div>}
                  {task.responder.phone_number && <div className="flex items-center gap-2"> <Phone size={12} /> <span>{task.responder.phone_number}</span> </div>}
                </div>
                {task.status !== 'completed' && (
                  <Button onClick={handleChat} className="w-full mt-4 text-sm h-9">
                    <MessageCircle size={16} className="mr-2" />
                    Chat with Responder
                  </Button>
                )}
              </div>
            )}

            <div className="py-4">
              <p className="text-xs text-muted-foreground">Fixed Price</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(task.price)}</p>
            </div>

            {task.deadline && (
              <div className="py-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span>{formatDate(task.deadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {getDeadlineStatus(task.deadline).exceeded ? (
                      <span className="text-red-600 font-semibold">Deadline exceeded</span>
                    ) : (
                      "Time remaining"
                    )}
                  </span>
                  <span>
                    {getDeadlineStatus(task.deadline).exceeded ? (
                      <span className="text-red-600">{getDeadlineStatus(task.deadline).text}</span>
                    ) : (
                      getDeadlineStatus(task.deadline).text
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posted</span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
            </div>

          </div>
          {task.responder_final_decision === 'finished' && task.status !== 'completed' && (
            <div className="border rounded-lg p-4">
              <Button
                onClick={handleApproveTask}
                disabled={isApproving}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                {isApproving ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    Approve & Complete Task
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
