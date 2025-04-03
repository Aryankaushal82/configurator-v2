import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Minimize, Sun, Moon, Palette, Crosshair } from 'lucide-react';
import * as THREE from 'three';

const ViewerControls = () => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const [showCoordinates, setShowCoordinates] = useState(false);
  
  // State for background and fullscreen
  const [background, setBackground] = useState('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Camera/scene references
  const [camera, setCamera] = useState(null);
  const [controls, setControls] = useState(null);
  
  // Reference to check for interval clearing
  const intervalRef = useRef(null);
  
  // Get the configurator state from window
  const getConfiguratorState = () => {
    return window.configuratorState || {
      state: {
        backgroundSetting: background,
        isFullscreen: isFullscreen
      },
      setBackgroundSetting: (setting) => {
        setBackground(setting);
        if (window.configuratorState) {
          window.configuratorState.state.backgroundSetting = setting;
        }
      },
      toggleFullscreen: () => {
        const newIsFullscreen = !isFullscreen;
        setIsFullscreen(newIsFullscreen);
        if (window.configuratorState) {
          window.configuratorState.state.isFullscreen = newIsFullscreen;
        }
      }
    };
  };
  
  // Function to initialize camera and controls from external source
  useEffect(() => {
    const checkForSceneObjects = () => {
      if (window.sceneCamera && !camera) {
        setCamera(window.sceneCamera);
      }
      if (window.sceneControls && !controls) {
        setControls(window.sceneControls);
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }
      }
    };
    
    // Initial check
    checkForSceneObjects();
    
    // Set up polling interval
    intervalRef.current = setInterval(checkForSceneObjects, 300);
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [camera, controls]);
  
  // Function to handle zoom in
  const handleZoomIn = () => {
    if (!camera) {
      console.log('Zoom in - camera not initialized yet');
      return;
    }
    
    if ('fov' in camera && typeof camera.fov === 'number') {
      // PerspectiveCamera
      camera.fov = Math.max(camera.fov - 5, 20);
      camera.updateProjectionMatrix();
    } 
    else if ('zoom' in camera && typeof camera.zoom === 'number') {
      // OrthographicCamera
      camera.zoom = Math.min(camera.zoom * 1.2, 10);
      camera.updateProjectionMatrix();
    }
    else if ('position' in camera) {
      // Direct position adjustment for any camera with position
      const direction = new THREE.Vector3();
      if ('getWorldDirection' in camera) {
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, 1);
      }
    }
    
    if (controls && typeof controls.update === 'function') {
      controls.update();
    }
    updateCoordinates();
  };
  
  // Function to handle zoom out
  const handleZoomOut = () => {
    if (!camera) {
      console.log('Zoom out - camera not initialized yet');
      return;
    }
    
    if ('fov' in camera && typeof camera.fov === 'number') {
      // PerspectiveCamera
      camera.fov = Math.min(camera.fov + 5, 90);
      camera.updateProjectionMatrix();
    } 
    else if ('zoom' in camera && typeof camera.zoom === 'number') {
      // OrthographicCamera
      camera.zoom = Math.max(camera.zoom / 1.2, 0.1);
      camera.updateProjectionMatrix();
    }
    else if ('position' in camera) {
      // Direct position adjustment for any camera with position
      const direction = new THREE.Vector3();
      if ('getWorldDirection' in camera) {
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, -1);
      }
    }
    
    if (controls && typeof controls.update === 'function') {
      controls.update();
    }
    updateCoordinates();
  };

  // Function to update coordinates
  const updateCoordinates = () => {
    if (camera && 'position' in camera) {
      setCoordinates({
        x: parseFloat(camera.position.x.toFixed(2)),
        y: parseFloat(camera.position.y.toFixed(2)),
        z: parseFloat(camera.position.z.toFixed(2))
      });
    }
  };

  // Toggle coordinates display
  const toggleCoordinates = () => {
    const newShowCoordinates = !showCoordinates;
    setShowCoordinates(newShowCoordinates);
    if (newShowCoordinates) {
      updateCoordinates();
    }
  };
  
  // Listen for camera movements to update coordinates
  useEffect(() => {
    if (!controls || !showCoordinates) return;

    const handleCameraChange = () => {
      updateCoordinates();
    };
    
    if (typeof controls.addEventListener === 'function') {
      controls.addEventListener('change', handleCameraChange);
      
      // Initial coordinates update
      updateCoordinates();
      
      return () => {
        if (typeof controls.removeEventListener === 'function') {
          controls.removeEventListener('change', handleCameraChange);
        }
      };
    }
  }, [controls, showCoordinates]);
  
  // Get the current configurator state
  const configurator = getConfiguratorState();
  const state = configurator.state;
  
  return (
    <div className="configurator-controls space-y-4">
      <button 
        className="flex justify-center items-center w-10 h-10 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        onClick={handleZoomIn}
        aria-label="Zoom in"
      >
        <ZoomIn size={20} />
      </button>
      
      <button 
        className="flex justify-center items-center w-10 h-10 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        onClick={handleZoomOut}
        aria-label="Zoom out"
      >
        <ZoomOut size={20} />
      </button>
      
      <button 
        className="flex justify-center items-center w-10 h-10 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        onClick={configurator.toggleFullscreen}
        aria-label={state.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {state.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      
      <button 
        className={`flex justify-center items-center w-10 h-10 rounded-full shadow-md hover:bg-gray-100 transition-colors ${showCoordinates ? 'bg-blue-100' : 'bg-white'}`}
        onClick={toggleCoordinates}
        aria-label="Toggle coordinates"
      >
        <Crosshair size={20} />
      </button>
      
      {showCoordinates && (
        <div className="bg-white p-2 rounded-md shadow-md text-xs">
          <p>X: {coordinates.x}</p>
          <p>Y: {coordinates.y}</p>
          <p>Z: {coordinates.z}</p>
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-4">
        <button 
          className={`flex justify-center items-center w-10 h-10 rounded-full shadow-md hover:bg-gray-100 transition-colors ${state.backgroundSetting === 'light' ? 'bg-blue-100' : 'bg-white'}`}
          onClick={() => configurator.setBackgroundSetting('light')}
          aria-label="Light background"
        >
          <Sun size={20} />
        </button>
        
        <button 
          className={`flex justify-center items-center w-10 h-10 rounded-full shadow-md hover:bg-gray-100 transition-colors mt-4 ${state.backgroundSetting === 'dark' ? 'bg-blue-100' : 'bg-white'}`}
          onClick={() => configurator.setBackgroundSetting('dark')}
          aria-label="Dark background"
        >
          <Moon size={20} />
        </button>
        
        <button 
          className={`flex justify-center items-center w-10 h-10 rounded-full shadow-md hover:bg-gray-100 transition-colors mt-4 ${state.backgroundSetting === 'gradient' ? 'bg-blue-100' : 'bg-white'}`}
          onClick={() => configurator.setBackgroundSetting('gradient')}
          aria-label="Gradient background"
        >
          <Palette size={20} />
        </button>
      </div>
    </div>
  );
};

export default ViewerControls;