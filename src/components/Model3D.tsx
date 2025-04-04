
import React, { useState, useEffect,useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Circles } from 'react-loader-spinner';
import { OrbitControls, ContactShadows, Environment, Bounds } from '@react-three/drei';
import FurnitureModel from './FurnitureModel';
import ViewerControls from './ViewerControls';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import { Client, Storage, ID } from 'appwrite';



//appwrite 
const appwrite = new Client();
appwrite
  .setEndpoint('https://cloud.appwrite.io/v1') 
  .setProject('67ebffb60035df3d18be'); 
const storage = new Storage(appwrite);


// This component provides access to the camera and controls
const ControlsExposer = () => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    // Make camera and controls available to the ViewerControls component
    window.sceneCamera = camera;
    window.sceneControls = controls;
  }, [camera, controls]);
  
  return null;
};

// Function to export the configured model as GLB
// const exportConfiguredModel = async (sceneObj) => {
//   if (!sceneObj) {
//     console.error('No scene object provided for export');
//     return null;
//   }

//   return new Promise((resolve, reject) => {
//     const exporter = new GLTFExporter();
    
//     // Export options to ensure materials and textures are included
//     const options = {
//       binary: true, // Export as GLB (binary) instead of GLTF (JSON)
//       includeCustomExtensions: true,
//       animations: [],
//       onlyVisible: true
//     };
    
//     try {
//       exporter.parse(
//         sceneObj,
//         (gltf) => {
//           // Create a Blob from the binary GLB data
//           const blob = new Blob([gltf], { type: 'application/octet-stream' });
//           resolve(blob);
//         },
//         (error) => {
//           console.error('GLTFExporter error:', error);
//           reject(error);
//         },
//         options
//       );
//     } catch (err) {
//       console.error('Error during GLTF export:', err);
//       reject(err);
//     }
//   });
// };



const SceneExporter = ({ onExportStart, onExportComplete, onExportError }) => {
  const { scene, gl } = useThree();

  useEffect(() => {
    window.exportScene = async () => {
      try {
        onExportStart();
        gl.render(scene, window.sceneCamera);
        const glbBlob = await exportSceneWithTextureProcessing(scene);
        const url = URL.createObjectURL(glbBlob);
        onExportComplete(glbBlob, url);
        return { blob: glbBlob, url };
      } catch (error) {
        console.error("Export error:", error);
        onExportError(error);
        throw error;
      }
    };
    return () => {
      delete window.exportScene;
    };
  }, [scene, gl, onExportStart, onExportComplete, onExportError]);

  const textureToCanvas = async (texture, maxSize = 1024) => {
    return new Promise((resolve) => {
      if (!texture || !texture.image) return resolve(null);
      const image = texture.image;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Downscale texture to maxSize while maintaining aspect ratio
      let width = image.width || 1;
      let height = image.height || 1;
      if (width > maxSize || height > maxSize) {
        const aspect = width / height;
        if (width > height) {
          width = maxSize;
          height = Math.round(maxSize / aspect);
        } else {
          height = maxSize;
          width = Math.round(maxSize * aspect);
        }
      }
      canvas.width = width;
      canvas.height = height;

      if (image instanceof HTMLImageElement || image instanceof Image) {
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas);
      } else if (image instanceof HTMLCanvasElement) {
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas);
      } else if (image instanceof ImageBitmap) {
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas);
      } else {
        resolve(canvas); // Fallback to blank canvas
      }
    });
  };

  const processMaterial = async (material) => {
    if (!material) return;
    const textureProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap']; // Reduced texture properties
    for (const prop of textureProps) {
      if (material[prop] && material[prop].isTexture) {
        const canvas = await textureToCanvas(material[prop], 1024); // Max 1024px
        if (canvas) {
          const newTexture = new THREE.Texture(canvas);
          newTexture.wrapS = material[prop].wrapS;
          newTexture.wrapT = material[prop].wrapT;
          newTexture.flipY = material[prop].flipY;
          newTexture.needsUpdate = true;
          material[prop] = newTexture;
        }
      }
    }
    material.needsUpdate = true;
  };

  const prepareSceneForExport = async (originalScene) => {
    const exportScene = originalScene.clone(false);
    const processObject = async (original, parent) => {
      const cloned = original.clone(false);
      if (cloned.material) {
        if (Array.isArray(cloned.material)) {
          for (let i = 0; i < cloned.material.length; i++) {
            await processMaterial(cloned.material[i]);
          }
        } else {
          await processMaterial(cloned.material);
        }
      }
      if (parent) parent.add(cloned);
      else exportScene.add(cloned);
      if (original.children) {
        for (const child of original.children) {
          await processObject(child, cloned);
        }
      }
      return cloned;
    };
    for (const child of originalScene.children) {
      await processObject(child);
    }
    return exportScene;
  };

  const exportSceneWithTextureProcessing = async (sceneToExport) => {
    const preparedScene = await prepareSceneForExport(sceneToExport);
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      const options = {
        binary: true,
        includeCustomExtensions: false, // Remove custom extensions
        animations: [], // Exclude animations unless needed
        onlyVisible: true,
        embedImages: true,
        maxTextureSize: 1024, // Limit texture size
        forcePowerOfTwoTextures: true, // Optimize texture memory
        trs: false, // Use matrix instead of TRS for smaller files
        // Add Draco compression
        dracoOptions: {
          compressionLevel: 7, // 0-10, higher = more compression
        },
      };
      exporter.parse(
        preparedScene,
        (gltf) => {
          const blob = new Blob([gltf], { type: 'application/octet-stream' });
          resolve(blob);
        },
        (error) => reject(error),
        options
      );
    });
  };

  return null;
};


