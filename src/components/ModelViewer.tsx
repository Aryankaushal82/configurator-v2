
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  useAnimations, 
  Environment, 
  ContactShadows, 
  Html, 
  Bounds, 
  Line,
  PerspectiveCamera,
  useProgress,
  Center,
  Grid
} from '@react-three/drei';
import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Client, Storage, ID } from 'appwrite';
import * as THREE from 'three';
import { 
  RotateCw, 
  ZoomIn, 
  Image, 
  Camera, 
  Smartphone, 
  Download, 
  Share2,
  Loader,
  Grid as GridIcon,
  ArrowDown,
  UploadCloud,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { theme } from '@/styles/theme';

// Initialize Appwrite
const appwrite = new Client();
appwrite
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67ebffb60035df3d18be');

const storage = new Storage(appwrite);

// Texture definitions
const TEXTURES = {
  wood: './wood.jpg',
  marble: './marble.jpg',
  metal: './metal.jpg',
  concrete: './concrete.jpg',
  brick: './brick.jpg',
  tiles: './tiles.jpg',
  fabric: './fabric.jpg',
  leather: './leather.jpg'
};

// Model loading progress indicator
function LoadingIndicator() {
  const { progress, active } = useProgress();
  
  if (!active) return null;
  
  return (
    <Html center>
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="mb-4 relative">
          <RefreshCw className="text-primary animate-spin" size={40} />
        </div>
        <Progress className="w-56 h-2 mb-2" value={progress} />
        <div className="text-neutral-700 text-sm flex items-center gap-2">
          <span>Loading 3D Model...</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
    </Html>
  );
}

// Camera control buttons component
function CameraControls({ onResetView }) {
  const { camera } = useThree();
  
  const setCamera = (position) => {
    camera.position.set(...position);
    camera.lookAt(0, 0, 0);
  };
  
  return (
    <Html position={[0, 0, 0]} style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-2 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setCamera([0, 5, 10])}
          title="Front View"
        >
          <ArrowDown className="rotate-180" size={14} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setCamera([10, 0, 0])}
          title="Right View"
        >
          <ArrowDown className="rotate-90" size={14} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setCamera([0, 10, 0])}
          title="Top View"
        >
          <ArrowDown className="-rotate-90" size={14} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onResetView}
          title="Reset View"
        >
          <RotateCw size={14} />
        </Button>
      </div>
    </Html>
  );
}

// Component for displaying dimensions in 3D space
function DimensionLines({ size, visible, modelSize, position }) {
  const width = size[0];
  const height = size[1];
  const depth = size[2];

  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;

  const originX = -halfWidth;
  const originY = -halfHeight;
  const originZ = -halfDepth;

  if (!visible) return null;
  
  return (
    <group position={[0, modelSize[1] + originY, 0]}>
      {/* X-axis measurement (width) */}
      <Line
        points={[
          [originX, originY, originZ],
          [originX + width, originY, originZ],
        ]}
        color="#3B82F6"
        lineWidth={2}
      />
      <Html position={[originX + width / 2, originY - 0.2, originZ]} center>
        <div className="bg-white/80 backdrop-blur-sm text-neutral-800 px-2 py-1 rounded text-xs font-medium shadow-sm border border-neutral-200">
          Width: {width.toFixed(2)}m
        </div>
      </Html>

      {/* Y-axis measurement (height) */}
      <Line
        points={[
          [originX, originY, originZ],
          [originX, originY + height, originZ],
        ]}
        color="#10B981"
        lineWidth={2}
      />
      <Html position={[originX - 0.2, originY + height / 2, originZ]} center>
        <div className="bg-white/80 backdrop-blur-sm text-neutral-800 px-2 py-1 rounded text-xs font-medium shadow-sm border border-neutral-200">
          Height: {height.toFixed(2)}m
        </div>
      </Html>

      {/* Z-axis measurement (depth) */}
      <Line
        points={[
          [originX, originY, originZ],
          [originX, originY, originZ + depth],
        ]}
        color="#EC4899"
        lineWidth={2}
      />
      <Html position={[originX, originY - 0.2, originZ + depth / 2]} center>
        <div className="bg-white/80 backdrop-blur-sm text-neutral-800 px-2 py-1 rounded text-xs font-medium shadow-sm border border-neutral-200">
          Depth: {depth.toFixed(2)}m
        </div>
      </Html>
    </group>
  );
}

