import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus, Calendar, Check, RefreshCw, TrendingUp, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MapLocation } from '@/types';
import { toast } from "sonner";
import { formatCurrency, formatDate } from '@/utils/formatUtils';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { taskApi } from '@/services/taskApi';
import { Skeleton } from '@/components/ui/skeleton';
import { FilePreview } from '@/components/ui/FilePreview';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ResponderSearch } from '@/components/tasks/ResponderSearch';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Date picker imports
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

type Complexity = 'easy' | 'medium' | 'hard';

interface FileWithPreview {
  file: File;
  preview?: string;
}

interface Responder {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_avatar?: string;
  _id: string;
  availability_status: 'available' | 'busy';
}

const getComplexityColor = (complexity: Complexity) => {
  switch (complexity) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return '';
  }
};

const getComplexityTitle = (complexity: Complexity): string => {
  return complexity.charAt(0).toUpperCase() + complexity.slice(1);
};

const CreateTask = () => {
  const navigate = useNavigate();
  const { currentLocation, user } = useAppContext();
  const { uploadFiles, isUploading } = useFileUpload();
  const { loggedInUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [location, setLocation] = useState<MapLocation>(currentLocation);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [deadlineTime, setDeadlineTime] = useState<string>(new Date().toDateString());
  const [complexity, setComplexity] = useState<Complexity>('easy');
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>('');
  const [showPriceEstimate, setShowPriceEstimate] = useState(false);
  const [selectedResponders, setSelectedResponders] = useState<Responder[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0)

  useEffect(() => {
    let hasFetched = false

    async function setBalance() {
      if (!hasFetched) {
        hasFetched = true
        const currentUser = await loggedInUser();
        setWalletBalance(currentUser?.wallet_id.balance || 0)
      }
    }
    setBalance()
  }, [])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 8) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files);
    const filesWithPreviews: FileWithPreview[] = [];

    for (const file of newFiles) {
      const preview = await createFilePreview(file);
      filesWithPreviews.push({ file, preview });
    }

    setFiles(prev => [...prev, ...filesWithPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getFullDeadline = (): string | undefined => {
    if (!deadline) return undefined;

    const [hours, minutes] = deadlineTime.split(':').map(Number);
    const fullDeadline = new Date(deadline);
    fullDeadline.setHours(hours, minutes);
    return fullDeadline.toISOString();
  };

  const handleResponderSelect = (responder: Responder) => {
    setSelectedResponders(prev => [...prev, responder]);
  };

  const handleResponderRemove = (responderId: string) => {
    setSelectedResponders(prev => prev.filter(r => r._id !== responderId));
  };

  const handleCalculatePrice = async () => {
    if (!title || !description || !category) {
      toast.error("Please fill out all required fields");
      return;
    }

    setCalculatingPrice(true);
    setShowPriceEstimate(true);

    try {
      const estimateData = {
        title,
        assignment: description,
        subject: category,
        deadline: getFullDeadline(),
      };

      const response = await taskApi.estimateTaskPrice(estimateData);
      console.log("Price estimate response:", response);

      if (response.success && response.data) {
        setEstimatedPrice(response.data.estimatedPrice);
        setNegotiatedPrice(response.data.estimatedPrice.toString());

        if (response.data.complexity) {
          setComplexity(response.data.complexity);
        }

        toast.success("Price estimate calculated successfully!");
      } else {
        setShowPriceEstimate(false);
        toast.error(response.message || "Failed to calculate price estimate");
      }
    } catch (error) {
      console.error("Price estimation error:", error);
      setShowPriceEstimate(false);
      toast.error("An unexpected error occurred while calculating price");
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleNegotiatedPriceChange = (value: string) => {
    setNegotiatedPrice(value);
  };

  const handleSubmit = async () => {
    if (!estimatedPrice) return;

    const finalPrice = negotiatedPrice ? parseFloat(negotiatedPrice) : estimatedPrice;

    if (finalPrice < estimatedPrice) {
      toast.error(`Price cannot be less than the estimated price of ${formatCurrency(estimatedPrice)}`);
      return;
    }

    try {
      let fileUrls: string[] = [];
      if (files.length > 0) {
        const uploadedUrls = await uploadFiles(files.map(f => f.file));
        if (uploadedUrls) {
          fileUrls = uploadedUrls;
        } else {
          return;
        }
      }

      const taskData = {
        title,
        description,
        subject: category,
        deadline: getFullDeadline(),
        file_urls: fileUrls,
        key_notes: tags,
        estimated_price: estimatedPrice,
        negotiated_price: finalPrice,
        difficulty: complexity,
        responder_id: selectedResponders.length > 0 ? selectedResponders[0]._id : undefined
      };

      const response = await taskApi.createTask(taskData);

      if (response.success && response.data) {
        toast.success("Task submitted successfully!");
        navigate(`/dashboard`);
      } else {
        toast.error(response.message || "Failed to create task");
      }
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="create-task-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-xl font-bold">Create New Task</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Wallet size={16} />
            <span>Balance: {formatCurrency(walletBalance)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Task Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Build a React Dashboard"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your task in detail..."
                    rows={4}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="Writing">Writing & Content</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Video">Video & Animation</SelectItem>
                      <SelectItem value="Music">Music & Audio</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Section */}
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tags (e.g., React, Design, etc.)"
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Deadline Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !deadline && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="deadlineTime" className="text-sm font-medium">Deadline Time</Label>
                    <Input
                      id="deadlineTime"
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="file" className="text-sm font-medium">Upload Files</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload images, documents, or other relevant files
                  </p>
                  {files.length > 0 && (
                    <div className="mt-2">
                      <FilePreview files={files} onRemoveFile={handleRemoveFile} />
                    </div>
                  )}
                </div>

                {/* Responder Search */}
                <ResponderSearch
                  selectedResponders={selectedResponders}
                  onResponderSelect={handleResponderSelect}
                  onResponderRemove={handleResponderRemove}
                />

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCalculatePrice}
                    className="bg-primary hover:bg-primary/80 w-full sm:w-auto"
                    disabled={calculatingPrice}
                  >
                    {calculatingPrice ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      'Calculate Price'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Price Estimation Panel */}
          {showPriceEstimate && (
            <div className="lg:col-span-1">
              <Card className="p-4 sticky top-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-lg font-medium">
                      {calculatingPrice ? "Calculating Price..." : "Task Pricing"}
                    </h2>
                    <div className="text-lg font-bold text-gray-600 mt-1">
                      {calculatingPrice ? (
                        <Skeleton className="h-6 w-24 mx-auto" />
                      ) : (
                        <span>Base: {formatCurrency(estimatedPrice || 0)}</span>
                      )}
                    </div>
                  </div>

                  {!calculatingPrice && estimatedPrice && (
                    <div className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium text-primary">Boost Your Priority</h3>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                        💡 <strong>Pro Tip:</strong> Increase your offer to attract top experts faster!
                      </p>

                      <div>
                        <Label htmlFor="negotiatedPrice" className="text-xs font-medium">Your Offer (optional)</Label>
                        <Input
                          id="negotiatedPrice"
                          type="number"
                          value={negotiatedPrice}
                          onChange={(e) => handleNegotiatedPriceChange(e.target.value)}
                          placeholder={estimatedPrice?.toString()}
                          min={estimatedPrice}
                          step="0.01"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum: {formatCurrency(estimatedPrice)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3 space-y-2">
                    <h3 className="text-sm font-medium">Task Summary</h3>
                    <div>
                      <p className="text-sm font-medium">{title || 'Your Task'}</p>
                      <p className="text-xs text-gray-600">{category || 'Category'}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{description || 'Description'}</p>
                    </div>

                    {!calculatingPrice && complexity && (
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Complexity:</span>
                        <Badge className={`${getComplexityColor(complexity)} text-xs`}>
                          {getComplexityTitle(complexity)}
                        </Badge>
                      </div>
                    )}

                    {deadline && (
                      <div className="flex items-center text-xs">
                        <Calendar size={12} className="mr-2 text-gray-500" />
                        <span>Deadline: {formatDate(deadline)} at {deadlineTime}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => setShowPriceEstimate(false)}
                      disabled={calculatingPrice}
                    >
                      <X size={14} className="mr-1" /> Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/80 text-xs"
                      onClick={handleSubmit}
                      disabled={calculatingPrice || !estimatedPrice || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw size={14} className="mr-1 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check size={14} className="mr-1" /> Submit Task
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
