
import React, { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

interface ModelLoaderProps {
  modelPath: string;
  material: THREE.Material | null;
  onError?: (error: Error) => void;
}

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

const ModelLoader: React.FC<ModelLoaderProps> = ({ modelPath, material, onError }) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  
  try {
    const gltf = useLoader(GLTFLoader, modelPath);
    
    useEffect(() => {
      if (gltf) {
        const clonedScene = gltf.scene.clone(true);
        
        if (material) {
          clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Preserve the original UV mapping
              const originalGeometry = child.geometry;
              
              // Create a new material instance for each mesh to prevent sharing
              const newMaterial = material.clone();
              
              // If the mesh has UV coordinates, configure texture mapping
              if (originalGeometry.attributes.uv) {
                if (newMaterial instanceof THREE.MeshStandardMaterial && newMaterial.map) {
                  // Configure texture parameters
                  newMaterial.map.encoding = THREE.sRGBEncoding;
                  newMaterial.map.flipY = false;
                  newMaterial.map.needsUpdate = true;
                  
                  // Ensure proper UV mapping
                  originalGeometry.attributes.uv.needsUpdate = true;
                }
              }
              
              // Apply the configured material
              child.material = newMaterial;
            }
          });
        }
        
        setModel(clonedScene);
      }
    }, [gltf, material]);
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    return null;
  }

  return model ? <primitive object={model} /> : null;
};

export default ModelLoader;