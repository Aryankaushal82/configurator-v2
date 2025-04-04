
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
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

interface ModelLoaderProps {
  modelPath: string;
  material: THREE.Material | null;
  onError?: (error: Error) => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({ modelPath, material, onError }) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const loaderRef = useRef(new GLTFLoader());
  const isMounted = useRef(true);
  
  // Load the model once when the path changes
  useEffect(() => {
    // Reset model state
    setModel(null);
    
    // Track component mounted state
    isMounted.current = true;
    
    loaderRef.current.load(
      modelPath,
      (gltf) => {
        if (!isMounted.current) return;
        
        try {
          const clonedScene = gltf.scene.clone(true);
          setModel(clonedScene);
        } catch (error) {
          console.error("Error processing model:", error);
          if (onError && error instanceof Error) {
            onError(error);
          }
        }
      },
      undefined,
      (error) => {
        console.error(`Error loading model ${modelPath}:`, error);
        if (isMounted.current && onError) {
          onError(error);
        }
      }
    );
    
    return () => {
      isMounted.current = false;
    };
  }, [modelPath, onError]); // Remove material from dependency array
  
  // Apply material changes without reloading the model
  useEffect(() => {
    if (model && material) {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Preserve original geometry
          const originalGeometry = child.geometry;
          
          // Create a new material instance for each mesh
          const newMaterial = material.clone();
          
          // Apply material
          child.material = newMaterial;
          
          // If the mesh has UV coordinates, configure texture mapping
          if (originalGeometry.attributes.uv &&
              newMaterial instanceof THREE.MeshStandardMaterial &&
              newMaterial.map) {
            
            // Handle different THREE.js versions
            if (THREE.SRGBColorSpace !== undefined) {
              newMaterial.map.colorSpace = THREE.SRGBColorSpace;
            } else if (THREE.sRGBEncoding !== undefined) {
              newMaterial.map.encoding = THREE.sRGBEncoding;
            }
            
            newMaterial.map.flipY = false;
            newMaterial.map.needsUpdate = true;
            
            // Update geometry
            originalGeometry.attributes.uv.needsUpdate = true;
          }
        }
      });
    }
  }, [model, material]);
  
  // Render the model if loaded
  return model ? <primitive object={model} /> : null;
};

export default ModelLoader;