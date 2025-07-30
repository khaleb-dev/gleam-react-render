import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/formatUtils';
import { Check, X, Calendar, Zap, Loader } from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskStatusValues } from '@/types';

type Complexity = 'Easy' | 'Medium' | 'Hard';

const getComplexityColor = (complexity: Complexity) => {
  switch (complexity) {
    case 'Easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return '';
  }
};

const PriceEstimate = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, updateTaskStatus } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [complexity, setComplexity] = useState<Complexity>('Medium');
  
  const task = tasks.find(t => t._id === taskId);
  
  useEffect(() => {
    // Simulate loading and determine complexity based on task
    const timer = setTimeout(() => {
      // In a real app, complexity would be calculated based on task details
      // For now, we'll randomly assign a complexity
      const complexities: Complexity[] = ['Easy', 'Medium', 'Hard'];
      setComplexity(complexities[Math.floor(Math.random() * 3)]);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAccept = () => {
    if (!task) return;
    
    updateTaskStatus(task._id, TaskStatusValues.PENDING);
    toast.success("Task submitted successfully!");
    navigate(`/waiting/${task._id}`);
  };
  
  const handleReject = () => {
    navigate('/create-task');
    toast.info("Task creation cancelled");
  };
  
  if (!task) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-red-500">Task not found</h1>
          <Button 
            onClick={() => navigate('/create-task')} 
            className="mt-4"
          >
            Create New Task
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Price Estimate</h1>
        
        <Card className="p-6">
          {loading ? (
            <div className="py-10 text-center space-y-4">
              <Loader className="h-16 w-16 animate-spin mx-auto text-primary" />
              <p className="text-lg text-muted-foreground">Calculating price estimate...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-medium">Estimated Price</h2>
                  <div className="text-4xl font-bold text-taskApp-purple mt-2">
                    {formatCurrency(task.price)}
                  </div>
                </div>
                
                <div className="border-t border-b py-4 my-4 space-y-3">
                  <h3 className="font-medium mb-2">Task Summary</h3>
                  
                  <div>
                    <p className="text-lg font-medium">{task.title}</p>
                    <p className="text-gray-600 text-sm">{task.subject}</p>
                  </div>
                  
                  {/* Complexity Badge */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">Complexity:</span>
                    <Badge className={`${getComplexityColor(complexity)} flex items-center gap-1`}>
                      <Zap size={14} />
                      {complexity}
                    </Badge>
                  </div>
                  
                  {/* Deadline */}
                  {task.deadline && (
                    <div className="flex items-center text-sm">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span>Deadline: {formatDate(task.deadline)}</span>
                      {task.deadline && (
                        <span className="ml-1">
                          at {task.deadline.getHours().toString().padStart(2, '0')}:{task.deadline.getMinutes().toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>
                    This price estimation is based on the task details you provided.
                    Accept to submit your task or reject to make changes.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button 
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                  onClick={handleReject}
                >
                  <X size={18} className="mr-2" /> Reject
                </Button>
                <Button 
                  className="flex-1 bg-taskApp-purple hover:bg-taskApp-lightPurple"
                  onClick={handleAccept}
                >
                  <Check size={18} className="mr-2" /> Accept
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default PriceEstimate;