// const Model3D = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isExporting, setIsExporting] = useState(false);
//   const [background, setBackground] = useState('light');
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [exportError, setExportError] = useState(null);
//   const [modelUrl, setModelUrl] = useState(null);

//   // Simulate loading time
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 1500);
//     return () => clearTimeout(timer);
//   }, []);

//   // Log modelUrl state changes and clean up when component unmounts
//   useEffect(() => {
//     if (modelUrl) {
//       console.log("✅ modelUrl state updated:", modelUrl);
//     }
    
//     return () => {
//       if (modelUrl) {
//         console.log("Cleaning up modelUrl:", modelUrl);
//         URL.revokeObjectURL(modelUrl);
//       }
//     };
//   }, [modelUrl]);

//   const handleExportDownload = async () => {
//     setExportError(null);
//     setIsExporting(true);
  
//     try {
//       if (!window.exportScene) {
//         throw new Error('Export functionality not available');
//       }
  
//       // Export the GLB blob
//       const { blob } = await window.exportScene();
  
//       // Create a File object
//       const file = new File([blob], `custom-configured-model${Math.random()*1000}.glb`, { type: 'model/gltf-binary' });
  
//       // Upload to Appwrite bucket
//       const uploadedFile = await storage.createFile(
//         '67ec002100025524dd4b', // your bucket ID
//         ID.unique(),            // generates a unique file ID
//         file
//       );
  
//       console.log('File uploaded:', uploadedFile);
  
//       // Generate public URL (this assumes your bucket has public access for read)
//       const fileUrl = storage.getFileView(
//         '67ec002100025524dd4b', // same bucket ID
//         uploadedFile.$id        // ID returned by createFile
//       );
  
//       // Save the URL to localStorage
//       console.log('File URL:', fileUrl);
//       localStorage.setItem('exportedModelURL', fileUrl);
  
//       console.log('Public file URL saved to localStorage:', fileUrl);
//       setIsExporting(false);
//     } catch (error) {
//       console.error('Export failed:', error);
//       setExportError(error.message || 'Export failed');
//       setIsExporting(false);
//     }
//   };
    
//   const setBackgroundSetting = (setting) => {
//     setBackground(setting);
//   };

//   // Function to toggle fullscreen
//   const toggleFullscreen = () => {
//     setIsFullscreen(!isFullscreen);
//     // Add actual fullscreen implementation if needed
//   };

//   // Provide context values to ViewerControls
//   useEffect(() => {
//     // Mocking the ConfiguratorContext for ViewerControls
//     window.configuratorState = {
//       state: {
//         backgroundSetting: background,
//         isFullscreen: isFullscreen
//       },
//       setBackgroundSetting: setBackgroundSetting,
//       toggleFullscreen: toggleFullscreen
//     };
//   }, [background, isFullscreen]);

//   // Background color based on setting
//   const getBackgroundColor = () => {
//     switch(background) {
//       case 'dark': return '#333333';
//       case 'gradient': return 'linear-gradient(to bottom, #4a6fa5, #c4e0e5)';
//       default: return '#f5f5f5';
//     }
//   };

