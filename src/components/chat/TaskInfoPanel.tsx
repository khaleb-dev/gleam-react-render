import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Task } from "@/types"
import { formatDate } from "@/utils/formatUtils"
import type { NavigateFunction } from "react-router-dom"

interface TaskInfoPanelProps {
  task: Task | null
  taskId: string | undefined
  navigate: NavigateFunction
}

export const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({ task, taskId, navigate }) => {
  if (!task) return null

  return (
    <>
      {/* Responder Info */}
      {task.responder && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage
                src={`https://robohash.org/${encodeURIComponent(task.responder.first_name)}?set=set4&size=200x200`}
                alt={task.responder.first_name}
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {task.responder.first_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {task.responder.first_name} {task.responder.last_name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500">About Me</span>
              <p className="text-gray-700 mt-1">Ready to help with your tasks efficiently and professionally.</p>
            </div>
            <div>
              <span className="text-gray-500">Member Since</span>
              <p className="text-gray-700 mt-1">Jan 15, 2024</p>
            </div>
          </div>
        </div>
      )}

      {/* Task Details */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Task Details</h3>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Title</span>
            <p className="text-gray-900">{task.title}</p>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Subject</span>
            <p className="text-gray-700">{task.subject}</p>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Description</span>
            <p className="text-gray-700 text-xs leading-relaxed">{task.description}</p>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Price</span>
            <p className="text-green-600 font-medium">${task.price}</p>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Status</span>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Created</span>
            <p className="text-gray-700">{formatDate(task.createdAt)}</p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/task/${taskId}`)}
          variant="outline"
          className="w-full mt-4 text-xs h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          View Full Details
        </Button>
      </div>
    </>
  )
}
