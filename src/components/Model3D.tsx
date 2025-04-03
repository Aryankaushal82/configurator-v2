// import React, { useState, useEffect } from 'react';
// import { Canvas, useThree } from '@react-three/fiber';
// import { Circles } from 'react-loader-spinner';
// import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
// import FurnitureModel from './FurnitureModel';
// import ViewerControls from './ViewerControls';
// import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
// import * as THREE from 'three';

// // This component provides access to the camera and controls
// const ControlsExposer = () => {
//   const { camera, controls } = useThree();
  
//   useEffect(() => {
//     // Make camera and controls available to the ViewerControls component
//     window.sceneCamera = camera;
//     window.sceneControls = controls;
//   }, [camera, controls]);
  
//   return null;
// };

// // Function to export the configured model as GLB
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


// // Replace your current SceneExporter component with this implementation:
// const SceneExporter = ({ onExportStart, onExportComplete, onExportError }) => {
//   const { scene, gl } = useThree();
  
//   // Import THREE at the top of your file if it's not already there
//   // import * as THREE from 'three';
  
//   useEffect(() => {
//     // Define the export function that will be called from the parent component
//     window.exportScene = async () => {
//       try {
//         onExportStart();
        
//         // Force the scene to render completely before export
//         gl.render(scene, window.sceneCamera);
        
//         // Use the inline exportConfiguredModel function
//         const glbBlob = await exportSceneWithTextureProcessing(scene);
//         const url = URL.createObjectURL(glbBlob);
//         console.log("GLB Blob URL:", url);

//         onExportComplete(glbBlob, url);
//         return { blob: glbBlob, url };
//       } catch (error) {
//         console.error("Export error:", error);
//         onExportError(error);
//         throw error;
//       }
//     };
    
//     // Cleanup
//     return () => {
//       delete window.exportScene;
//     };
//   }, [scene, gl, onExportStart, onExportComplete, onExportError]);
  
//   /**
//    * Converts a THREE.js texture to a canvas that can be safely exported
//    */
//   const textureToCanvas = async (texture) => {
//     return new Promise((resolve) => {
//       try {
//         // Skip invalid textures
//         if (!texture || !texture.image) {
//           return resolve(null);
//         }
        
//         const image = texture.image;
        
