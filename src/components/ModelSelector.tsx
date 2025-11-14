import React, { useState } from "react";
import { MODEL_CONFIGS, AIModelProvider } from "@/types/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  showDetails?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  showDetails = false,
}) => {
  const selectedModel = MODEL_CONFIGS[value];
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  const getProviderColor = (provider: AIModelProvider) => {
    switch (provider) {
      case "gemini":
        return "bg-blue-100 text-blue-800";
      case "groq":
        return "bg-purple-100 text-purple-800";
      case "vertex-ai":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProviderLabel = (provider: AIModelProvider) => {
    switch (provider) {
      case "gemini":
        return "Google Gemini";
      case "groq":
        return "Groq";
      case "vertex-ai":
        return "Vertex AI";
      default:
        return provider;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">AI Model</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent className="max-h-96">
            {Object.values(MODEL_CONFIGS).map((model) => (
              <TooltipProvider key={model.id}>
                <SelectItem value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.icon}</span>
                    <span>{model.displayName}</span>
                  </div>
                </SelectItem>
              </TooltipProvider>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedModel && showDetails && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedModel.icon}</span>
                  <CardTitle className="text-lg">{selectedModel.displayName}</CardTitle>
                </div>
                <CardDescription>{selectedModel.description}</CardDescription>
              </div>
              <Badge className={getProviderColor(selectedModel.provider)}>
                {getProviderLabel(selectedModel.provider)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Speed Score */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <span>⚡ Speed</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Inference speed: 1=Slow, 5=Very Fast</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded ${
                        i < selectedModel.speedScore ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Quality Score */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <span>✨ Quality</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Output quality: 1=Basic, 5=Excellent</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded ${
                        i < selectedModel.qualityScore ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cost and Tokens */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Cost (per 1K tokens)</p>
                <p className="text-sm font-semibold">
                  {selectedModel.costPer1kTokens === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${selectedModel.costPer1kTokens.toFixed(4)}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Tokens</p>
                <p className="text-sm font-semibold">{selectedModel.maxTokens.toLocaleString()}</p>
              </div>
            </div>

            {/* Capabilities */}
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {selectedModel.capabilities.textGeneration && (
                  <Badge variant="secondary" className="text-xs">
                    📝 Text
                  </Badge>
                )}
                {selectedModel.capabilities.imageAnalysis && (
                  <Badge variant="secondary" className="text-xs">
                    🖼️ Images
                  </Badge>
                )}
                {selectedModel.capabilities.codeGeneration && (
                  <Badge variant="secondary" className="text-xs">
                    💻 Code
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelSelector;
