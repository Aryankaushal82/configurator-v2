
// import React, { useEffect, useState } from 'react';
// import { useLoader } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import * as THREE from 'three';
// import { useTexture } from '@react-three/drei';

// interface ModelLoaderProps {
//   modelPath: string;
//   material: THREE.Material | null;
//   onError?: (error: Error) => void;
// }

// export class ModelErrorBoundary extends React.Component<
//   { children: React.ReactNode },
//   { hasError: boolean }
// > {
//   constructor(props: { children: React.ReactNode }) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError() {
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error) {
//     console.error("Model loading error:", error);
//   }

//   render() {
//     if (this.state.hasError) {
//       return null;
//     }
//     return this.props.children;
//   }
// }

// const ModelLoader: React.FC<ModelLoaderProps> = ({ modelPath, material, onError }) => {
//   const [model, setModel] = useState<THREE.Group | null>(null);
  
//   try {
//     const gltf = useLoader(GLTFLoader, modelPath);
    
//     useEffect(() => {
//       if (gltf) {
//         const clonedScene = gltf.scene.clone(true);
        
//         if (material) {
//           clonedScene.traverse((child) => {
//             if (child instanceof THREE.Mesh) {
//               // Preserve the original UV mapping
//               const originalGeometry = child.geometry;
              
//               // Create a new material instance for each mesh to prevent sharing
//               const newMaterial = material.clone();
              
//               // If the mesh has UV coordinates, configure texture mapping
//               if (originalGeometry.attributes.uv) {
//                 if (newMaterial instanceof THREE.MeshStandardMaterial && newMaterial.map) {
//                   // Configure texture parameters
//                   newMaterial.map.encoding = THREE.sRGBEncoding;
//                   newMaterial.map.flipY = false;
//                   newMaterial.map.needsUpdate = true;
                  
//                   // Ensure proper UV mapping
//                   originalGeometry.attributes.uv.needsUpdate = true;
//                 }
//               }
              
//               // Apply the configured material
//               child.material = newMaterial;
//             }
//           });
//         }
        
//         setModel(clonedScene);
//       }
//     }, [gltf, material]);
//   } catch (error) {
//     if (onError && error instanceof Error) {
//       onError(error);
//     }
//     return null;
//   }

//   return model ? <primitive object={model} /> : null;
// };

// export default ModelLoader;


import React, { useEffect, useState, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface ModelLoaderProps {
  modelPath: string;
  material: THREE.Material | null;
  onError?: (error: Error) => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = React.memo(({ modelPath, material, onError }) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const loaderRef = useRef(new GLTFLoader());
  const isMounted = useRef(true);
  const prevModelPath = useRef(modelPath); // Track previous modelPath

  // Load model only if modelPath changes
  useEffect(() => {
    if (prevModelPath.current === modelPath && model) return; // Skip if path hasn’t changed and model exists

    setModel(null); // Reset only on actual path change
    isMounted.current = true;

    loaderRef.current.load(
      modelPath,
      (gltf) => {
        if (!isMounted.current) return;
        const clonedScene = gltf.scene.clone(true);
        setModel(clonedScene);
        prevModelPath.current = modelPath;
      },
      undefined,
      (error) => {
        console.error(`Error loading model ${modelPath}:`, error);
        if (isMounted.current && onError) onError(error);
      }
    );

    return () => {
      isMounted.current = false;
    };
  }, [modelPath, onError]);

  // Apply material efficiently
  useEffect(() => {
    if (!model || !material) return;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Only update if material has changed
        if (child.material !== material) {
          child.material = material; // Use material directly instead of cloning repeatedly
          child.material.needsUpdate = true;

          const geometry = child.geometry;
          if (
            geometry.attributes.uv &&
            material instanceof THREE.MeshStandardMaterial &&
            material.map
          ) {
            if (THREE.SRGBColorSpace !== undefined) {
              material.map.colorSpace = THREE.SRGBColorSpace;
            } else if (THREE.sRGBEncoding !== undefined) {
              material.map.encoding = THREE.sRGBEncoding;
            }
            material.map.flipY = false;
            material.map.needsUpdate = true;
            geometry.attributes.uv.needsUpdate = true;
          }
        }
      }
    });
  }, [model, material]);

  return model ? <primitive object={model} /> : null;
}, (prevProps, nextProps) => {
  return prevProps.modelPath === nextProps.modelPath && prevProps.onError === nextProps.onError;
});

export default ModelLoader;

export class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Model loading error:", error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}