//         // Create a canvas and get its 2D context
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         if (!ctx) {
//           console.warn('Could not get 2D context for texture conversion');
//           return resolve(null);
//         }
        
//         // Set canvas dimensions to match the image
//         canvas.width = image.width || 1;
//         canvas.height = image.height || 1;
        
//         // Different handling based on image type
//         if (image instanceof HTMLImageElement || image instanceof Image) {
//           // For regular images, draw directly to canvas
//           ctx.drawImage(image, 0, 0);
//           resolve(canvas);
//         } else if (image instanceof HTMLCanvasElement) {
//           // Canvas can be used directly
//           resolve(image);
//         } else if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
//           // For ImageBitmap, draw to canvas
//           ctx.drawImage(image, 0, 0);
//           resolve(canvas);
//         } else {
//           // For other formats, create a fallback
//           console.warn('Unsupported image type, creating fallback:', image);
//           // Just return the canvas (will be blank but valid for export)
//           resolve(canvas);
//         }
//       } catch (error) {
//         console.error('Error converting texture to canvas:', error);
//         // Return a blank canvas rather than failing completely
//         const fallbackCanvas = document.createElement('canvas');
//         fallbackCanvas.width = 1;
//         fallbackCanvas.height = 1;
//         resolve(fallbackCanvas);
//       }
//     });
//   };

//   /**
//    * Processes a material to ensure its textures are exportable
//    */
//   const processMaterial = async (material) => {
//     if (!material) return;
    
//     // Handle standard materials
//     const textureProps = [
//       'map', 'normalMap', 'bumpMap', 'displacementMap', 
//       'roughnessMap', 'metalnessMap', 'alphaMap', 
//       'aoMap', 'emissiveMap', 'envMap', 'lightMap',
//       'specularMap', 'specularIntensityMap'
//     ];
    
//     for (const prop of textureProps) {
//       if (material[prop] && material[prop].isTexture) {
//         try {
//           const canvas = await textureToCanvas(material[prop]);
          
//           if (canvas) {
//             // Save original texture properties
//             const original = material[prop];
            
//             // Create a new texture from the canvas
//             const newTexture = new THREE.Texture(canvas);
            
//             // Copy ALL essential texture properties from the original texture
//             newTexture.wrapS = original.wrapS;
//             newTexture.wrapT = original.wrapT;
//             newTexture.magFilter = original.magFilter;
//             newTexture.minFilter = original.minFilter;
//             newTexture.mapping = original.mapping;
//             newTexture.offset.copy(original.offset);
//             newTexture.repeat.copy(original.repeat);
//             newTexture.center.copy(original.center);
//             newTexture.rotation = original.rotation;
//             newTexture.matrixAutoUpdate = original.matrixAutoUpdate;
//             newTexture.matrix.copy(original.matrix);
//             newTexture.generateMipmaps = original.generateMipmaps;
//             newTexture.premultiplyAlpha = original.premultiplyAlpha;
//             newTexture.flipY = original.flipY;
//             newTexture.unpackAlignment = original.unpackAlignment;
//             newTexture.encoding = original.encoding;
            
//             // Copy any custom userData if it exists
//             if (original.userData) {
//               newTexture.userData = JSON.parse(JSON.stringify(original.userData));
//             }
            
//             // Copy any channel encoding properties (for modern THREE.js)
//             if (original.colorSpace !== undefined) {
//               newTexture.colorSpace = original.colorSpace;
//             }
            
//             // Handle special properties for specific texture types
//             if (prop === 'normalMap' && material.normalScale) {
//               // Ensure normal map intensity is preserved
//               material.normalScale.copy(material.normalScale);
//             }
            
//             // Ensure the texture is marked as updated
//             newTexture.needsUpdate = true;
            
//             // Replace the original texture
//             material[prop] = newTexture;
//           }
//         } catch (error) {
//           console.error(`Error processing texture for property '${prop}':`, error);
//         }
//       }
//     }
    
//     // Force material update
//     material.needsUpdate = true;
//   };

//   /**
//    * Creates a clean copy of the scene with processed textures
//    */
//   const prepareSceneForExport = async (originalScene) => {
//     // Create a shallow clone of the scene
//     const exportScene = originalScene.clone(false);
    
//     // Function to process an object and its descendants
//     const processObject = async (original, parent) => {
//       // Clone the object (shallow clone)
//       const cloned = original.clone(false);
      
//       // If the object has material(s), process them
//       if (cloned.material) {
//         if (Array.isArray(cloned.material)) {
//           // Handle multi-material objects
//           for (let i = 0; i < cloned.material.length; i++) {
//             await processMaterial(cloned.material[i]);
//           }
//         } else {
//           // Handle single material objects
//           await processMaterial(cloned.material);
//         }
//       }
      
//       // Add the cloned object to its parent
//       if (parent) {
//         parent.add(cloned);
//       } else {
//         exportScene.add(cloned);
//       }
      
//       // Process children recursively
//       if (original.children && original.children.length > 0) {
//         for (const child of original.children) {
//           await processObject(child, cloned);
//         }
//       }
      
//       return cloned;
//     };
    
//     // Start processing from the scene's children
//     for (const child of originalScene.children) {
//       await processObject(child);
//     }
    
//     return exportScene;
//   };

//   /**
//    * Export the scene with texture processing
//    */
//   const exportSceneWithTextureProcessing = async (sceneToExport) => {
//     console.log("Starting export with texture processing...");
    
//     try {
//       // Prepare a clean scene with processed textures
//       const preparedScene = await prepareSceneForExport(sceneToExport);
      
//       return new Promise((resolve, reject) => {
//         const exporter = new GLTFExporter();
        
//         const options = {
//           binary: true,
//           includeCustomExtensions: true,
//           animations: [],
//           onlyVisible: true,
//           // Add extra options to ensure texture information is retained
//           embedImages: true,
//           forcePowerOfTwoTextures: false
//         };
        
//         exporter.parse(
//           preparedScene,
//           (gltf) => {
//             console.log("Export successful");
//             const blob = new Blob([gltf], { type: 'application/octet-stream' });
//             resolve(blob);
//           },
//           (error) => {
//             console.error('GLTFExporter error:', error);
//             reject(error);
//           },
//           options
//         );
//       });
//     } catch (error) {
//       console.error("Error preparing scene for export:", error);
//       throw error;
//     }
//   };
  
//   return null;
// };

// const ARViewerModal = ({ visible, modelUrl, onClose }) => {
//   const [arSupported, setArSupported] = useState(false);
//   console.log("model url",modelUrl);
//   console.log("Rendering model-viewer with modelUrl:", modelUrl);
//   // Check if AR is supported
//   useEffect(() => {
//     if (window.navigator.xr) {
//       window.navigator.xr.isSessionSupported('immersive-ar')
//         .then(supported => setArSupported(supported))
//         .catch(() => setArSupported(false));
//     } else {
//       // Check for Quick Look (iOS) or Scene Viewer (Android)
//       const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
//       const isAndroid = /Android/i.test(navigator.userAgent);
//       setArSupported(isIOS || isAndroid);
//     }
//   }, []);

//   // Load the model-viewer component script dynamically
//   useEffect(() => {
//     if (!document.querySelector('script#model-viewer')) {
//       const script = document.createElement('script');
//       script.id = 'model-viewer';
//       script.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
//       script.type = 'module';
//       document.body.appendChild(script);
      
//       return () => {
//         const existingScript = document.querySelector('script#model-viewer');
//         if (existingScript) {
//           document.body.removeChild(existingScript);
//         }
//       };
//     }
//   }, []);

//   if (!visible) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
//       <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden">
//         {/* Header */}
//         <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
//           <h3 className="text-lg font-medium">View in AR</h3>
//           <button 
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 focus:outline-none"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
        
//         {/* Content */}
//         <div className="relative w-full h-[calc(100%-8rem)]">
//           {modelUrl && (
//             <model-viewer
//               src={modelUrl}
//               poster="/placeholder-furniture.png"
//               alt="3D furniture model"
//               ar
//               ar-modes="webxr scene-viewer quick-look"
//               ar-scale="fixed"
//               camera-controls
//               auto-rotate
//               rotation-per-second="30deg"
//               environment-image="neutral"
//               exposure="1"
//               shadow-intensity="1"
//               shadow-softness="1"
//               loading="eager"
//               style={{ width: '100%', height: '100%', backgroundColor: '#f9f9f9' }}
//             >
//               {/* Loading UI */}
//               <div slot="poster" className="flex items-center justify-center w-full h-full bg-gray-100">
//                 <div className="flex flex-col items-center">
//                   <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                   <p className="mt-4 text-gray-600">Loading 3D model...</p>
//                 </div>
//               </div>
              
//               {/* AR Button - automatically shown when AR is supported */}
//               <button slot="ar-button" className="ar-button">
//                 View in your space
//               </button>
              
//               <div className="progress-bar hide" slot="progress-bar">
//                 <div className="update-bar"></div>
//               </div>
//             </model-viewer>
//           )}
          
//           {!arSupported && (
//             <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
//               <div className="text-center p-8 max-w-md">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                 </svg>
//                 <h3 className="mt-4 text-lg font-medium text-gray-900">AR Not Available</h3>
//                 <p className="mt-2 text-gray-600">
//                   Your device or browser doesn't support AR viewing. Please try with a compatible device.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
        
//         {/* Footer */}
//         <div className="bg-gray-100 px-6 py-4 border-t">
//           <div className="flex justify-between items-center">
//             <div className="text-sm text-gray-500">
//               {arSupported ? 'AR is available on your device' : 'AR is not supported on your device'}
//             </div>
//             <div className="flex space-x-4">
//               <button
//                 onClick={() => {
//                   // Create a download link
//                   const a = document.createElement('a');
//                   a.href = modelUrl;
//                   a.download = 'custom-configured-model.glb';
//                   document.body.appendChild(a);
//                   a.click();
//                   document.body.removeChild(a);
//                 }}
//                 className="px-4 py-2 bg-transparent text-black rounded-md hover:bg-slate-200 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
//               >
//                 Download GLB
//               </button>
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 bg-transparent text-black rounded-md hover:bg-slate-200 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Custom styles for the AR component */}
//       <style jsx>{`
//         .ar-button {
//           background-color: #4285f4;
//           border-radius: 4px;
//           border: none;
//           color: white;
//           font-family: sans-serif;
//           font-size: 14px;
//           font-weight: 500;
//           padding: 12px 24px;
//           position: absolute;
//           bottom: 16px;
//           right: 16px;
//         }
        