//   return (
//     <div className={`h-full w-full relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} 
//          style={{background: getBackgroundColor()}}>
//       {isLoading ? (
//         <div className="h-full w-full flex items-center justify-center bg-gray-100">
//           <Circles
//             height="80"
//             width="80"
//             color="#4fa94d"
//             ariaLabel="circles-loading"
//             visible={true}
//           />
//         </div>
//       ) : (
//         <>
//           <div className="absolute bottom-10 right-4 flex flex-col space-y-3 z-10">
//             <button 
//               className="px-6 py-3 rounded-lg bg-transparent text-black border-1 border-black flex items-center justify-center gap-2 shadow-md transition-all duration-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
//               onClick={handleExportDownload}
//               disabled={isExporting}
//             >
//               {isExporting ? (
//                 <>
//                   <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Exporting...
//                 </>
//               ) : 'Download GLB'}
//             </button>
//           </div>
          
//           {exportError && (
//             <div className="absolute top-24 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md z-10 max-w-md">
//               <p className="font-bold">Export Error</p>
//               <p>{exportError}</p>
//             </div>
//           )}
          
//           <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
//             <ambientLight intensity={0.5} />
//             <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
//             <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
//             <FurnitureModel />
            
//             <ContactShadows
//               position={[0, -0.1, 0]}
//               opacity={0.75}
//               scale={10}
//               blur={2.5}
//               far={4}
//             />
//             <Environment preset="city" />
            
//             <OrbitControls 
//               enablePan={true} 
//               enableZoom={true} 
//               enableRotate={true} 
//               minDistance={2} 
//               maxDistance={7} 
//             />
//             <ControlsExposer />
//             <SceneExporter 
//               onExportStart={() => setIsExporting(true)}
//               onExportComplete={(blob, url) => {
//                 setIsExporting(false);
//                 console.log("Export completed in SceneExporter callback");
//               }}
//               onExportError={(error) => {
//                 setIsExporting(false);
//                 setExportError(error.message || 'Export failed');
//               }}
//             />
//           </Canvas>
          
//           {/* Position the controls */}
//           <div className="absolute top-4 right-4">
//             <ViewerControls />
//           </div>
          
         
          
//         </>
//       )}
//     </div>
//   );
// };
// export default Model3D;


