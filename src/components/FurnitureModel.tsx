

// import React, { useRef, useEffect, useState } from 'react';
// import { useThree, useFrame } from '@react-three/fiber';
// import { MeshStandardMaterial, TextureLoader, RepeatWrapping, SRGBColorSpace, Color } from 'three';
// import { useConfigurator } from '../contexts/ConfiguratorContext';
// import ModelLoader, { ModelErrorBoundary } from './ModelLoader';
// import * as THREE from 'three';

// const FurnitureModel: React.FC = () => {
//   const { state } = useConfigurator();
//   const { camera } = useThree();
//   const groupRef = useRef<THREE.Group>(null);
  
//   const [modelErrors, setModelErrors] = useState<Record<string, boolean>>({});
//   const [bodyMaterial, setBodyMaterial] = useState<THREE.MeshStandardMaterial | null>(null);
//   const [handleMaterial, setHandleMaterial] = useState<THREE.MeshStandardMaterial | null>(null);

//   const mainModelPath = '/models/603-02.glb';
//   const handlePath1 = '/models/603-02-Hardware-1.glb';
//   const handlePath2 = '/models/603-02-Hardware-2.glb';
//   const legPathA = '/models/Leg-A.glb';
//   const legPathB = '/models/Leg-B.glb';

//   const hasError = (modelPath: string) => !!modelErrors[modelPath];
  
//   const handleModelError = (modelPath: string, error: Error) => {
//     console.error(`Error loading model ${modelPath}:`, error);
//     setModelErrors(prev => ({ ...prev, [modelPath]: true }));
//   };

//   // Create handle material with the selected color
//   useEffect(() => {
//     // Default to a silver color if not specified
//     const handleColor = state.handleColor || '#C0C0C0';
    
//     const newHandleMaterial = new MeshStandardMaterial({
//       color: new Color(handleColor),
//       roughness: 0.4,
//       metalness: 0.8,
//       envMapIntensity: 1,
//     });
    
//     setHandleMaterial(newHandleMaterial);
//   }, [state.handleColor]);

//   // Create body material with the selected texture
//   useEffect(() => {
//     if (state.selectedMaterial) {
//       const texturePath = `/textures/${state.selectedMaterial.image}`;
      
//       const textureLoader = new TextureLoader();
//       textureLoader.load(
//         texturePath,
//         (loadedTexture) => {
//           // Configure texture parameters
//           loadedTexture.encoding = SRGBColorSpace;
//           loadedTexture.wrapS = RepeatWrapping;
//           loadedTexture.wrapT = RepeatWrapping;
//           loadedTexture.repeat.set(1, 1);
//           loadedTexture.flipY = false;
//           loadedTexture.needsUpdate = true;

//           // Load roughness map
//           const roughnessMapPath = '/roughness/roughnessMap.png';
//           textureLoader.load(
//             roughnessMapPath,
//             (roughnessMap) => {
//               roughnessMap.wrapS = RepeatWrapping;
//               roughnessMap.wrapT = RepeatWrapping;
//               roughnessMap.needsUpdate = true;

//               // Create material with proper parameters
//               const newMaterial = new MeshStandardMaterial({
//                 map: loadedTexture,
//                 roughnessMap: roughnessMap, // Add roughness map
//                 roughness: 1,
//                 metalness: 0.2,
//                 normalScale: new THREE.Vector2(1, 1),
//                 envMapIntensity: 1,
//               });

//               setBodyMaterial(newMaterial);
//             },
//             undefined,
//             (error) => {
//               console.error('Error loading roughness map:', error);
//               // Fallback material if roughness map fails
//               const fallbackMaterial = new MeshStandardMaterial({
//                 map: loadedTexture,
//                 roughness: 2.8,
//                 metalness: 0.2,
//                 normalScale: new THREE.Vector2(1, 1),
//                 envMapIntensity: 1,
//               });
//               setBodyMaterial(fallbackMaterial);
//             }
//           );
//         },
//         undefined,
//         (error) => {
//           console.error('Error loading texture:', error);
//           setBodyMaterial(
//             new MeshStandardMaterial({
//               color: '#A67B5B',
//               roughness: 0.8,
//             })
//           );
//         }
//       );
//     }
//   }, [state.selectedMaterial]);

//   useEffect(() => {
//     if (camera) {
//       camera.position.set(2, 1, 2);
//       camera.lookAt(0, 0, 0);
//     }
//   }, [camera]);
  
//   useFrame(() => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y += 0.001;
//     }
//   });

//   const furnitureGeometry = new THREE.BoxGeometry(1.5, 0.6, 0.8);
//   const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
//   const legGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);

//   // Force re-render when handle or leg selection changes
//   const handleModelKey = `handle-${state.selectedHandle}-${state.handleColor || 'default'}`;
//   const legModelKey = `leg-${state.selectedLeg}`;