//         .progress-bar {
//           width: 100%;
//           height: 4px;
//           background-color: rgba(0, 0, 0, 0.1);
//           position: absolute;
//           bottom: 0;
//           left: 0;
//         }
        
//         .update-bar {
//           height: 100%;
//           background-color: rgba(66, 133, 244, 0.8);
//           width: 0%;
//           transition: width 0.2s;
//         }
        
//         .hide {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// const Model3D = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isExporting, setIsExporting] = useState(false);
//   const [background, setBackground] = useState('light');
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [exportError, setExportError] = useState(null);
//   const [showARViewer, setShowARViewer] = useState(false);
//   const [modelUrl, setModelUrl] = useState(null);
//   const [processingState, setProcessingState] = useState('idle'); // idle, exporting, viewing

//   // Simulate loading time
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 1500);
//     return () => clearTimeout(timer);
//   }, []);

//   // Clean up modelUrl when component unmounts
//   // useEffect(() => {
//   //   if (modelUrl) {
//   //     console.log("✅ modelUrl state updated:", modelUrl);
//   //   }
//   // }, [modelUrl]);

//   useEffect(() => {
//     return () => {
//       if (modelUrl) {
//         URL.revokeObjectURL(modelUrl);
//       }
//     };
//   }, [modelUrl]);