const Model3D = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [background, setBackground] = useState('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const [showARView, setShowARView] = useState(false);
  const modelViewerRef = useRef(null);

  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Check if localStorage has a saved model URL on component mount
  useEffect(() => {
    const savedModelUrl = localStorage.getItem('exportedModelURL');
    if (savedModelUrl) {
      setModelUrl(savedModelUrl);
    }
  }, []);

  // Log modelUrl state changes and clean up when component unmounts
  useEffect(() => {
    if (modelUrl) {
      console.log("✅ modelUrl state updated:", modelUrl);
    }
    
    return () => {
      if (modelUrl) {
        console.log("Cleaning up modelUrl:", modelUrl);
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  // Load model-viewer web component script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js';
    script.type = 'module';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleExportDownload = async () => {
    setExportError(null);
    setIsExporting(true);
  
    try {
      if (!window.exportScene) {
        throw new Error('Export functionality not available');
      }
  
      // Export the GLB blob
      const { blob } = await window.exportScene();
  
      // Create a File object
      const file = new File([blob], `custom-configured-model${Math.random()*1000}.glb`, { type: 'model/gltf-binary' });
  
      // Upload to Appwrite bucket
      const uploadedFile = await storage.createFile(
        '67ec002100025524dd4b', // your bucket ID
        ID.unique(),            // generates a unique file ID
        file
      );
  
      console.log('File uploaded:', uploadedFile);
  
      // Generate public URL (this assumes your bucket has public access for read)
      const fileUrl = storage.getFileView(
        '67ec002100025524dd4b', // same bucket ID
        uploadedFile.$id        // ID returned by createFile
      );
  
      // Save the URL to localStorage
      console.log('File URL:', fileUrl);
      localStorage.setItem('exportedModelURL', fileUrl);
      
      // Set model URL in state
      setModelUrl(fileUrl);
      
      // Show AR view after successful export
      setShowARView(true);
  
      console.log('Public file URL saved to localStorage:', fileUrl);
      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error.message || 'Export failed');
      setIsExporting(false);
    }
  };
    
  const setBackgroundSetting = (setting) => {
    setBackground(setting);
  };

  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Add actual fullscreen implementation if needed
  };

  // Function to close AR view
  const closeARView = () => {
    setShowARView(false);
  };

  // Provide context values to ViewerControls
  useEffect(() => {
    // Mocking the ConfiguratorContext for ViewerControls
    window.configuratorState = {
      state: {
        backgroundSetting: background,
        isFullscreen: isFullscreen
      },
      setBackgroundSetting: setBackgroundSetting,
      toggleFullscreen: toggleFullscreen
    };
  }, [background, isFullscreen]);

  // Background color based on setting
  const getBackgroundColor = () => {
    switch(background) {
      case 'dark': return '#333333';
      case 'gradient': return 'linear-gradient(to bottom, #4a6fa5, #c4e0e5)';
      default: return '#f5f5f5';
    }
  };

  // Function to determine if user is on mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <div className={`h-full w-full relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} 
         style={{background: getBackgroundColor()}}>
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <Circles
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="circles-loading"
            visible={true}
          />
        </div>
      ) : (
        <>
          <div className="absolute bottom-10 right-4 flex flex-col space-y-3 z-10">
            <button 
              className="px-6 py-3 rounded-lg bg-transparent text-black border-1 border-black flex items-center justify-center gap-2 shadow-md transition-all duration-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExportDownload}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : 'Download GLB'}
            </button>
          </div>
          
          {exportError && (
            <div className="absolute top-24 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md z-10 max-w-md">
              <p className="font-bold">Export Error</p>
              <p>{exportError}</p>
            </div>
          )}
          
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Bounds>
              <FurnitureModel />
            </Bounds>  
            
            <ContactShadows
              position={[0, -0.1, 0]}
              opacity={0.75}
              scale={10}
              blur={2.5}
              far={4}
            />
            <Environment preset="city" />
            
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true} 
              minDistance={2} 
              maxDistance={7} 
            />
            <ControlsExposer />
            <SceneExporter 
              onExportStart={() => setIsExporting(true)}
              onExportComplete={(blob, url) => {
                setIsExporting(false);
                console.log("Export completed in SceneExporter callback");
              }}
              onExportError={(error) => {
                setIsExporting(false);
                setExportError(error.message || 'Export failed');
              }}
            />
          </Canvas>
          
          {/* Position the controls */}
          <div className="absolute top-4 right-4">
            <ViewerControls />
          </div>

          {/* AR View Popup Modal */}
          {showARView && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="relative bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-xl font-semibold">3D Model Viewer</h3>
                  <button 
                    className="p-2 rounded-full hover:bg-gray-200"
                    onClick={closeARView}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                {/* Modal Body with model-viewer */}
                <div className="flex-grow relative">
                  <model-viewer
                      ref={modelViewerRef}
                      src={modelUrl}
                      ar
                      ar-modes="webxr scene-viewer quick-look"
                      camera-controls
                      ar-scale="auto"
                      auto-rotate
                      shadow-intensity="1"
                      shadow-softness="1"
                      environment-image="neutral"
                      exposure="0.9"
                      style={{ width: '100%', height: '100%' }}
                      camera-orbit="0deg 75deg 3m"
                      field-of-view="30deg"
                      min-camera-orbit="auto auto 2m"
                      max-camera-orbit="auto auto 6m"
                      autoplay
                      tone-mapping="commerce"
                      interaction-prompt="auto"
                      interaction-prompt-style="basic"
                    >
                      {/* Custom AR Button */}
                      {/* <button 
                        slot="ar-button" 
                        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg bg-blue-500 text-white flex items-center justify-center gap-2 shadow-md hover:bg-blue-600"
                      >
                        {isMobile() ? 'View in Your Space' : 'View in AR'}
                      </button>

                      {/* Optional Loading Indicator */}
                      {/*<div slot="progress-bar" className="w-full h-1 bg-gray-200">
                        <div className="h-1 bg-blue-500 animate-pulse" style={{ width: '50%' }}></div>
                      </div> */}
                    </model-viewer>
                </div>
                
                {/* Mobile specific controls for AR */}
                {/* {isMobile() && (
                  <div className="p-4 border-t flex justify-center">
                    <button 
                      className="px-6 py-3 rounded-lg bg-green-500 text-white flex items-center justify-center gap-2 shadow-md hover:bg-green-600"
                      onClick={() => {
                        if (modelViewerRef.current) {
                          modelViewerRef.current.activateAR();
                        }
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 9C21 7.89543 20.1046 7 19 7H5C3.89543 7 3 7.89543 3 9V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M6 19C6 19 6 19.5 6 20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20C18 19.5 18 19 18 19" stroke="currentColor" strokeWidth="2" />
                        <path d="M14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V7H14V5Z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      View in Your Space
                    </button>
                  </div>
                )} */}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Model3D;