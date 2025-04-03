
import React, { useRef, useState } from 'react';
import Model3D from '../components/Model3D';
import ViewerControls from '../components/ViewerControls';
import ConfiguratorPanel from '../components/ConfiguratorPanel';
import ARViewer from '../components/ARViewer';
import { ConfiguratorProvider } from '../contexts/ConfiguratorContext';
import { Smartphone } from 'lucide-react';

const Configurator: React.FC = () => {
  const [showAR, setShowAR] = useState(false);
  const configuredSceneRef = useRef();
  return (
    <ConfiguratorProvider>
      <div className="h-screen flex flex-col md:flex-row overflow-hidden">
        {/* 3D Viewer Section */}
        <div className="relative w-full md:w-2/3 h-1/2 md:h-full bg-gray-100">
          <Model3D ref={configuredSceneRef} />
          <ViewerControls />
          
          {/* AR View Button */}
          
          {/* Logo */}
          <div className="absolute top-6 left-6 z-10">
            <img 
              src="/lovable-uploads/dedfb04e-5d6b-4c3c-8b01-d257254d5d14.png" 
              alt="Ikarus Delta Logo" 
              className="h-8 w-auto"
            />
          </div>
        </div>
        
        {/* Configurator Panel */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-hidden">
          <ConfiguratorPanel />
        </div>
        
      {/* AR Viewer: Only shows when showAR is true */}
      {showAR && (
        <ARViewer 
          visible={showAR} 
          scene={configuredSceneRef.current} 
          onClose={() => setShowAR(false)}
        />
      )}
      </div>
    </ConfiguratorProvider>
  );
};

export default Configurator;