//   const handleViewInRoom = async () => {
//     setExportError(null);
//     setProcessingState('exporting');
    
//     try {
//       if (!window.exportScene) {
//         throw new Error('Export functionality not available');
//       }
      
//       // Use the function exposed by the SceneExporter component
//       const { url } = await window.exportScene();
//       console.log("url1: ",url);
//       setModelUrl(url);
//       console.log("Updated modelUrl state:", modelUrl);
//       setProcessingState('viewing');
//       setShowARViewer(true);
      
//     } catch (error) {
//       console.error('Export failed:', error);
//       setExportError(error.message || 'Export failed');
//       setProcessingState('idle');
//     }
//   };

//   const handleExportDownload = async () => {
//     setExportError(null);
    
//     try {
//       if (!window.exportScene) {
//         throw new Error('Export functionality not available');
//       }
      
//       // Use the function exposed by the SceneExporter component
//       const { blob, url } = await window.exportScene();
      
//       // Create a download link
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'custom-configured-model.glb';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
      
//       // Clean up
//       document.body.removeChild(a);
      
//     } catch (error) {
//       console.error('Export failed:', error);
//       setExportError(error.message || 'Export failed');
//     }
//   };

//   // Function to be passed to ViewerControls
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
//   <button 
//     className="px-6 py-3 rounded-lg bg-transparent text-black border-1 border-black flex items-center justify-center gap-2 shadow-md transition-all duration-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
//     onClick={handleViewInRoom}
//     disabled={processingState === 'exporting'}
//   >
//     {processingState === 'exporting' ? (
//       <>
//         <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"></circle>
//           <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8z"></path>
//         </svg>
//         Preparing AR...
//       </>
//     ) : 'View in Room (AR)'}
//   </button>

//   <button 
//     className="px-6 py-3 rounded-lg bg-transparent text-black border-1 border-black flex items-center justify-center gap-2 shadow-md transition-all duration-300 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
//     onClick={handleExportDownload}
//     disabled={isExporting}
//   >
//     {isExporting ? (
//       <>
//         <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"></circle>
//           <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8z"></path>
//         </svg>
//         Exporting...
//       </>
//     ) : 'Download GLB'}
//   </button>
// </div>


          
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
          
