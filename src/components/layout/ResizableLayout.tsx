
import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Settings, Eye, EyeOff } from 'lucide-react';

interface ResizableLayoutProps {
  topContent: React.ReactNode;
  mainContent: React.ReactNode;
  bottomContent: React.ReactNode;
  defaultTopSize?: number;
  defaultBottomSize?: number;
}

export const ResizableLayout = ({ 
  topContent, 
  mainContent, 
  bottomContent,
  defaultTopSize = 15,
  defaultBottomSize = 25 
}: ResizableLayoutProps) => {
  const [showTop, setShowTop] = useState(true);
  const [showBottom, setShowBottom] = useState(true);
  const [topSize, setTopSize] = useState(defaultTopSize);
  const [bottomSize, setBottomSize] = useState(defaultBottomSize);

  const mainSize = 100 - (showTop ? topSize : 0) - (showBottom ? bottomSize : 0);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-end gap-2 p-2 border-b bg-background/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTop(!showTop)}
          className="text-xs"
        >
          {showTop ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          Top Bar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBottom(!showBottom)}
          className="text-xs"
        >
          {showBottom ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          Bottom Bar
        </Button>
      </div>

      <ResizablePanelGroup direction="vertical" className="flex-1">
        {showTop && (
          <>
            <ResizablePanel 
              defaultSize={topSize} 
              minSize={10} 
              maxSize={40}
              onResize={setTopSize}
            >
              {topContent}
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}
        
        <ResizablePanel defaultSize={mainSize} minSize={20}>
          {mainContent}
        </ResizablePanel>
        
        {showBottom && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel 
              defaultSize={bottomSize} 
              minSize={15} 
              maxSize={50}
              onResize={setBottomSize}
            >
              {bottomContent}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
