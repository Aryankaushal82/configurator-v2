
import { useState } from 'react';
import { 
  Sliders, 
  Box, 
  Sun, 
  Play, 
  Pause, 
  Cube, 
  Shapes, 
  Layers, 
  RotateCcw, 
  PaintBucket, 
  Droplet, 
  Sparkles
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const materialPresets = {
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
};

const backgroundScenes = [
  'sunset', 'dawn', 'night', 'warehouse', 'forest', 
  'apartment', 'studio', 'park', 'lobby', 'city'
];

const meshMaterials = [
  'plastic', 'metal', 'glass', 'wood', 'ceramic', 
  'rubber', 'leather', 'fabric', 'pathar'
];

const baseTextures = [
  'wood', 'marble', 'metal', 'concrete', 'brick', 
  'tiles', 'fabric', 'leather'
];

const meshTypes = [
  'default', 'wireframe', 'points', 'outline'
];

interface ConfigPanelProps {
  onConfigChange: (config: any) => void;
  config: any;
}

export default function ConfigPanel({ onConfigChange, config }: ConfigPanelProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleChange = (key, value) => {
    onConfigChange({ [key]: value });
  };

  const applyMaterialPreset = (presetName) => {
    if (materialPresets[presetName]) {
      const preset = materialPresets[presetName];
      onConfigChange({
        meshMaterial: presetName,
        meshMetalness: preset.metalness,
        meshRoughness: preset.roughness
      });
      setActivePreset(presetName);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-4 space-y-6">
      <div className="flex items-center mb-2">
        <Sliders className="mr-2 text-primary" size={20} />
        <h2 className="text-2xl font-bold text-gray-800">Configurator</h2>
        <Badge variant="secondary" className="ml-2">
          Pro
        </Badge>
      </div>
      
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="material">Material</TabsTrigger>
          <TabsTrigger value="scene">Scene</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4 animate-fade-in-up">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <Box className="mr-2 text-primary" size={18} />
                  <span>Material Type</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {meshMaterials.map((material) => (
                    <TooltipProvider key={material}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={`p-2 rounded-md text-xs transition-colors text-center ${
                              config.meshMaterial === material
                                ? 'bg-primary text-white'
                                : 'bg-neutral-100 hover:bg-neutral-200'
                            }`}
                            onClick={() => applyMaterialPreset(material)}
                          >
                            {material.charAt(0).toUpperCase() + material.slice(1)}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p>{material.charAt(0).toUpperCase() + material.slice(1)}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">Metalness: {materialPresets[material].metalness}</span>
                              <span className="text-xs">Roughness: {materialPresets[material].roughness}</span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg overflow-hidden mt-3">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <Shapes className="mr-2 text-primary" size={18} />
                  <span>Display Style</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {meshTypes.map((type) => (
                    <button
                      key={type}
                      className={`p-2 rounded-md text-xs transition-colors ${
                        config.meshType === type
                          ? 'bg-primary text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200'
                      }`}
                      onClick={() => handleChange('meshType', type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg overflow-hidden mt-3">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <RotateCcw className="mr-2 text-primary" size={18} />
                  <span>Rotation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Rotate Model
                    </label>
                    <Slider
                      defaultValue={[config.rotation]}
                      max={Math.PI * 2}
                      step={0.01}
                      onValueChange={(value) => handleChange('rotation', value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>0°</span>
                      <span>180°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="material" className="space-y-4 animate-fade-in-up">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <PaintBucket className="mr-2 text-primary" size={18} />
                  <span>Surface Properties</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Metalness
                      </label>
                      <span className="text-xs text-gray-500">{config.meshMetalness.toFixed(1)}</span>
                    </div>
                    <Slider
                      defaultValue={[config.meshMetalness]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => handleChange('meshMetalness', value[0])}
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Matte</span>
                      <span>Metallic</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Roughness
                      </label>
                      <span className="text-xs text-gray-500">{config.meshRoughness.toFixed(1)}</span>
                    </div>
                    <Slider
                      defaultValue={[config.meshRoughness]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => handleChange('meshRoughness', value[0])}
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Glossy</span>
                      <span>Rough</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg overflow-hidden mt-3">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <Droplet className="mr-2 text-primary" size={18} />
                  <span>Base Surface</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Base Texture
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {baseTextures.map((texture) => (
                        <button
                          key={texture}
                          className={`p-2 rounded-md text-xs transition-colors ${
                            config.baseTexture === texture
                              ? 'bg-primary text-white'
                              : 'bg-neutral-100 hover:bg-neutral-200'
                          }`}
                          onClick={() => handleChange('baseTexture', texture)}
                        >
                          {texture.charAt(0).toUpperCase() + texture.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Base Metalness
                      </label>
                      <span className="text-xs text-gray-500">{config.baseMetalness.toFixed(1)}</span>
                    </div>
                    <Slider
                      defaultValue={[config.baseMetalness]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => handleChange('baseMetalness', value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Base Roughness
                      </label>
                      <span className="text-xs text-gray-500">{config.baseRoughness.toFixed(1)}</span>
                    </div>
                    <Slider
                      defaultValue={[config.baseRoughness]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => handleChange('baseRoughness', value[0])}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="scene" className="space-y-4 animate-fade-in-up">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <Sun className="mr-2 text-primary" size={18} />
                  <span>Environment</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Background Scene
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {backgroundScenes.map((scene) => (
                        <button
                          key={scene}
                          className={`p-2 rounded-md text-xs transition-colors ${
                            config.backgroundScene === scene
                              ? 'bg-primary text-white'
                              : 'bg-neutral-100 hover:bg-neutral-200'
                          }`}
                          onClick={() => handleChange('backgroundScene', scene)}
                        >
                          {scene.charAt(0).toUpperCase() + scene.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Background Color
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={config.backgroundColor || "#f0f0f0"}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.backgroundColor || "#f0f0f0"}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="flex-1 p-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg overflow-hidden mt-3">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <Play className="mr-2 text-primary" size={18} />
                  <span>Animation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-600">
                      Play Animation
                    </label>
                    <Switch
                      checked={config.animationPlaying}
                      onCheckedChange={(checked) => handleChange('animationPlaying', checked)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Animation Index
                    </label>
                    <Slider
                      disabled={!config.animationPlaying}
                      defaultValue={[config.animationIndex]}
                      max={5}
                      step={1}
                      onValueChange={(value) => handleChange('animationIndex', value[0])}
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>0</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg overflow-hidden mt-3">
              <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center">
                  <Sparkles className="mr-2 text-primary" size={18} />
                  <span>Effects</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-600">
                      Show Reflections
                    </label>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-600">
                      Show Shadows
                    </label>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-600">
                      Ambient Occlusion
                    </label>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-600">
                      Bloom Effect
                    </label>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
      
      <div className="border-t pt-4 mt-6">
        <div className="text-xs text-gray-500 mb-3">
          Preset Configurations
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 transition-colors"
            onClick={() => {
              onConfigChange({
                backgroundScene: 'studio',
                meshMaterial: 'plastic',
                meshMetalness: 0.2,
                meshRoughness: 0.5,
                baseTexture: 'wood',
                baseMetalness: 0.1,
                baseRoughness: 0.8
              });
            }}
          >
            Product Showcase
          </button>
          <button 
            className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-md text-xs hover:bg-purple-200 transition-colors"
            onClick={() => {
              onConfigChange({
                backgroundScene: 'night',
                meshMaterial: 'metal',
                meshMetalness: 0.9,
                meshRoughness: 0.1,
                baseTexture: 'metal',
                baseMetalness: 0.8,
                baseRoughness: 0.2
              });
            }}
          >
            Metallic Render
          </button>
          <button 
            className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-xs hover:bg-green-200 transition-colors"
            onClick={() => {
              onConfigChange({
                backgroundScene: 'forest',
                meshMaterial: 'wood',
                meshMetalness: 0.1,
                meshRoughness: 0.8,
                baseTexture: 'grass',
                baseMetalness: 0.1,
                baseRoughness: 0.9
              });
            }}
          >
            Natural Setting
          </button>
        </div>
      </div>
    </div>
  );
}
