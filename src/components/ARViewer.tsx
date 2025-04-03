import React, { useEffect, useState, useRef } from 'react';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { useConfigurator } from '../contexts/ConfiguratorContext';

const ARViewer = ({ visible, scene, onClose }) => {
  const { state } = useConfigurator();
  const [arModelURL, setArModelURL] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [arSupported, setArSupported] = useState(false);
  const modelViewerRef = useRef(null);

  // Check if AR is supported
  useEffect(() => {
    if (window.navigator.xr) {
      window.navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => setArSupported(supported))
        .catch(() => setArSupported(false));
    } else {
      // Check for Quick Look (iOS) or Scene Viewer (Android)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/i.test(navigator.userAgent);
      setArSupported(isIOS || isAndroid);
    }
  }, []);

  // Function to export the configured model as GLB
  const exportConfiguredModel = async (sceneObj) => {
    if (!sceneObj) {
      console.error('No scene object provided for export');
      return null;
    }

    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      
      // Export options to ensure materials and textures are included
      const options = {
        binary: true, // Export as GLB (binary) instead of GLTF (JSON)
        includeCustomExtensions: true,
        animations: [],
        onlyVisible: true
      };
      
      try {
        exporter.parse(
          sceneObj,
          (gltf) => {
            // Create a Blob from the binary GLB data
            const blob = new Blob([gltf], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            resolve(url);
          },
          (error) => {
            console.error('GLTFExporter error:', error);
            reject(error);
          },
          options
        );
      } catch (err) {
        console.error('Error during GLTF export:', err);
        reject(err);
      }
    });
  };

  // Generate model when scene changes or configuration updates
  useEffect(() => {
    if (!visible || !scene) return;
    
    setIsLoading(true);
    
    const generateModel = async () => {
      try {
        // Ensure all model materials and textures are loaded before export
        if (scene) {
          // Create a snapshot of the current configuration
          const configSnapshot = {
            material: state.selectedMaterial,
            handle: state.selectedHandle,
            leg: state.selectedLeg,
            handleColor: state.handleColor
          };
          
          console.log('Exporting model with configuration:', configSnapshot);
          
          const url = await exportConfiguredModel(scene);
          if (url) {
            setArModelURL(url);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to generate AR model:', error);
        setIsLoading(false);
      }
    };

    generateModel();
    
    // Clean up the object URL when component unmounts or when the URL changes
    return () => {
      if (arModelURL) {
        URL.revokeObjectURL(arModelURL);
      }
    };
  }, [visible, scene, state.selectedMaterial, state.selectedHandle, state.selectedLeg, state.handleColor]);

  // Load the model-viewer component script dynamically
  useEffect(() => {
    if (!document.querySelector('script#model-viewer')) {
      const script = document.createElement('script');
      script.id = 'model-viewer';
      script.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
      script.type = 'module';
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">View in AR</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="relative w-full h-[calc(100%-8rem)]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Preparing your model for AR...</p>
              </div>
            </div>
          )}
          
          {arModelURL && (
            <model-viewer
              ref={modelViewerRef}
              src={arModelURL}
              poster="/placeholder-furniture.png"
              alt="3D furniture model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="fixed"
              camera-controls
              auto-rotate
              rotation-per-second="30deg"
              environment-image="neutral"
              exposure="1"
              shadow-intensity="1"
              shadow-softness="1"
              loading="eager"
              style={{ width: '100%', height: '100%', backgroundColor: '#f9f9f9' }}
            >
              {/* Loading UI */}
              <div slot="poster" className="flex items-center justify-center w-full h-full bg-gray-100">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading 3D model...</p>
                </div>
              </div>
              
              {/* AR Button - automatically shown when AR is supported */}
              <button slot="ar-button" className="ar-button">
                View in your space
              </button>
              
              <div className="progress-bar hide" slot="progress-bar">
                <div className="update-bar"></div>
              </div>
            </model-viewer>
          )}
          
          {!arSupported && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
              <div className="text-center p-8 max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">AR Not Available</h3>
                <p className="mt-2 text-gray-600">
                  Your device or browser doesn't support AR viewing. Please try with a compatible device.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {arSupported ? 'AR is available on your device' : 'AR is not supported on your device'}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Custom styles for the AR component */}
      <style jsx>{`
        .ar-button {
          background-color: #4285f4;
          border-radius: 4px;
          border: none;
          color: white;
          font-family: sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 24px;
          position: absolute;
          bottom: 16px;
          right: 16px;
        }
        
        .progress-bar {
          width: 100%;
          height: 4px;
          background-color: rgba(0, 0, 0, 0.1);
          position: absolute;
          bottom: 0;
          left: 0;
        }
        
        .update-bar {
          height: 100%;
          background-color: rgba(66, 133, 244, 0.8);
          width: 0%;
          transition: width 0.2s;
        }
        
        .hide {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ARViewer;