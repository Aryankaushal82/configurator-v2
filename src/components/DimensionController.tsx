import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import DimensionLines from './DimensionLines';
import * as THREE from 'three';
// Controller component that handles visibility state
const DimensionController = () => {
  const [visible, setVisible] = useState(false);
  const { scene } = useThree();
  
  useEffect(() => {
    // Listen for custom event from ViewerControls
    const handleToggle = (event) => {
      setVisible(event.detail.visible);
    };
    
    window.addEventListener('toggleAxesHelper', handleToggle);
    
    // Initial state from configurator if available
    if (window.configuratorState && window.configuratorState.state) {
      setVisible(!!window.configuratorState.state.showCoordinates);
    }
    
    return () => {
      window.removeEventListener('toggleAxesHelper', handleToggle);
    };
  }, []);

  // Find the first substantial model in the scene
  // This helps target dimensions to the actual model
  const findModelInScene = () => {
    let model = null;
    
    scene.traverse((object) => {
      // Skip small objects, lights, cameras, etc.
      if (object.isMesh && !model && object.geometry) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        // Only choose objects with some substantial size
        if (size.x > 0.5 && size.y > 0.5 && size.z > 0.5) {
          model = object;
        }
      }
    });
    
    return model;
  };
  
  // Get target object for measuring dimensions
  const targetObject = findModelInScene();
  
  return <DimensionLines visible={visible} animate={true} target={targetObject} />;
};

export default DimensionController;