//   return (
//     <group ref={groupRef} position={[0, 0, 0]}>
//       <ModelErrorBoundary>
//         {!hasError(mainModelPath) ? (
//           <ModelLoader 
//             key="main-model"
//             modelPath={mainModelPath} 
//             material={bodyMaterial}
//             onError={(error) => handleModelError(mainModelPath, error)}
//           />
//         ) : (
//           <mesh geometry={furnitureGeometry} position={[0, 0.3, 0]}>
//             {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//           </mesh>
//         )}
//       </ModelErrorBoundary>

//       {/* Handle models with key to force remount when selection changes */}
//       {state.selectedHandle === '603-02-Hardware-1' ? (
//         <ModelErrorBoundary key={handleModelKey}>
//           {!hasError(handlePath1) ? (
//             <ModelLoader 
//               modelPath={handlePath1} 
//               material={handleMaterial}
//               onError={(error) => handleModelError(handlePath1, error)}
//             />
//           ) : (
//             <mesh geometry={handleGeometry} position={[-0.4, 0.3, 0.4]} rotation={[Math.PI/2, 0, 0]}>
//               {handleMaterial && <primitive object={handleMaterial.clone()} attach="material" />}
//             </mesh>
//           )}
//         </ModelErrorBoundary>
//       ) : (
//         <ModelErrorBoundary key={handleModelKey}>
//           {!hasError(handlePath2) ? (
//             <ModelLoader 
//               modelPath={handlePath2} 
//               material={handleMaterial}
//               onError={(error) => handleModelError(handlePath2, error)}
//             />
//           ) : (
//             <mesh geometry={handleGeometry} position={[-0.4, 0.3, 0.4]} rotation={[0, 0, Math.PI/2]}>
//               {handleMaterial && <primitive object={handleMaterial.clone()} attach="material" />}
//             </mesh>
//           )}
//         </ModelErrorBoundary>
//       )}

//       {/* Leg models with key to force remount when selection changes */}
//       {state.selectedLeg === 'Leg-A' ? (
//         <ModelErrorBoundary key={legModelKey}>
//           {!hasError(legPathA) ? (
//             <ModelLoader 
//               modelPath={legPathA} 
//               material={bodyMaterial} 
//               onError={(error) => handleModelError(legPathA, error)} 
//             />
//           ) : (
//             <>
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, 0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, 0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, -0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, -0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//             </>
//           )}
//         </ModelErrorBoundary>
//       ) : (
//         <ModelErrorBoundary key={legModelKey}>
//           {!hasError(legPathB) ? (
//             <ModelLoader 
//               modelPath={legPathB} 
//               material={bodyMaterial} 
//               onError={(error) => handleModelError(legPathB, error)} 
//             />
//           ) : (
//             <>
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, 0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, 0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, -0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, -0.3]}>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//             </>
//           )}
//         </ModelErrorBoundary>
//       )}
//     </group>
//   );
// };

// export default FurnitureModel;


import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, TextureLoader, RepeatWrapping, Color } from 'three';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import ModelLoader, { ModelErrorBoundary } from './ModelLoader';
import * as THREE from 'three';

