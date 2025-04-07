


import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, TextureLoader, RepeatWrapping, Color } from 'three';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import ModelLoader, { ModelErrorBoundary } from './ModelLoader';
import * as THREE from 'three';

const FurnitureModel: React.FC = () => {
  const { state } = useConfigurator();
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [modelErrors, setModelErrors] = useState<Record<string, boolean>>({});
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const mainModelPath = '/models/603-02.glb';
  const handlePath1 = '/models/603-02-Hardware-1.glb';
  const handlePath2 = '/models/603-02-Hardware-2.glb';
  const legPathA = '/models/Leg-A.glb';
  const legPathB = '/models/Leg-B.glb';

  const hasError = (modelPath: string) => !!modelErrors[modelPath];

  const handleModelError = (modelPath: string, error: Error) => {
    console.error(`Error loading model ${modelPath}:`, error);
    setModelErrors((prev) => ({ ...prev, [modelPath]: true }));
    setErrorMessage(`Failed to load model: ${modelPath.split('/').pop()}`);
    setShowErrorPopup(true);
  };

  // Memoized handle material
  const handleMaterial = useMemo(() => {
    const handleColor = state.handleColor || '#C0C0C0';
    return new MeshStandardMaterial({
      color: new Color(handleColor),
      roughness: 0.4,
      metalness: 0.8,
      envMapIntensity: 1,
    });
  }, [state.handleColor]);

  // Memoized body material with texture loading
  const bodyMaterial = useMemo(() => {
    if (!state.selectedMaterial) return null;

    const texturePath = `/textures/${state.selectedMaterial.image}`;
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(texturePath);

    if (THREE.SRGBColorSpace !== undefined) {
      texture.colorSpace = THREE.SRGBColorSpace;
    } else if (THREE.sRGBEncoding !== undefined) {
      texture.encoding = THREE.sRGBEncoding;
    }
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.flipY = false;
    texture.needsUpdate = true;

    const roughnessMapPath = '/roughness/roughnessMap.png';
    const roughnessMap = textureLoader.load(roughnessMapPath, undefined, undefined, () => null); // Fallback to null if roughness fails
    if (roughnessMap) {
      roughnessMap.wrapS = RepeatWrapping;
      roughnessMap.wrapT = RepeatWrapping;
      roughnessMap.needsUpdate = true;
    }

    const material = new MeshStandardMaterial({
      map: texture,
      roughnessMap: roughnessMap || undefined,
      roughness: roughnessMap ? 1 : 0.8,
      metalness: 0.2,
      normalScale: new THREE.Vector2(1, 1),
      envMapIntensity: 1,
    });

    return material;
  }, [state.selectedMaterial]);

  useEffect(() => {
    if (camera) {
      camera.position.set(2, 1, 2);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  // useFrame(() => {
  //   if (groupRef.current) groupRef.current.rotation.y += 0.001;
  // });

  const getModelKey = (baseName: string, modelPath: string) =>
    `${baseName}-${modelPath.split('/').pop()}`;

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  const selectedHandlePath = state.selectedHandle === '603-02-Hardware-1' ? handlePath1 : handlePath2;
  const selectedLegPath = state.selectedLeg === 'Leg-A' ? legPathA : legPathB;

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

        <ModelErrorBoundary>
          {!hasError(selectedHandlePath) && (
            <ModelLoader
              key={getModelKey('handle', selectedHandlePath)}
              modelPath={selectedHandlePath}
              material={handleMaterial}
              onError={(error) => handleModelError(selectedHandlePath, error)}
            />
          )}
        </ModelErrorBoundary>

        <ModelErrorBoundary>
          {!hasError(selectedLegPath) && (
            <ModelLoader
              key={getModelKey('leg', selectedLegPath)}
              modelPath={selectedLegPath}
              material={bodyMaterial}
              onError={(error) => handleModelError(selectedLegPath, error)}
            />
          )}
        </ModelErrorBoundary>
      </group>
      {showErrorPopup && <ErrorPopup />}
    </>
  );
};

export default React.memo(FurnitureModel); // Memoize FurnitureModel to prevent parent re-renders