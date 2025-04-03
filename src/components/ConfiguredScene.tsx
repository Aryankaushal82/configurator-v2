import React, { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader, Group, MeshStandardMaterial } from 'three';

const ConfiguredScene = React.forwardRef((props, ref) => {
  const { state } = useConfigurator();
  
  // Load main model
  const mainModel = useLoader(GLTFLoader, '/models/603-02.glb');

  // Load handle and leg models based on selection
  const handleModel = useLoader(GLTFLoader, state.selectedHandle === '603-02-Hardware-1'
    ? '/models/603-02 Hardware 1.glb'
    : '/models/603-02 Hardware 2.glb'
  );

  const legModel = useLoader(GLTFLoader, state.selectedLeg === 'Leg-A'
    ? '/models/Leg A.glb'
    : '/models/Leg B.glb'
  );

  // Load selected texture material
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (state.selectedMaterial) {
      const textureLoader = new TextureLoader();
      textureLoader.load(`/textures/${state.selectedMaterial.image}`, (loadedTexture) => {
        setTexture(loadedTexture);
      });
    }
  }, [state.selectedMaterial]);

  // Apply texture/material when loaded
  useEffect(() => {
    if (texture) {
      mainModel.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new MeshStandardMaterial({ map: texture });
        }
      });
    }
  }, [texture, mainModel]);

  return (
    <group ref={ref}>
      <primitive object={mainModel.scene} />
      <primitive object={handleModel.scene} />
      <primitive object={legModel.scene} />
    </group>
  );
});

export default ConfiguredScene;
