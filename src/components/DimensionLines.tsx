import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const DimensionLines = ({ visible, animate = true, target }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, depth: 0 });
  const [boxCenter, setBoxCenter] = useState(new THREE.Vector3());
  const [boxMin, setBoxMin] = useState(new THREE.Vector3());
  const [boxMax, setBoxMax] = useState(new THREE.Vector3());
  
  const linesRef = useRef();
  const { scene } = useThree();
  
  // Get dimensions of the model
  useEffect(() => {
    if (!visible) return;
    
    // Calculate the bounding box of the entire scene or target object
    const targetObject = target || scene;
    const box = new THREE.Box3().setFromObject(targetObject);
    
    if (box.isEmpty()) return;
    
    const min = box.min.clone();
    const max = box.max.clone();
    const center = box.getCenter(new THREE.Vector3());
    
    setBoxMin(min);
    setBoxMax(max);
    setBoxCenter(center);
    
    // Calculate dimensions
    setDimensions({
      width: Math.abs(max.x - min.x-5).toFixed(2),
      height: Math.abs(max.y - min.y+10).toFixed(2),
      depth: Math.abs(max.z - min.z-4).toFixed(2)
    });
  }, [visible, scene, target]);
  
  // Animation effect
  useFrame((state, delta) => {
    if (visible && animate && animationProgress < 1) {
      setAnimationProgress(prev => Math.min(prev + delta * 2, 1));
    } else if (!visible && animationProgress > 0) {
      setAnimationProgress(prev => Math.max(prev - delta * 2, 0));
    }
    
    if (linesRef.current) {
      const scale = animationProgress;
      linesRef.current.scale.set(scale, scale, scale);
      linesRef.current.visible = animationProgress > 0;
    }
  });

  // Create line geometries and materials
  const createLineGeometry = (points) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  };
  
  return (
    <group ref={linesRef} visible={visible || animationProgress > 0} position={[0, 0, 0]}>
  {/* X dimension line (Width) */}
  <group position={[0, 0, 0]}>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        dimensions.width, 0, 0
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>

    {/* Arrows */}
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        0.2, 0, -0.1
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        0.2, 0, 0.1
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        dimensions.width, 0, 0,
        dimensions.width - 0.2, 0, -0.1
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        dimensions.width, 0, 0,
        dimensions.width - 0.2, 0, 0.1
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>

    <Text
      position={[0.8, 0, -0.8]}
      color="black"
      fontSize={0.1}
      anchorX="center"
      anchorY="middle"
    >
      {`Width: ${dimensions.width}`}
    </Text>
  </group>

  {/* Y dimension line (Height) */}
  <group position={[0, 0, 0]}>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        0, dimensions.height, 0
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>

    {/* Arrows */}
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        0.1, 0.2, 0
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        -0.1, 0.2, 0
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, dimensions.height, 0,
        0.1, dimensions.height - 0.2, 0
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, dimensions.height, 0,
        -0.1, dimensions.height - 0.2, 0
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>

    <Text
      position={[-0.4, 0.7, -0.5]}
      color="black"
      fontSize={0.1}
      anchorX="center"
      anchorY="middle"
      rotation={[0, 0, Math.PI / 2]}
    >
      {`Height: ${dimensions.height}`}
    </Text>
  </group>

  {/* Z dimension line (Depth) */}
  <group position={[0, 0, 0]}>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        0, 0, dimensions.depth
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>

    {/* Arrows */}
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        -0.1, 0, 0.2
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, 0,
        0.1, 0, 0.2
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, dimensions.depth,
        -0.1, 0, dimensions.depth - 0.2
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>
    <mesh>
      <bufferGeometry args={[createLineGeometry([
        0, 0, dimensions.depth,
        0.1, 0, dimensions.depth - 0.2
      ])]} />
      <lineBasicMaterial color="black" linewidth={2} />
    </mesh>

    <Text
      position={[0, 0, 0.5]}
      color="black"
      fontSize={0.1}
      anchorX="center"
      anchorY="middle"
    >
      {`Depth: ${dimensions.depth}`}
    </Text>
  </group>

  <axesHelper args={[1]} position={[-0.3, 0, -0.5]} />
</group>

  );
};

export default DimensionLines;