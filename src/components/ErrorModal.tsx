import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  errorDetails?: string;
  isRateLimit?: boolean;
  onClose: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
  retryLabel?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  title,
  description,
  errorDetails,
  isRateLimit = false,
  onClose,
  onRetry,
  showRetry = false,
  retryLabel = "Retry",
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className={`h-6 w-6 ${isRateLimit ? 'text-orange-500' : 'text-red-500'}`} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="space-y-3">
          <p>{description}</p>

          {isRateLimit && (
            <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800 border border-orange-200">
              <p className="font-semibold mb-1">Rate Limit Exceeded</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>You've exceeded the API rate limit</li>
                <li>Please wait a few moments before trying again</li>
                <li>The request will be retried automatically after the cooldown period</li>
              </ul>
            </div>
          )}

          {errorDetails && (
            <details className="text-xs">
              <summary className="cursor-pointer font-mono text-muted-foreground hover:text-foreground">
                Error Details
              </summary>
              <pre className="mt-2 bg-slate-100 p-2 rounded overflow-auto max-h-32 text-xs whitespace-pre-wrap break-words">
                {errorDetails}
              </pre>
            </details>
          )}
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          {showRetry && onRetry && (
            <AlertDialogAction
              onClick={onRetry}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorModal;