//           {/* AR Viewer Modal */}
//           <ARViewerModal 
//             visible={showARViewer} 
//             modelUrl={modelUrl}
//             onClose={() => {
//               setShowARViewer(false);
//               setProcessingState('idle');
//             }}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default Model3D;



import React, { useState, useEffect,useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Circles } from 'react-loader-spinner';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import FurnitureModel from './FurnitureModel';
import ViewerControls from './ViewerControls';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';

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
          resolve(blob);
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


// Replace your current SceneExporter component with this implementation:
// const SceneExporter = ({ onExportStart, onExportComplete, onExportError }) => {
//   const { scene, gl } = useThree();
  
//   // Import THREE at the top of your file if it's not already there
//   // import * as THREE from 'three';
  
//   useEffect(() => {
//     // Define the export function that will be called from the parent component
//     window.exportScene = async () => {
//       try {
//         onExportStart();
        
//         // Force the scene to render completely before export
//         gl.render(scene, window.sceneCamera);
        
//         // Use the inline exportConfiguredModel function
//         const glbBlob = await exportSceneWithTextureProcessing(scene);
//         const url = URL.createObjectURL(glbBlob);
//         console.log("GLB Blob URL:", url);

//         onExportComplete(glbBlob, url);
//         return { blob: glbBlob, url };
//       } catch (error) {
//         console.error("Export error:", error);
//         onExportError(error);
//         throw error;
//       }
//     };
    
//     // Cleanup
//     return () => {
//       delete window.exportScene;
//     };
//   }, [scene, gl, onExportStart, onExportComplete, onExportError]);
  
//   /**
//    * Converts a THREE.js texture to a canvas that can be safely exported
//    */
//   const textureToCanvas = async (texture) => {
//     return new Promise((resolve) => {
//       try {
//         // Skip invalid textures
//         if (!texture || !texture.image) {
//           return resolve(null);
//         }
        
//         const image = texture.image;
        
