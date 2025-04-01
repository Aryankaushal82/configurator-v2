
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Share2, 
  Download, 
  QrCode, 
  Smartphone, 
  Info, 
  HelpCircle, 
  Ruler, 
  Compass, 
  Layers, 
  Cpu
} from "lucide-react";

const InfoPanel = () => {
  return (
    <div className="h-full p-4 overflow-y-auto bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Info className="mr-2" size={20} />
        Model Information
      </h2>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="animate-fade-in-up">
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Ruler className="mr-2" size={18} />
                Dimensions
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-3 rounded-md shadow-sm text-center">
                  <p className="text-xs text-gray-500">Width</p>
                  <p className="font-semibold">1.5m</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm text-center">
                  <p className="text-xs text-gray-500">Height</p>
                  <p className="font-semibold">2.1m</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm text-center">
                  <p className="text-xs text-gray-500">Depth</p>
                  <p className="font-semibold">0.8m</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Layers className="mr-2" size={18} />
                Model Details
              </h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Format</span>
                  <span className="font-medium">GLB</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Polygons</span>
                  <span className="font-medium">24,582</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Textures</span>
                  <span className="font-medium">4</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Animations</span>
                  <span className="font-medium">2</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">File Size</span>
                  <span className="font-medium">2.4 MB</span>
                </li>
              </ul>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Cpu className="mr-2" size={18} />
                Performance
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Rendering Speed</span>
                    <span className="text-sm text-gray-800">Good</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="text-sm text-gray-800">Low</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 rounded-full h-2" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Complexity</span>
                    <span className="text-sm text-gray-800">Medium</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 rounded-full h-2" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="share" className="animate-fade-in-up">
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                <Share2 className="mr-2" size={18} />
                Share Model
              </h3>
              <div className="flex flex-col space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center">
                  <Share2 size={16} className="mr-2" />
                  Share Link
                </button>
                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center">
                  <Download size={16} className="mr-2" />
                  Download Model
                </button>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                <QrCode className="mr-2" size={18} />
                AR Viewing
              </h3>
              <div className="bg-white p-4 rounded-md shadow-sm mb-3">
                <div className="w-full aspect-square bg-gray-200 flex items-center justify-center mb-3">
                  <QrCode size={120} />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with your mobile device to view this model in AR
                </p>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center">
                <Smartphone size={16} className="mr-2" />
                View in AR
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="help" className="animate-fade-in-up">
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Compass className="mr-2" size={18} />
                Navigation Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                  <span><strong>Rotate:</strong> Click and drag to rotate the model</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                  <span><strong>Zoom:</strong> Scroll or pinch to zoom in/out</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                  <span><strong>Pan:</strong> Right-click and drag to pan</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                  <span><strong>Reset:</strong> Double-click to reset view</span>
                </li>
              </ul>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <HelpCircle className="mr-2" size={18} />
                FAQ
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-1">What file formats are supported?</h4>
                  <p className="text-sm text-gray-600">We support GLB, GLTF, OBJ, FBX, and USDZ file formats.</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-1">How do I use AR mode?</h4>
                  <p className="text-sm text-gray-600">For AR viewing, scan the QR code with a mobile device or click "View in AR" on a compatible device.</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-1">What are the file size limits?</h4>
                  <p className="text-sm text-gray-600">Models up to 50MB are supported. For larger files, we recommend optimizing them first.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfoPanel;
