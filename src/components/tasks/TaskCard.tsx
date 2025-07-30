import { Task } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatUtils';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

type TaskCardProps = {
  task: Task;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-taskApp-softGreen text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/task/${task._id}`);
  };

  // Use either keyNotes or key_notes based on what's available
  const keyNotes = task.key_notes || [];

  return (
    <div
      className={`task-container border rounded-lg p-4 hover:border-taskApp-purple hover:shadow-md cursor-pointer ${getStatusColor(task.status)}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium">{task.title}</h3>
        <span className="text-xs font-bold">{formatCurrency(task.price)}</span>
      </div>

      {task.subject && (
        <p className="text-xs text-gray-600 mt-1">{task.subject}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {keyNotes.map((note, index) => (
          <Badge key={index} variant="outline" className="bg-white">
            {note}
          </Badge>
        ))}
      </div>

      {task.deadline && (
        <div className="mt-3 flex items-center text-xs text-gray-600">
          <Calendar size={12} className="mr-1" />
          <span>
            Due: {formatDate(task.deadline)}
          </span>
        </div>
      )}

      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span className="text-xs">Created: {formatDate(task.createdAt)}</span>
        <span className="capitalize font-medium text-xs">Status: {task.status}</span>
      </div>
    </div>
  );
};