//         // Create a canvas and get its 2D context
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         if (!ctx) {
//           console.warn('Could not get 2D context for texture conversion');
//           return resolve(null);
//         }
        
//         // Set canvas dimensions to match the image
//         canvas.width = image.width || 1;
//         canvas.height = image.height || 1;
        
//         // Different handling based on image type
//         if (image instanceof HTMLImageElement || image instanceof Image) {
//           // For regular images, draw directly to canvas
//           ctx.drawImage(image, 0, 0);
//           resolve(canvas);
//         } else if (image instanceof HTMLCanvasElement) {
//           // Canvas can be used directly
//           resolve(image);
//         } else if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
//           // For ImageBitmap, draw to canvas
//           ctx.drawImage(image, 0, 0);
//           resolve(canvas);
//         } else {
//           // For other formats, create a fallback
//           console.warn('Unsupported image type, creating fallback:', image);
//           // Just return the canvas (will be blank but valid for export)
//           resolve(canvas);
//         }
//       } catch (error) {
//         console.error('Error converting texture to canvas:', error);
//         // Return a blank canvas rather than failing completely
//         const fallbackCanvas = document.createElement('canvas');
//         fallbackCanvas.width = 1;
//         fallbackCanvas.height = 1;
//         resolve(fallbackCanvas);
//       }
//     });
//   };

//   /**
//    * Processes a material to ensure its textures are exportable
//    */
//   const processMaterial = async (material) => {
//     if (!material) return;
    
//     // Handle standard materials
//     const textureProps = [
//       'map', 'normalMap', 'bumpMap', 'displacementMap', 
//       'roughnessMap', 'metalnessMap', 'alphaMap', 
//       'aoMap', 'emissiveMap', 'envMap', 'lightMap',
//       'specularMap', 'specularIntensityMap'
//     ];
    
//     for (const prop of textureProps) {
//       if (material[prop] && material[prop].isTexture) {
//         try {
//           const canvas = await textureToCanvas(material[prop]);
          
//           if (canvas) {
//             // Save original texture properties
//             const original = material[prop];
            
//             // Create a new texture from the canvas
//             const newTexture = new THREE.Texture(canvas);
            
//             // Copy ALL essential texture properties from the original texture
//             newTexture.wrapS = original.wrapS;
//             newTexture.wrapT = original.wrapT;
//             newTexture.magFilter = original.magFilter;
//             newTexture.minFilter = original.minFilter;
//             newTexture.mapping = original.mapping;
//             newTexture.offset.copy(original.offset);
//             newTexture.repeat.copy(original.repeat);
//             newTexture.center.copy(original.center);
//             newTexture.rotation = original.rotation;
//             newTexture.matrixAutoUpdate = original.matrixAutoUpdate;
//             newTexture.matrix.copy(original.matrix);
//             newTexture.generateMipmaps = original.generateMipmaps;
//             newTexture.premultiplyAlpha = original.premultiplyAlpha;
//             newTexture.flipY = original.flipY;
//             newTexture.unpackAlignment = original.unpackAlignment;
//             newTexture.encoding = original.encoding;
            
//             // Copy any custom userData if it exists
//             if (original.userData) {
//               newTexture.userData = JSON.parse(JSON.stringify(original.userData));
//             }
            
//             // Copy any channel encoding properties (for modern THREE.js)
//             if (original.colorSpace !== undefined) {
//               newTexture.colorSpace = original.colorSpace;
//             }
            
//             // Handle special properties for specific texture types
//             if (prop === 'normalMap' && material.normalScale) {
//               // Ensure normal map intensity is preserved
//               material.normalScale.copy(material.normalScale);
//             }
            
//             // Ensure the texture is marked as updated
//             newTexture.needsUpdate = true;
            
//             // Replace the original texture
//             material[prop] = newTexture;
//           }
//         } catch (error) {
//           console.error(`Error processing texture for property '${prop}':`, error);
//         }
//       }
//     }
    
//     // Force material update
//     material.needsUpdate = true;
//   };

//   /**
//    * Creates a clean copy of the scene with processed textures
//    */
//   const prepareSceneForExport = async (originalScene) => {
//     // Create a shallow clone of the scene
//     const exportScene = originalScene.clone(false);
    
//     // Function to process an object and its descendants
//     const processObject = async (original, parent) => {
//       // Clone the object (shallow clone)
//       const cloned = original.clone(false);
      
//       // If the object has material(s), process them
//       if (cloned.material) {
//         if (Array.isArray(cloned.material)) {
//           // Handle multi-material objects
//           for (let i = 0; i < cloned.material.length; i++) {
//             await processMaterial(cloned.material[i]);
//           }
//         } else {
//           // Handle single material objects
//           await processMaterial(cloned.material);
//         }
//       }
      
//       // Add the cloned object to its parent
//       if (parent) {
//         parent.add(cloned);
//       } else {
//         exportScene.add(cloned);
//       }
      
//       // Process children recursively
//       if (original.children && original.children.length > 0) {
//         for (const child of original.children) {
//           await processObject(child, cloned);
//         }
//       }
      
//       return cloned;
//     };
    
//     // Start processing from the scene's children
//     for (const child of originalScene.children) {
//       await processObject(child);
//     }
    
//     return exportScene;
//   };

//   /**
//    * Export the scene with texture processing
//    */
//   const exportSceneWithTextureProcessing = async (sceneToExport) => {
//     console.log("Starting export with texture processing...");
    
//     try {
//       // Prepare a clean scene with processed textures
//       const preparedScene = await prepareSceneForExport(sceneToExport);
      
//       return new Promise((resolve, reject) => {
//         const exporter = new GLTFExporter();
        
//         const options = {
//           binary: true,
//           includeCustomExtensions: true,
//           animations: [],
//           onlyVisible: true,
//           // Add extra options to ensure texture information is retained
//           embedImages: true,
//           forcePowerOfTwoTextures: false
//         };
        
//         exporter.parse(
//           preparedScene,
//           (gltf) => {
//             console.log("Export successful");
//             const blob = new Blob([gltf], { type: 'application/octet-stream' });
//             resolve(blob);
//           },
//           (error) => {
//             console.error('GLTFExporter error:', error);
//             reject(error);
//           },
//           options
//         );
//       });
//     } catch (error) {
//       console.error("Error preparing scene for export:", error);
//       throw error;
//     }
//   };
  
//   return null;
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


const ARViewerModal = ({ visible, modelUrl, onClose }) => {
  const [arSupported, setArSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modelViewerReady, setModelViewerReady] = useState(false);
  const [arError, setArError] = useState(null);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      console.log("Modal became visible, setting loading to true");
      setIsLoading(true);
      setArError(null);
    }
  }, [visible]);

  useEffect(() => {
    console.log("ARViewerModal modelUrl changed:", modelUrl);
  }, [modelUrl]);

  // Check AR support
  useEffect(() => {
    const checkArSupport = async () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/i.test(navigator.userAgent);

      if (window.navigator.xr) {
        try {
          const supported = await window.navigator.xr.isSessionSupported('immersive-ar');
          console.log("WebXR AR support:", supported);
          setArSupported(supported);
        } catch (err) {
          console.log("WebXR check failed, falling back to platform detection");
          setArSupported(isIOS || isAndroid);
        }
      } else {
        console.log("No WebXR, checking platform support");
        setArSupported(isIOS || isAndroid);
      }
    };
    checkArSupport();
  }, []);

  // Load model-viewer script
  useEffect(() => {
    const loadModelViewerScript = () => {
      if (!window.customElements || !window.customElements.get('model-viewer')) {
        console.log("Loading model-viewer script...");
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
        script.type = 'module';
        script.onload = () => {
          console.log("model-viewer script loaded");
          setModelViewerReady(true);
        };
        script.onerror = (e) => {
          console.error("Failed to load model-viewer script:", e);
          setArError("Failed to load AR viewer components.");
        };
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
      } else {
        setModelViewerReady(true);
      }
    };
    loadModelViewerScript();
  }, []);

  // Setup model-viewer
  useEffect(() => {
    if (!visible || !modelViewerReady || !modelUrl) return;

    if (!modelUrl.startsWith('blob:') && !modelUrl.startsWith('http')) {
      setArError("Invalid 3D model URL");
      setIsLoading(false);
      return;
    }

    const modelViewer = document.getElementById('ar-model-viewer');
    if (!modelViewer) {
      setArError("AR viewer initialization failed");
      setIsLoading(false);
      return;
    }

    modelViewerRef.current = modelViewer;

    modelViewer.addEventListener('load', () => {
      console.log("Model loaded successfully");
      setIsLoading(false);
    });

    modelViewer.addEventListener('error', (event) => {
      console.error("Model loading error:", event);
      setArError("Failed to load 3D model.");
      setIsLoading(false);
    });

    // Set GLB source
    modelViewer.setAttribute('src', modelUrl);

    // For iOS, we won't set ios-src with a fake USDZ URL since we only have GLB
    // Quick Look will be triggered via intent for Android, not ios-src

  }, [visible, modelViewerReady, modelUrl]);

  // Manual AR activation
  const activateAR = () => {
    if (!modelViewerRef.current) {
      setArError("AR viewer not initialized");
      return;
    }

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    try {
      if (isAndroid) {
        // Android: Use Scene Viewer Intent
        const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;
        window.location.href = intent;
      } else if (isIOS) {
        // iOS: Since we only have GLB, trigger download or inform user
        setArError("iOS AR requires a USDZ file. Please download the GLB file instead.");
      } else if (typeof modelViewerRef.current.activateAR === 'function') {
        // WebXR fallback
        modelViewerRef.current.activateAR();
      } else {
        const arButton = modelViewerRef.current.querySelector('button[slot="ar-button"]');
        if (arButton) arButton.click();
        else throw new Error("No AR activation method available");
      }
    } catch (error) {
      console.error("Error activating AR:", error);
      setArError("Failed to start AR session. Check device compatibility and permissions.");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">View in AR</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative w-full h-[calc(100%-8rem)]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 bg-opacity-80">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading 3D model...</p>
              </div>
            </div>
          )}

          {arError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-90">
              <div className="text-center p-8 max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading AR</h3>
                <p className="mt-2 text-gray-600">{arError}</p>
                <button onClick={() => setArError(null)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {modelViewerReady && (
            <model-viewer
              id="ar-model-viewer"
              alt="3D furniture model"
              ar
              ar-modes="scene-viewer webxr quick-look" // Prioritize scene-viewer for Android
              ar-scale="auto"
              camera-controls
              auto-rotate
              environment-image="neutral"
              exposure="1"
              shadow-intensity="1"
              shadow-softness="1"
              loading="eager"
              style={{ width: '100%', height: '100%', backgroundColor: '#f9f9f9' }}
              ar-placement="floor"
            >
              <button
                slot="ar-button"
                style={{
                  backgroundColor: '#4285f4',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  zIndex: '100',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                }}
              >
                View in your space
              </button>
            </model-viewer>
          )}

          {!arSupported && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
              <div className="text-center p-8 max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">AR Not Available</h3>
                <p className="mt-2 text-gray-600">Your device or browser doesn't support AR viewing.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-100 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {arSupported ? 'AR is available on your device' : 'AR is not supported on your device'}
            </div>
            <div className="flex space-x-4">
              {arSupported && modelViewerReady && !isLoading && (
                <button onClick={activateAR} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Launch AR View
                </button>
              )}
              {modelUrl && (
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = modelUrl;
                    a.download = 'custom-configured-model.glb';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-4 py-2 bg-transparent text-black rounded-md hover:bg-slate-200 border-2 border-black"
                >
                  Download GLB
                </button>
              )}
              <button onClick={onClose} className="px-4 py-2 bg-transparent text-black rounded-md hover:bg-slate-200 border-2 border-black">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

const Model3D = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [background, setBackground] = useState('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [showARViewer, setShowARViewer] = useState(false);
  const [modelUrl, setModelUrl] = useState(null);
  const [processingState, setProcessingState] = useState('idle'); // idle, exporting, viewing

  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
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

  const handleViewInRoom = async () => {
    setExportError(null);
    setProcessingState('exporting');
    
    try {
      // Validate export function exists
      if (typeof window.exportScene !== 'function') {
        throw new Error('Export functionality not available');
      }
      
      console.log("Starting 3D model export...");
      const result = await window.exportScene();
      
      // Validate the returned data
      if (!result || !result.blob) {
        throw new Error('Invalid export data returned');
      }
      
      console.log("Export blob received:", result.blob);
      
      // Verify the blob type
      if (!(result.blob instanceof Blob)) {
        throw new Error('Export did not return a valid Blob object');
      }
      
      // Create a proper blob URL - this should start with "blob:"
      // Don't use the URL from the result, create a new one
      const url = URL.createObjectURL(result.blob);
      console.log("Created blob URL:", url);
      
      if (!url.startsWith('blob:')) {
        throw new Error('Failed to create a valid blob URL');
      }
      
      // Update state
      setModelUrl(url);
      setProcessingState('viewing');
      setShowARViewer(true);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error.message || 'Export failed');
      setProcessingState('idle');
    }
  };
  const handleExportDownload = async () => {
    setExportError(null);
    setIsExporting(true);
    
    try {
      if (!window.exportScene) {
        throw new Error('Export functionality not available');
      }
      
      // Use the function exposed by the SceneExporter component
      const { blob, url } = await window.exportScene();
      
      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'custom-configured-model.glb';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      setIsExporting(false);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error.message || 'Export failed');
      setIsExporting(false);
    }
  };

  // Function to be passed to ViewerControls
  const setBackgroundSetting = (setting) => {
    setBackground(setting);
  };

  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Add actual fullscreen implementation if needed
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
              onClick={handleViewInRoom}
              disabled={processingState === 'exporting'}
            >
              {processingState === 'exporting' ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparing AR...
                </>
              ) : 'View in Room (AR)'}
            </button>

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
            
            <FurnitureModel />
            
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
          
          {/* AR Viewer Modal */}
          <ARViewerModal 
            visible={showARViewer} 
            modelUrl={modelUrl}
            onClose={() => {
              setShowARViewer(false);
              setProcessingState('idle');
            }}
          />
        </>
      )}
    </div>
  );
};
export default Model3D;