// Component for the 3D model
function Model({ url, config, onModelLoaded }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);
  const [modelSize, setModelSize] = useState([1, 1, 1]);
  const [loading, setLoading] = useState(true);
  
  // Load textures
  const [
    colorMap,
    displacementMap,
    normalMap,
    roughnessMap,
    aoMap
  ] = useLoader(THREE.TextureLoader, [
    './PavingStones092_1K_Color.jpg',
    './PavingStones092_1K_Displacement.jpg',
    './PavingStones092_1K_Normal.jpg',
    './PavingStones092_1K_Roughness.jpg',
    './PavingStones092_1K_AmbientOcclusion.jpg'
  ]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Apply material preset
        const materialPreset = config.meshMaterial ? {
          plastic: {
            color: '#f0f0f0',
            metalness: 0.2,
            roughness: 0.6
          },
          metal: {
            color: '#a0a0a0',
            metalness: 0.8,
            roughness: 0.3
          },
          glass: {
            color: '#ffffff',
            metalness: 0,
            roughness: 0,
            transparent: true,
            opacity: 0.5
          },
          wood: {
            color: '#8B4513',
            metalness: 0.1,
            roughness: 0.7
          },
          ceramic: {
            color: '#ffffff',
            metalness: 0.3,
            roughness: 0.4
          },
          rubber: {
            color: '#333333',
            metalness: 0,
            roughness: 0.9
          },
          leather: {
            color: '#5D4037',
            metalness: 0.1,
            roughness: 0.6
          },
          fabric: {
            color: '#BDBDBD',
            metalness: 0,
            roughness: 0.8
          },
          pathar: {
            color: '#8c8c8c',
            metalness: 0.5,
            roughness: 1.0
          }
        }[config.meshMaterial] : { color: '#f0f0f0', metalness: 0.2, roughness: 0.6 };
        
        let newMaterial;
        switch(config.meshMaterial) {
          case 'glass':
            newMaterial = new THREE.MeshPhysicalMaterial({
              color: materialPreset.color,
              metalness: config.meshMetalness,
              roughness: config.meshRoughness,
              transmission: 1,
              opacity: materialPreset.opacity,
              transparent: true,
              reflectivity: 0.5,
              ior: 1.5
            });
            break;
          case 'metal':
            newMaterial = new THREE.MeshStandardMaterial({
              color: materialPreset.color,
              metalness: Math.max(config.meshMetalness, 0.6),
              roughness: Math.min(config.meshRoughness, 0.4)
            });
            break;
          case 'pathar':
            newMaterial = new THREE.MeshStandardMaterial({
              map: colorMap,
              displacementMap: displacementMap,
              normalMap: normalMap,
              roughnessMap: roughnessMap,
              aoMap: aoMap,
              roughness: 1,
              metalness: 0.5
            });
            break;
          default:
            newMaterial = new THREE.MeshStandardMaterial({
              color: materialPreset.color,
              metalness: config.meshMetalness,
              roughness: config.meshRoughness
            });
        }

        // Apply mesh visualization type
        switch(config.meshType) {
          case 'wireframe':
            newMaterial.wireframe = true;
            break;
          case 'points':
            const pointsMaterial = new THREE.PointsMaterial({ 
              color: newMaterial.color, 
              size: 0.02,
              opacity: 0.8,
              transparent: true
            });
            child.material = pointsMaterial;
            break;
          default:
            child.material = newMaterial;
        }
      }
    });
    
    // Calculate model dimensions and position
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    setLoading(false);
    setModelSize([size.x, size.y, size.z]);
    onModelLoaded(size, scene.position);
  }, [scene, config, onModelLoaded, colorMap, displacementMap, normalMap, roughnessMap, aoMap]);

  // Handle animations
  useEffect(() => {
    if (animations.length > 0) {
      const action = actions[Object.keys(actions)[config.animationIndex]];
      if (action) {
        config.animationPlaying ? action.reset().play() : action.stop();
      }
    }
  }, [animations, actions, config.animationIndex, config.animationPlaying]);

  // Apply rotation
  scene.rotation.y = config.rotation;

  return <primitive ref={group} object={scene} />;
}

