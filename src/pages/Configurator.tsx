
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
              src="https://cdn.prod.website-files.com/65792fa13a1bbf4d8e520e33/65ddb66c43de033385b8502b_Delta-new-logo%20(1).avif" 
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


