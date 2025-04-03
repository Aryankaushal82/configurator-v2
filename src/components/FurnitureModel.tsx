

import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, TextureLoader, RepeatWrapping, SRGBColorSpace, Color } from 'three';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import ModelLoader, { ModelErrorBoundary } from './ModelLoader';
import * as THREE from 'three';

const FurnitureModel: React.FC = () => {
  const { state } = useConfigurator();
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  const [modelErrors, setModelErrors] = useState<Record<string, boolean>>({});
  const [bodyMaterial, setBodyMaterial] = useState<THREE.MeshStandardMaterial | null>(null);
  const [handleMaterial, setHandleMaterial] = useState<THREE.MeshStandardMaterial | null>(null);

  const mainModelPath = '/models/603-02.glb';
  const handlePath1 = '/models/603-02-Hardware-1.glb';
  const handlePath2 = '/models/603-02-Hardware-2.glb';
  const legPathA = '/models/Leg-A.glb';
  const legPathB = '/models/Leg-B.glb';

  const hasError = (modelPath: string) => !!modelErrors[modelPath];
  
  const handleModelError = (modelPath: string, error: Error) => {
    console.error(`Error loading model ${modelPath}:`, error);
    setModelErrors(prev => ({ ...prev, [modelPath]: true }));
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
    if (state.selectedMaterial) {
      const texturePath = `/textures/${state.selectedMaterial.image}`;
      
      const textureLoader = new TextureLoader();
      textureLoader.load(
        texturePath,
        (loadedTexture) => {
          // Configure texture parameters
          loadedTexture.encoding = SRGBColorSpace;
          loadedTexture.wrapS = RepeatWrapping;
          loadedTexture.wrapT = RepeatWrapping;
          loadedTexture.repeat.set(1, 1);
          loadedTexture.flipY = false;
          loadedTexture.needsUpdate = true;

          // Load roughness map
          const roughnessMapPath = '/roughness/roughnessMap.png';
          textureLoader.load(
            roughnessMapPath,
            (roughnessMap) => {
              roughnessMap.wrapS = RepeatWrapping;
              roughnessMap.wrapT = RepeatWrapping;
              roughnessMap.needsUpdate = true;

              // Create material with proper parameters
              const newMaterial = new MeshStandardMaterial({
                map: loadedTexture,
                roughnessMap: roughnessMap, // Add roughness map
                roughness: 1,
                metalness: 0.2,
                normalScale: new THREE.Vector2(1, 1),
                envMapIntensity: 1,
              });

              setBodyMaterial(newMaterial);
            },
            undefined,
            (error) => {
              console.error('Error loading roughness map:', error);
              // Fallback material if roughness map fails
              const fallbackMaterial = new MeshStandardMaterial({
                map: loadedTexture,
                roughness: 2.8,
                metalness: 0.2,
                normalScale: new THREE.Vector2(1, 1),
                envMapIntensity: 1,
              });
              setBodyMaterial(fallbackMaterial);
            }
          );
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          setBodyMaterial(
            new MeshStandardMaterial({
              color: '#A67B5B',
              roughness: 0.8,
            })
          );
        }
      );
    }
  }, [state.selectedMaterial]);

  useEffect(() => {
    if (camera) {
      camera.position.set(2, 1, 2);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const furnitureGeometry = new THREE.BoxGeometry(1.5, 0.6, 0.8);
  const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
  const legGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);

  // Force re-render when handle or leg selection changes
  const handleModelKey = `handle-${state.selectedHandle}-${state.handleColor || 'default'}`;
  const legModelKey = `leg-${state.selectedLeg}`;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ModelErrorBoundary>
        {!hasError(mainModelPath) ? (
          <ModelLoader 
            key="main-model"
            modelPath={mainModelPath} 
            material={bodyMaterial}
            onError={(error) => handleModelError(mainModelPath, error)}
          />
        ) : (
          <mesh geometry={furnitureGeometry} position={[0, 0.3, 0]}>
            {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
          </mesh>
        )}
      </ModelErrorBoundary>

      {/* Handle models with key to force remount when selection changes */}
      {state.selectedHandle === '603-02-Hardware-1' ? (
        <ModelErrorBoundary key={handleModelKey}>
          {!hasError(handlePath1) ? (
            <ModelLoader 
              modelPath={handlePath1} 
              material={handleMaterial}
              onError={(error) => handleModelError(handlePath1, error)}
            />
          ) : (
            <mesh geometry={handleGeometry} position={[-0.4, 0.3, 0.4]} rotation={[Math.PI/2, 0, 0]}>
              {handleMaterial && <primitive object={handleMaterial.clone()} attach="material" />}
            </mesh>
          )}
        </ModelErrorBoundary>
      ) : (
        <ModelErrorBoundary key={handleModelKey}>
          {!hasError(handlePath2) ? (
            <ModelLoader 
              modelPath={handlePath2} 
              material={handleMaterial}
              onError={(error) => handleModelError(handlePath2, error)}
            />
          ) : (
            <mesh geometry={handleGeometry} position={[-0.4, 0.3, 0.4]} rotation={[0, 0, Math.PI/2]}>
              {handleMaterial && <primitive object={handleMaterial.clone()} attach="material" />}
            </mesh>
          )}
        </ModelErrorBoundary>
      )}

      {/* Leg models with key to force remount when selection changes */}
      {state.selectedLeg === 'Leg-A' ? (
        <ModelErrorBoundary key={legModelKey}>
          {!hasError(legPathA) ? (
            <ModelLoader 
              modelPath={legPathA} 
              material={bodyMaterial} 
              onError={(error) => handleModelError(legPathA, error)} 
            />
          ) : (
            <>
              <mesh geometry={legGeometry} position={[-0.6, -0.2, 0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
              <mesh geometry={legGeometry} position={[0.6, -0.2, 0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
              <mesh geometry={legGeometry} position={[-0.6, -0.2, -0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
              <mesh geometry={legGeometry} position={[0.6, -0.2, -0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
            </>
          )}
        </ModelErrorBoundary>
      ) : (
        <ModelErrorBoundary key={legModelKey}>
          {!hasError(legPathB) ? (
            <ModelLoader 
              modelPath={legPathB} 
              material={bodyMaterial} 
              onError={(error) => handleModelError(legPathB, error)} 
            />
          ) : (
            <>
              <mesh geometry={legGeometry} position={[-0.6, -0.2, 0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
              <mesh geometry={legGeometry} position={[0.6, -0.2, 0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
              <mesh geometry={legGeometry} position={[-0.6, -0.2, -0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
              <mesh geometry={legGeometry} position={[0.6, -0.2, -0.3]}>
                {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
              </mesh>
            </>
          )}
        </ModelErrorBoundary>
      )}
    </group>
  );
};

export default FurnitureModel;

// import React, { useRef, useEffect, useState, forwardRef } from 'react';
// import { useThree, useFrame } from '@react-three/fiber';
// import { MeshStandardMaterial, TextureLoader, RepeatWrapping, SRGBColorSpace, Color } from 'three';
// import { useConfigurator } from '../contexts/ConfiguratorContext';
// import ModelLoader, { ModelErrorBoundary } from './ModelLoader';
// import * as THREE from 'three';

// const FurnitureModel = forwardRef((props, ref) => {
//   const { state } = useConfigurator();
//   const { camera } = useThree();
//   const groupRef = useRef(null);
  
//   // Connect our local ref to the forwarded ref
//   React.useImperativeHandle(ref, () => groupRef.current);
  
//   const [modelErrors, setModelErrors] = useState({});
//   const [bodyMaterial, setBodyMaterial] = useState(null);
//   const [handleMaterial, setHandleMaterial] = useState(null);

//   const mainModelPath = '/models/603-02.glb';
//   const handlePath1 = '/models/603-02-Hardware-1.glb';
//   const handlePath2 = '/models/603-02-Hardware-2.glb';
//   const legPathA = '/models/Leg-A.glb';
//   const legPathB = '/models/Leg-B.glb';

//   const hasError = (modelPath) => !!modelErrors[modelPath];
  
//   const handleModelError = (modelPath, error) => {
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
    
//     // Important for GLB export - ensure material is exportable
//     newHandleMaterial.userData = {
//       ...newHandleMaterial.userData,
//       exportable: true
//     };
    
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
//           loadedTexture.flipY = false;  // Important for GLB export
//           loadedTexture.needsUpdate = true;

//           // Load roughness map
//           const roughnessMapPath = '/roughness/roughnessMap.png';
//           textureLoader.load(
//             roughnessMapPath,
//             (roughnessMap) => {
//               roughnessMap.wrapS = RepeatWrapping;
//               roughnessMap.wrapT = RepeatWrapping;
//               roughnessMap.flipY = false;  // Important for GLB export
//               roughnessMap.needsUpdate = true;

//               // Create material with proper parameters
//               const newMaterial = new MeshStandardMaterial({
//                 map: loadedTexture,
//                 roughnessMap: roughnessMap,
//                 roughness: 2.8,
//                 metalness: 0.2,
//                 normalScale: new THREE.Vector2(1, 1),
//                 envMapIntensity: 1,
//               });

//               // Important for GLB export - ensure material is exportable
//               newMaterial.userData = {
//                 ...newMaterial.userData,
//                 exportable: true
//               };

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
              
//               // Important for GLB export
//               fallbackMaterial.userData = {
//                 ...fallbackMaterial.userData,
//                 exportable: true
//               };
              
//               setBodyMaterial(fallbackMaterial);
//             }
//           );
//         },
//         undefined,
//         (error) => {
//           console.error('Error loading texture:', error);
//           const defaultMaterial = new MeshStandardMaterial({
//             color: '#A67B5B',
//             roughness: 0.8,
//           });
          
//           // Important for GLB export
//           defaultMaterial.userData = {
//             ...defaultMaterial.userData,
//             exportable: true
//           };
          
//           setBodyMaterial(defaultMaterial);
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
  
//   // Slow rotation for preview - we'll disable this in the exported model
//   const rotationEnabled = !props.disableRotation;
//   useFrame(() => {
//     if (groupRef.current && rotationEnabled) {
//       groupRef.current.rotation.y += 0.001;
//     }
//   });

//   // Fallback geometries
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
//           <mesh geometry={furnitureGeometry} position={[0, 0.3, 0]} castShadow receiveShadow>
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
//             <mesh geometry={handleGeometry} position={[-0.4, 0.3, 0.4]} rotation={[Math.PI/2, 0, 0]} castShadow>
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
//             <mesh geometry={handleGeometry} position={[-0.4, 0.3, 0.4]} rotation={[0, 0, Math.PI/2]} castShadow>
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
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, 0.3]} castShadow>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, 0.3]} castShadow>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, -0.3]} castShadow>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, -0.3]} castShadow>
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
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, 0.3]} castShadow>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, 0.3]} castShadow>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[-0.6, -0.2, -0.3]} castShadow>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//               <mesh geometry={legGeometry} position={[0.6, -0.2, -0.3]} castShadow>
//                 {bodyMaterial && <primitive object={bodyMaterial.clone()} attach="material" />}
//               </mesh>
//             </>
//           )}
//         </ModelErrorBoundary>
//       )}
//     </group>
//   );
// });

// export default FurnitureModel;