const FurnitureModel: React.FC = () => {
  const { state } = useConfigurator();
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  // Track model loading errors
  const [modelErrors, setModelErrors] = useState<Record<string, boolean>>({});
  const [bodyMaterial, setBodyMaterial] = useState<THREE.MeshStandardMaterial | null>(null);
  const [handleMaterial, setHandleMaterial] = useState<THREE.MeshStandardMaterial | null>(null);
  
  // UI related states
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Model paths
  const mainModelPath = '/models/603-02.glb';
  const handlePath1 = '/models/603-02-Hardware-1.glb';
  const handlePath2 = '/models/603-02-Hardware-2.glb';
  const legPathA = '/models/Leg-A.glb';
  const legPathB = '/models/Leg-B.glb';

  const hasError = (modelPath: string) => !!modelErrors[modelPath];
  
  const handleModelError = (modelPath: string, error: Error) => {
    console.error(`Error loading model ${modelPath}:`, error);
    setModelErrors(prev => ({ ...prev, [modelPath]: true }));
    
    // Show error popup
    setErrorMessage(`Failed to load model: ${modelPath.split('/').pop()}`);
    setShowErrorPopup(true);
  };

  // Create handle material with the selected color
  useEffect(() => {
    // Default to a silver color if not specified
    const handleColor = state.handleColor || '#C0C0C0';
    
    const newHandleMaterial = new MeshStandardMaterial({
      color: new Color(handleColor),
      roughness: 0.4,
      metalness: 0.8,
      envMapIntensity: 1,
    });
    
    setHandleMaterial(newHandleMaterial);
  }, [state.handleColor]);

  // Create body material with the selected texture
  useEffect(() => {
    if (!state.selectedMaterial) return;
    
    const texturePath = `/textures/${state.selectedMaterial.image}`;
    const textureLoader = new TextureLoader();
    
    const loadingPromise = new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        texturePath,
        resolve,
        undefined,
        reject
      );
    });
    
    loadingPromise
      .then((loadedTexture) => {
        // Configure texture parameters based on THREE.js version
        if (THREE.SRGBColorSpace !== undefined) {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
        } else if (THREE.sRGBEncoding !== undefined) {
          loadedTexture.encoding = THREE.sRGBEncoding;
        }
        
        loadedTexture.wrapS = RepeatWrapping;
        loadedTexture.wrapT = RepeatWrapping;
        loadedTexture.repeat.set(1, 1);
        loadedTexture.flipY = false;
        loadedTexture.needsUpdate = true;
        
        return loadedTexture;
      })
      .then((configuredTexture) => {
        // Load roughness map
        return new Promise<{texture: THREE.Texture, roughnessMap?: THREE.Texture}>((resolve, reject) => {
          const roughnessMapPath = '/roughness/roughnessMap.png';
          textureLoader.load(
            roughnessMapPath,
            (roughnessMap) => {
              roughnessMap.wrapS = RepeatWrapping;
              roughnessMap.wrapT = RepeatWrapping;
              roughnessMap.needsUpdate = true;
              resolve({texture: configuredTexture, roughnessMap});
            },
            undefined,
            () => {
              // Just resolve with the texture if roughness map fails
              resolve({texture: configuredTexture});
            }
          );
        });
      })
      .then(({texture, roughnessMap}) => {
        // Create material
        const newMaterial = new MeshStandardMaterial({
          map: texture,
          roughnessMap: roughnessMap,
          roughness: roughnessMap ? 1 : 2.8,
          metalness: 0.2,
          normalScale: new THREE.Vector2(1, 1),
          envMapIntensity: 1,
        });
        
        setBodyMaterial(newMaterial);
      })
      .catch((error) => {
        console.error('Error loading texture:', error);
        
        // Show error popup
        setErrorMessage(`Failed to load texture: ${state.selectedMaterial?.image}`);
        setShowErrorPopup(true);
        
        // Set fallback material
        setBodyMaterial(
          new MeshStandardMaterial({
            color: '#A67B5B',
            roughness: 0.8,
          })
        );
      });
  }, [state.selectedMaterial]);

  // Setup camera
  useEffect(() => {
    if (camera) {
      camera.position.set(2, 1, 2);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);
  
  // Rotate model
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Generate unique keys for components that need to be remounted
  const getModelKey = (baseName: string, variant: string, extras?: string) => 
    `${baseName}-${variant}${extras ? `-${extras}` : ''}`;
  
  // Close error popup
  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  // Determine which handle model to show
  const selectedHandlePath = state.selectedHandle === '603-02-Hardware-1' ? handlePath1 : handlePath2;
  const selectedLegPath = state.selectedLeg === 'Leg-A' ? legPathA : legPathB;

  // Error Popup Component
  const ErrorPopup = () => (
    <div className="error-popup">
      <div className="error-popup-content">
        <h3>Error Loading Model</h3>
        <p>{errorMessage}</p>
        <button onClick={closeErrorPopup}>Close</button>
      </div>
    </div>
  );

  return (
    <>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Main model */}
        <ModelErrorBoundary>
          {!hasError(mainModelPath) && (
            <ModelLoader 
              key={getModelKey('main', mainModelPath)}
              modelPath={mainModelPath} 
              material={bodyMaterial}
              onError={(error) => handleModelError(mainModelPath, error)}
            />
          )}
        </ModelErrorBoundary>

        {/* Handle model */}
        <ModelErrorBoundary>
          {!hasError(selectedHandlePath) && (
            <ModelLoader 
              key={getModelKey('handle', state.selectedHandle, state.handleColor)}
              modelPath={selectedHandlePath} 
              material={handleMaterial}
              onError={(error) => handleModelError(selectedHandlePath, error)}
            />
          )}
        </ModelErrorBoundary>

        {/* Leg model */}
        <ModelErrorBoundary>
          {!hasError(selectedLegPath) && (
            <ModelLoader 
              key={getModelKey('leg', state.selectedLeg)}
              modelPath={selectedLegPath} 
              material={bodyMaterial}
              onError={(error) => handleModelError(selectedLegPath, error)}
            />
          )}
        </ModelErrorBoundary>
      </group>
      
      {/* Error popup */}
      {showErrorPopup && <ErrorPopup />}
    </>
  );
};

export default FurnitureModel;