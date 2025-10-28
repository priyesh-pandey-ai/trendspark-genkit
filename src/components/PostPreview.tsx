import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface PostPreviewProps {
  platform: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

const PostPreview = ({ platform, hook, body, cta, hashtags }: PostPreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getCharCount = () => {
    const fullText = `${hook} ${body} ${cta} ${hashtags.join(' ')}`;
    return fullText.length;
  };

  const getCharLimit = () => {
    switch (platform) {
      case 'Twitter': return 280;
      case 'Instagram': return 2200;
      case 'LinkedIn': return 3000;
      case 'Facebook': return 63206;
      case 'TikTok': return 2200;
      default: return 2200;
    }
  };

  const getCharIndicator = () => {
    const count = getCharCount();
    const limit = getCharLimit();
    const percentage = (count / limit) * 100;

    if (percentage <= 70) return 'text-green-500';
    if (percentage <= 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const downloadAsImage = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${platform.toLowerCase()}-post-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);

          toast({
            title: "Downloaded",
            description: "Post preview saved as image",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not generate image",
        variant: "destructive",
      });
    }
  };

  const renderInstagramPreview = () => (
    <div ref={previewRef} className="bg-white text-black p-6 rounded-lg border-2 border-gray-200 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
        <div>
          <div className="font-semibold text-sm">Your Brand</div>
          <div className="text-xs text-gray-500">{platform}</div>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-bold text-lg">{hook}</h3>
        <p className="text-sm whitespace-pre-wrap">{body}</p>
        <p className="text-sm font-semibold text-blue-600">{cta}</p>
        <p className="text-xs text-blue-500">{hashtags.join(' ')}</p>
      </div>
    </div>
  );

  const renderLinkedInPreview = () => (
    <div ref={previewRef} className="bg-white text-black p-6 rounded-lg border-2 border-gray-200 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-sm bg-blue-700 flex items-center justify-center text-white font-bold">
          YB
        </div>
        <div>
          <div className="font-semibold">Your Brand</div>
          <div className="text-xs text-gray-500">Professional Profile • 1st</div>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-base">{hook}</h3>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{body}</p>
        <div className="pt-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            {cta}
          </Button>
        </div>
        <p className="text-xs text-blue-600">{hashtags.join(' ')}</p>
      </div>
    </div>
  );

  const renderTwitterPreview = () => (
    <div ref={previewRef} className="bg-white text-black p-6 rounded-lg border-2 border-gray-200 max-w-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-400"></div>
        <div>
          <div className="font-bold text-sm">Your Brand</div>
          <div className="text-xs text-gray-500">@yourbrand</div>
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-bold text-sm">{hook}</p>
        <p className="text-sm whitespace-pre-wrap">{body}</p>
        <p className="text-sm text-blue-500">{cta}</p>
        <p className="text-xs text-blue-500">{hashtags.join(' ')}</p>
      </div>
    </div>
  );

  const renderDefaultPreview = () => (
    <div ref={previewRef} className="bg-white text-black p-6 rounded-lg border-2 border-gray-200 max-w-md">
      <div className="space-y-3">
        <div className="text-xs font-semibold text-gray-500 uppercase">{platform}</div>
        <h3 className="font-bold text-lg">{hook}</h3>
        <p className="text-sm whitespace-pre-wrap">{body}</p>
        <p className="text-sm font-semibold text-primary">{cta}</p>
        <p className="text-xs text-secondary">{hashtags.join(' ')}</p>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (platform) {
      case 'Instagram': return renderInstagramPreview();
      case 'LinkedIn': return renderLinkedInPreview();
      case 'Twitter': return renderTwitterPreview();
      default: return renderDefaultPreview();
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-semibold">{platform} Preview</h4>
          <p className={`text-xs ${getCharIndicator()}`}>
            {getCharCount()} / {getCharLimit()} characters
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadAsImage}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      <div className="flex justify-center">
        {renderPreview()}
      </div>
    </Card>
  );
};

export default PostPreview;
