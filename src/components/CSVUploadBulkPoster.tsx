import React, { useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface CSVRow {
  platform: string;
  content: string;
  imageUrl?: string;
  hashtags?: string;
  scheduledTime?: string;
  id?: string;
}

interface CSVUploadBulkPosterProps {
  onPostsReady?: (posts: CSVRow[], schedule: boolean, scheduledTime?: string) => Promise<void>;
  isOpen?: boolean;
  onClose?: () => void;
}

const CSVUploadBulkPoster: React.FC<CSVUploadBulkPosterProps> = ({
  onPostsReady,
  isOpen: initialIsOpen = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleDialogClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const validateCSVRow = (row: Record<string, string>, index: number): string | null => {
    if (!row.platform) {
      return `Row ${index + 1}: Platform is required`;
    }
    if (!row.content) {
      return `Row ${index + 1}: Content is required`;
    }
    const validPlatforms = ["twitter", "instagram", "facebook", "linkedin", "tiktok"];
    if (!validPlatforms.includes(row.platform.toLowerCase())) {
      return `Row ${index + 1}: Invalid platform. Must be one of: ${validPlatforms.join(", ")}`;
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows: CSVRow[] = [];
        const newErrors: string[] = [];

        (results.data as Record<string, string>[]).forEach((row, index) => {
          const error = validateCSVRow(row, index);
          if (error) {
            newErrors.push(error);
          } else {
            parsedRows.push({
              id: `${Date.now()}-${index}`,
              platform: row.platform.toLowerCase(),
              content: row.content.trim(),
              imageUrl: row.imageUrl?.trim(),
              hashtags: row.hashtags?.trim(),
              scheduledTime: row.scheduledTime?.trim(),
            });
          }
        });

        if (newErrors.length > 0) {
          setErrors(newErrors);
          toast({
            title: "CSV Validation Errors",
            description: `Found ${newErrors.length} error(s). Please fix and try again.`,
            variant: "destructive",
          });
        }

        setCsvData(parsedRows);
        setSelectedRows(new Set(parsedRows.map((_, i) => i)));

        toast({
          title: "CSV Loaded",
          description: `Loaded ${parsedRows.length} posts from CSV file.`,
        });
      },
      error: (error) => {
        setErrors([error.message]);
        toast({
          title: "CSV Parse Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const toggleRowSelection = (index: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedRows(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === csvData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(csvData.map((_, i) => i)));
    }
  };

  const getSelectedPosts = (): CSVRow[] => {
    return csvData.filter((_, index) => selectedRows.has(index));
  };

  const handlePostNow = async () => {
    const selected = getSelectedPosts();
    if (selected.length === 0) {
      toast({
        title: "No posts selected",
        description: "Please select at least one post to publish.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onPostsReady?.(selected, false);
      toast({
        title: "Posts published",
        description: `Successfully published ${selected.length} posts.`,
      });
      setCsvData([]);
      setSelectedRows(new Set());
      handleDialogClose();
    } catch (error) {
      toast({
        title: "Error publishing posts",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePosts = async () => {
    if (!scheduledTime) {
      toast({
        title: "Schedule time required",
        description: "Please select a date and time to schedule posts.",
        variant: "destructive",
      });
      return;
    }

    const selected = getSelectedPosts();
    if (selected.length === 0) {
      toast({
        title: "No posts selected",
        description: "Please select at least one post to schedule.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onPostsReady?.(selected, true, scheduledTime);
      toast({
        title: "Posts scheduled",
        description: `Successfully scheduled ${selected.length} posts for ${new Date(scheduledTime).toLocaleString()}.`,
      });
      setCsvData([]);
      setSelectedRows(new Set());
      setScheduleMode(false);
      setScheduledTime("");
      handleDialogClose();
    } catch (error) {
      toast({
        title: "Error scheduling posts",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CSV Bulk Upload & Post</DialogTitle>
          <DialogDescription>
            Upload a CSV file to publish content to multiple social media platforms at once.
          </DialogDescription>
        </DialogHeader>

        {csvData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                CSV should have columns: Platform, Content, ImageUrl (optional), Hashtags (optional), ScheduledTime (optional)
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input">
              <Button asChild variant="outline" className="cursor-pointer">
                <span>Select CSV File</span>
              </Button>
            </label>

            {errors.length > 0 && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-5">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-5">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Posts Preview</CardTitle>
                    <CardDescription>
                      {selectedRows.size} of {csvData.length} posts selected
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedRows.size === csvData.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {csvData.map((row, index) => (
                    <Card
                      key={row.id}
                      className={`p-3 cursor-pointer transition-all ${
                        selectedRows.has(index)
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => toggleRowSelection(index)}
                    >
                      <div className="flex gap-3">
                        <Checkbox
                          checked={selectedRows.has(index)}
                          onCheckedChange={() => toggleRowSelection(index)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="capitalize">
                              {row.platform}
                            </Badge>
                            {row.imageUrl && (
                              <Badge variant="outline" className="text-xs">
                                📸 Image
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {row.content}
                          </p>
                          {row.hashtags && (
                            <p className="text-xs text-blue-500 mt-1 truncate">
                              {row.hashtags}
                            </p>
                          )}
                          {row.scheduledTime && (
                            <p className="text-xs text-amber-600 mt-1">
                              📅 {new Date(row.scheduledTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {!scheduleMode && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setScheduleMode(true)}
                >
                  Schedule for Later
                </Button>
              </div>
            )}

            {scheduleMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setScheduleMode(false);
                      setScheduledTime("");
                    }}
                  >
                    Cancel Scheduling
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          {csvData.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setCsvData([]);
                  setSelectedRows(new Set());
                  setScheduleMode(false);
                  setScheduledTime("");
                }}
              >
                Clear
              </Button>
              {!scheduleMode && (
                <Button
                  onClick={handlePostNow}
                  disabled={isLoading || selectedRows.size === 0}
                  className="gap-2"
                >
                  {isLoading ? "Publishing..." : "Post Now"}
                </Button>
              )}
              {scheduleMode && (
                <Button
                  onClick={handleSchedulePosts}
                  disabled={isLoading || selectedRows.size === 0 || !scheduledTime}
                  className="gap-2"
                >
                  {isLoading ? "Scheduling..." : "Schedule Posts"}
                </Button>
              )}
            </>
          )}
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadBulkPoster;