// Component for taking screenshots
function ScreenshotButton({ onScreenshot }) {
  const { gl, scene, camera } = useThree();
  
  const takeScreenshot = useCallback(() => {
    gl.render(scene, camera);
    const dataURL = gl.domElement.toDataURL('image/png');
    onScreenshot(dataURL);
  }, [gl, scene, camera, onScreenshot]);
  
  return (
    <Html position={[0, 0, 0]} style={{ display: 'none' }}>
      <button id="hidden-screenshot-trigger" onClick={takeScreenshot} />
    </Html>
  );
}

// AR View component
function ARView({ modelUrl, visible, onClose, modelId }) {
  const modelViewerRef = useRef(null);
  const [arUrl, setArUrl] = useState('');
  const [qrVisible, setQrVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (visible && modelUrl && modelId) {
      const directModelUrl = storage.getFileDownload('67ec002100025524dd4b', modelId);
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/ar-view.html?modelUrl=${encodeURIComponent(directModelUrl)}`;
      setArUrl(fullUrl);
      setShareLink(fullUrl);
      
      if (modelViewerRef.current) {
        modelViewerRef.current.src = directModelUrl;
      }
    }
  }, [visible, modelUrl, modelId]);

  if (!visible) return null;

  const toggleQRCode = () => {
    setQrVisible(!qrVisible);
    if (qrVisible) setShareVisible(false);
  };

  const toggleShareOptions = () => {
    setShareVisible(!shareVisible);
    if (shareVisible) setQrVisible(false);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        toast({
          title: "Link copied",
          description: "URL has been copied to clipboard"
        });
      })
      .catch(err => {
        console.error('Could not copy link: ', err);
        toast({
          title: "Copy failed",
          description: "Please try again",
          variant: "destructive"
        });
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl h-5/6 flex flex-col shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Smartphone className="mr-2 text-primary" size={20} />
            Augmented Reality View
          </h3>
          <div className="flex gap-2">
            <Button 
              onClick={toggleQRCode}
              variant={qrVisible ? "secondary" : "outline"}
              className="flex items-center gap-1.5"
            >
              <QRCodeSVG size={16} />
              <span>QR Code</span>
            </Button>
            <Button 
              onClick={toggleShareOptions}
              variant={shareVisible ? "secondary" : "outline"}
              className="flex items-center gap-1.5"
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
              size="icon"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* QR Code overlay */}
        {qrVisible && (
          <div className="absolute top-24 right-6 bg-white p-6 rounded-xl shadow-xl z-10 border border-neutral-100 animate-fade-in">
            <div className="text-lg font-medium mb-3 text-center">Scan to view in AR</div>
            <div className="p-2 bg-white border border-neutral-200 rounded-lg mb-3">
              <QRCodeSVG 
                value={arUrl} 
                size={220} 
                bgColor={"#FFFFFF"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
              />
            </div>
            <div className="text-sm text-neutral-600 max-w-xs text-center">
              Point your camera at this QR code to open the AR view on your mobile device
            </div>
          </div>
        )}

        {/* Share options overlay */}
        {shareVisible && (
          <div className="absolute top-24 right-6 bg-white p-6 rounded-xl shadow-xl z-10 w-80 border border-neutral-100 animate-fade-in">
            <div className="text-lg font-medium mb-4 text-center">Share this model</div>
            <div className="flex items-center mb-4">
              <input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="flex-grow p-2 border border-neutral-300 rounded-l-md text-sm truncate bg-neutral-50" 
              />
              <Button 
                onClick={copyLinkToClipboard}
                variant="secondary"
                className="rounded-l-none"
              >
                Copy
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  toast({
                    title: "Sharing via Email",
                    description: "Email sharing feature coming soon!"
                  });
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Share via Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  toast({
                    title: "Download Feature",
                    description: "Download functionality coming soon!"
                  });
                }}
              >
                <Download size={18} />
                Download Model
              </Button>
            </div>
          </div>
        )}

        <div className="flex-grow relative bg-neutral-100 rounded-lg overflow-hidden">
          <model-viewer
            ref={modelViewerRef}
            src={modelUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            ar-scale="auto"
            ar-placement="floor"
            interaction-prompt="auto"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="0.5"
            style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}
          >
            <button slot="ar-button" className="ar-button bg-primary hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
              <span className="mr-2">View in your space</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 9V3H15M3 15V21H9M21 3L15 9M9 21L3 15M16 13H17M12 13H13M8 13H9M12 17V16M12 8V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </model-viewer>
          
          <div className="absolute bottom-6 left-6 flex flex-col gap-3 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="text-sm font-medium text-gray-800">AR Instructions:</div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div className="text-sm text-gray-700">Tap "View in your space" to launch AR</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div className="text-sm text-gray-700">Point your camera at an open area on the floor</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div className="text-sm text-gray-700">Tap to place the model in your space</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// File uploader component
function ModelUploader({ onModelUploaded, isUploading, setIsUploading }) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };
  
  const uploadFile = async (file) => {
    // Check if the file is a valid 3D model
    const validExtensions = ['.glb', '.gltf', '.obj', '.fbx', '.usdz'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      toast({
        title: "Invalid file format",
        description: "Please upload a GLB, GLTF, OBJ, FBX, or USDZ file",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a unique filename
      const timestamp = new Date().getTime();
      const uniqueFilename = `model_${timestamp}${extension}`;
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 300);
      
      // Upload file to Appwrite Storage
      const result = await storage.createFile(
        '67ec002100025524dd4b',
        ID.unique(),
        file
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Generate public URL for the file
      const fileUrl = storage.getFileDownload('67ec002100025524dd4b', result.$id);
      
      toast({
        title: "Upload successful",
        description: "Your 3D model has been uploaded and is ready to view.",
      });
      
      // Pass the URL and file ID back
      onModelUploaded(fileUrl, result.$id);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="mb-6">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-6 transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-neutral-300 bg-neutral-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`mb-4 transition-transform ${dragActive ? 'scale-110' : 'scale-100'}`}>
            <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-2">
              <UploadCloud size={32} />
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-2">Upload 3D Model</h3>
          <p className="text-neutral-600 text-sm mb-4 max-w-md">
            Drag and drop your 3D model here, or click to browse your files
          </p>
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader className="animate-spin" size={16} />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                <span>Select File</span>
              </>
            )}
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".glb,.gltf,.obj,.fbx,.usdz"
            className="hidden"
            disabled={isUploading}
          />
          
          <p className="text-xs text-neutral-500 mt-4">
            Supported formats: GLB, GLTF, OBJ, FBX, USDZ
          </p>
        </div>
        
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-neutral-600 mb-1">
              <span>Uploading {uploadProgress === 100 ? 'complete' : `${uploadProgress}%`}</span>
              {uploadProgress === 100 && <CheckCircle className="text-green-500" size={16} />}
            </div>
            <Progress value={uploadProgress} className="h-2 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

// Main ModelViewer component
export default function ModelViewer({ modelUrl, config }) {
  const { toast } = useToast();
  const [modelSize, setModelSize] = useState([1, 1, 1]);
  const [modelPosition, setModelPosition] = useState([0, 0, 0]);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [uploadedModelUrl, setUploadedModelUrl] = useState(modelUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [modelId, setModelId] = useState(null);
  const canvasRef = useRef();
  const screenshotTriggerRef = useRef();
  const boundsRef = useRef();

  const handleModelLoaded = (size, position) => {
    setModelSize([size.x, size.y, size.z]);
    setModelPosition([position.x, position.y, position.z]);
  };

  const handleModelUploaded = (url, id) => {
    setUploadedModelUrl(url);
    setModelId(id);
    console.log("Model uploaded with ID:", id);
  };

  const handleScreenshot = (dataURL) => {
    setScreenshotPreview(dataURL);
    setShowPreview(true);
  };
  
  const triggerScreenshot = () => {
    const triggerButton = document.getElementById('hidden-screenshot-trigger');
    if (triggerButton) {
      triggerButton.click();
    }
  };

  const downloadScreenshot = () => {
    if (screenshotPreview) {
      const link = document.createElement('a');
      link.href = screenshotPreview;
      link.download = 'model-screenshot.png';
      link.click();
      
      toast({
        title: "Screenshot saved",
        description: "Your screenshot has been downloaded."
      });
    }
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const toggleARView = () => {
    if (!uploadedModelUrl) {
      toast({
        title: "No model loaded",
        description: "Please upload a 3D model first",
        variant: "destructive"
      });
      return;
    }
    setShowAR(!showAR);
  };

  const resetCamera = () => {
    if (boundsRef.current) {
      boundsRef.current.refresh().fit();
    }
  };

  // Calculate base and camera positioning based on model size
  const baseDimensions = [
    Math.max(modelSize[0] * 2, 4),
    Math.max(modelSize[2] * 2, 4),
  ];
  const cameraDistance = Math.max(modelSize[1] * 3, 5);

  // Buttons for the 3D viewer
  const ViewerButtons = () => (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5 shadow-lg"
        onClick={() => setShowDimensions(!showDimensions)}
      >
        <Ruler size={14} className="mr-1" /> 
        {showDimensions ? "Hide Dimensions" : "Show Dimensions"}
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5 shadow-lg"
        onClick={() => setShowGrid(!showGrid)}
      >
        <GridIcon size={14} className="mr-1" /> 
        {showGrid ? "Hide Grid" : "Show Grid"}
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5 shadow-lg"
        onClick={triggerScreenshot}
      >
        <Camera size={14} className="mr-1" /> 
        Take Screenshot
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-1.5 shadow-lg"
        onClick={toggleARView}
        disabled={!uploadedModelUrl || isUploading}
      >
        <Smartphone size={14} className="mr-1" /> 
        View in AR
      </Button>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Model Upload Section */}
      {!uploadedModelUrl && (
        <ModelUploader 
          onModelUploaded={handleModelUploaded} 
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      )}
      
      <div className="relative flex-grow">
        {uploadedModelUrl && <ViewerButtons />}

        {/* Screenshot preview modal */}
        {showPreview && screenshotPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-4xl max-h-screen overflow-auto shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Image className="mr-2 text-primary" size={20} />
                  Screenshot Preview
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closePreview}
                >
                  <X size={18} />
                </Button>
              </div>
              <div className="mb-6 border border-neutral-200 rounded-lg overflow-hidden">
                <img src={screenshotPreview} alt="Model screenshot" className="max-w-full h-auto" />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={closePreview}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default"
                  className="flex items-center gap-1.5"
                  onClick={downloadScreenshot}
                >
                  <Download size={16} />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AR View Modal */}
        <ARView 
          modelUrl={uploadedModelUrl} 
          visible={showAR} 
          onClose={toggleARView}
          modelId={modelId}
        />

        <Canvas
          shadows
          camera={{
            position: [0, modelSize[1] * 1.5, cameraDistance],
            fov: 60,
          }}
          ref={canvasRef}
          gl={{ preserveDrawingBuffer: true }}
        >
          <color attach="background" args={[config.backgroundColor || "#f0f0f0"]} />
          <fog
            attach="fog"
            args={[config.backgroundColor || "#f0f0f0", cameraDistance, cameraDistance * 2]}
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            castShadow
            position={[10, 20, 15]}
            intensity={1.5}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-10, 0, -20]} intensity={0.5} />

          <Suspense fallback={<LoadingIndicator />}>
            <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={50} />
            <Environment preset={config.backgroundScene} background />
            
            <Bounds ref={boundsRef} fit clip observe margin={1.2}>
              {uploadedModelUrl && (
                <Center>
                  <Model url={uploadedModelUrl} config={config} onModelLoaded={handleModelLoaded} />
                </Center>
              )}
            </Bounds>

            {/* Dimension lines and measurements */}
            <DimensionLines size={modelSize} visible={showDimensions} modelSize={modelSize} position={modelPosition} />

            {/* Grid */}
            {showGrid && (
              <Grid
                position={[0, -modelSize[1] / 8, 0]}
                args={[20, 20]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#6b7280"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#3B82F6"
                fadeDistance={30}
                fadeStrength={1}
              />
            )}

            {/* Base Plane */}
            <mesh
              position={[0, -modelSize[1] / 8 + 0.001, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[baseDimensions[0], baseDimensions[1], 1]}
              receiveShadow
            >
              <planeGeometry />
              <meshStandardMaterial
                color={config.backgroundColor || "#f0f0f0"}
                metalness={0.1}
                roughness={0.9}
              />
            </mesh>

            {/* Contact Shadows */}
            <ContactShadows
              position={[0, -modelSize[1] / 8 + 0.01, 0]}
              opacity={0.7}
              blur={2}
              far={modelSize[2] * 2}
              scale={[baseDimensions[0], baseDimensions[1], 1]}
            />
            
            {/* Camera controls */}
            <CameraControls onResetView={resetCamera} />
            
            {/* Screenshot button component */}
            <ScreenshotButton onScreenshot={handleScreenshot} ref={screenshotTriggerRef} />
          </Suspense>

          <OrbitControls 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.8} 
            enablePan 
            enableZoom 
            makeDefault
          />
        </Canvas>
      </div>
    </div>
  );
}
