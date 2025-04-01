
import { useState, useEffect } from 'react';
import { Plus, X, Info, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { Toaster } from "sonner";
import { useToast } from "@/hooks/use-toast";
import ModelViewer from '@/components/ModelViewer';
import ConfigPanel from '@/components/ConfigPanel';
import InfoPanel from '@/components/InfoPanel';
import Header from '@/components/Header';
import '@/styles/animations.css';

const Index = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    backgroundScene: 'sunset',
    meshMaterial: 'plastic',
    meshMetalness: 0.2,
    meshRoughness: 0.5,
    baseTexture: 'wood',
    baseMetalness: 0.1,
    baseRoughness: 0.8,
    animationPlaying: false,
    animationIndex: 0,
    rotation: 0,
    backgroundColor: '#f5f5f7'
  });
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check viewport size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowLeftPanel(false);
        setShowRightPanel(false);
      } else {
        setShowLeftPanel(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleConfigChange = (newConfig) => {
    setConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  };

  const handleModelUploaded = (url: string) => {
    setModelUrl(url);
    toast({
      title: "Model uploaded successfully",
      description: "Your 3D model is now ready to customize.",
      variant: "default"
    });
  };

  const handleToggleLeftPanel = () => {
    setShowLeftPanel(!showLeftPanel);
    if (isMobileView && !showLeftPanel) {
      setShowRightPanel(false);
    }
  };

  const handleToggleRightPanel = () => {
    setShowRightPanel(!showRightPanel);
    if (isMobileView && !showRightPanel) {
      setShowLeftPanel(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      <Header 
        onShowConfig={handleToggleLeftPanel} 
        onShowInfo={handleToggleRightPanel}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Config */}
        <div
          className={`${
            showLeftPanel 
              ? 'translate-x-0 shadow-lg'
              : '-translate-x-full md:translate-x-0 md:w-0'
          } fixed md:relative z-20 h-[calc(100vh-4rem)] bg-white w-[320px] transition-all duration-300 ease-in-out overflow-y-auto`}
        >
          <button
            onClick={handleToggleLeftPanel}
            className="absolute right-2 top-2 md:hidden bg-white rounded-full p-1 shadow-md z-10"
            aria-label="Close config panel"
          >
            <X size={20} />
          </button>
          <ConfigPanel onConfigChange={handleConfigChange} config={config} />
        </div>

        {/* Toggle button for Left Panel on small screens */}
        {!showLeftPanel && (
          <button
            onClick={handleToggleLeftPanel}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-r-md p-2 shadow-md z-10"
            aria-label="Open configuration panel"
          >
            <Settings size={20} />
          </button>
        )}

        {/* Main Content - 3D Viewer */}
        <div className="flex-1 overflow-hidden">
          <div className="w-full h-full">
            {modelUrl ? (
              <ModelViewer modelUrl={modelUrl} config={config} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                <div className="text-center p-8 max-w-md animate-fade-in">
                  <h2 className="text-2xl font-bold mb-4 text-neutral-800">Upload a 3D Model</h2>
                  <p className="text-neutral-600 mb-6">
                    Upload your 3D model to view, customize, and share it with the powerful shape-shifter toolkit.
                  </p>
                  <ModelViewer modelUrl={null} config={config} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Information */}
        <div
          className={`${
            showRightPanel 
              ? 'translate-x-0 shadow-lg' 
              : 'translate-x-full md:translate-x-0 md:w-0'
          } fixed md:relative right-0 z-20 h-[calc(100vh-4rem)] bg-white w-[320px] transition-all duration-300 ease-in-out overflow-y-auto`}
        >
          <button
            onClick={handleToggleRightPanel}
            className="absolute left-2 top-2 md:hidden bg-white rounded-full p-1 shadow-md z-10"
            aria-label="Close info panel"
          >
            <X size={20} />
          </button>
          <InfoPanel />
        </div>

        {/* Toggle button for Right Panel on small screens */}
        {!showRightPanel && (
          <button
            onClick={handleToggleRightPanel}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-l-md p-2 shadow-md z-10"
            aria-label="Open information panel"
          >
            <Info size={20} />
          </button>
        )}
      </div>

      <Toaster />
    </div>
  );
};

export default Index;
