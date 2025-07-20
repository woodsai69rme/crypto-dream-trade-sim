
import { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings, Eye, EyeOff, RotateCcw, Save, Monitor } from 'lucide-react';

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
  const [autoSave, setAutoSave] = useState(true);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);

  const mainSize = 100 - (showTop ? topSize : 0) - (showBottom ? bottomSize : 0);

  // Load saved layout preferences and saved layouts
  useEffect(() => {
    const saved = localStorage.getItem('resizableLayout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShowTop(parsed.showTop ?? true);
        setShowBottom(parsed.showBottom ?? true);
        setTopSize(parsed.topSize ?? defaultTopSize);
        setBottomSize(parsed.bottomSize ?? defaultBottomSize);
      } catch (error) {
        console.error('Error loading layout preferences:', error);
      }
    }

    // Load saved layouts
    const savedLayoutsData = localStorage.getItem('savedLayouts');
    if (savedLayoutsData) {
      try {
        const parsed = JSON.parse(savedLayoutsData);
        setSavedLayouts(parsed);
      } catch (error) {
        console.error('Error loading saved layouts:', error);
      }
    }
  }, [defaultTopSize, defaultBottomSize]);

  // Auto-save layout changes
  useEffect(() => {
    if (autoSave) {
      const layout = { showTop, showBottom, topSize, bottomSize };
      localStorage.setItem('resizableLayout', JSON.stringify(layout));
    }
  }, [showTop, showBottom, topSize, bottomSize, autoSave]);

  const resetLayout = () => {
    setShowTop(true);
    setShowBottom(true);
    setTopSize(defaultTopSize);
    setBottomSize(defaultBottomSize);
  };

  const saveCurrentLayout = () => {
    const layout = {
      id: Date.now(),
      name: `Layout ${new Date().toLocaleTimeString()}`,
      showTop,
      showBottom,
      topSize,
      bottomSize,
      timestamp: new Date().toISOString()
    };
    const newLayouts = [...savedLayouts, layout].slice(-5); // Keep last 5
    setSavedLayouts(newLayouts);
    localStorage.setItem('savedLayouts', JSON.stringify(newLayouts));
  };

  const loadLayout = (layout: any) => {
    setShowTop(layout.showTop);
    setShowBottom(layout.showBottom);
    setTopSize(layout.topSize);
    setBottomSize(layout.bottomSize);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Layout Controls</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTop(!showTop)}
            className="text-xs"
          >
            {showTop ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            Info Bar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBottom(!showBottom)}
            className="text-xs"
          >
            {showBottom ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            Summary
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-save Layout</span>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>

                {showTop && (
                  <div className="space-y-2">
                    <span className="text-sm">Top Bar Size: {topSize}%</span>
                    <Slider
                      value={[topSize]}
                      onValueChange={(value) => setTopSize(value[0])}
                      max={40}
                      min={10}
                      step={1}
                    />
                  </div>
                )}

                {showBottom && (
                  <div className="space-y-2">
                    <span className="text-sm">Bottom Bar Size: {bottomSize}%</span>
                    <Slider
                      value={[bottomSize]}
                      onValueChange={(value) => setBottomSize(value[0])}
                      max={50}
                      min={15}
                      step={1}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={resetLayout} size="sm" variant="outline" className="flex-1">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                  <Button onClick={saveCurrentLayout} size="sm" variant="outline" className="flex-1">
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>

                {savedLayouts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Saved Layouts</span>
                    {savedLayouts.map((layout) => (
                      <Button
                        key={layout.id}
                        onClick={() => loadLayout(layout)}
                        size="sm"
                        variant="ghost"
                        className="w-full justify-start text-xs"
                      >
                        {layout.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
