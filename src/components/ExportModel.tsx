

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import * as THREE from "three";

/**
 * Converts a THREE.js texture to a canvas that can be safely exported
 * @param {THREE.Texture} texture - The texture to convert
 * @returns {Promise<HTMLCanvasElement>} - A promise resolving to a canvas element
 */
const textureToCanvas = async (texture) => {
  return new Promise((resolve, reject) => {
    try {
      // Skip invalid textures
      if (!texture || !texture.image) {
        return resolve(null);
      }
      
      const image = texture.image;
      
      // Create a canvas and get its 2D context
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.warn('Could not get 2D context for texture conversion');
        return resolve(null);
      }
      
      // Set canvas dimensions to match the image
      canvas.width = image.width || 1;
      canvas.height = image.height || 1;
      
      // Different handling based on image type
      if (image instanceof HTMLImageElement || image instanceof Image) {
        // For regular images, draw directly to canvas
        ctx.drawImage(image, 0, 0);
        resolve(canvas);
      } else if (image instanceof HTMLCanvasElement) {
        // Canvas can be used directly
        resolve(image);
      } else if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
        // For ImageBitmap, draw to canvas
        ctx.drawImage(image, 0, 0);
        resolve(canvas);
      } else {
        // For other formats (like image data from WebGL textures)
        console.warn('Unsupported image type, attempting conversion:', image);
        
        // Try to create a new image and load the texture data
        const tempImg = new Image();
        
        // Create a temporary canvas to get image data URL
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          // If image has data property, try to use it
          if (image.data && image.width && image.height) {
            const imageData = new ImageData(
              new Uint8ClampedArray(image.data),
              image.width,
              image.height
            );
            tempCtx.putImageData(imageData, 0, 0);
          }
          
          // Convert to data URL and load into temp image
          tempImg.onload = () => {
            ctx.drawImage(tempImg, 0, 0);
            resolve(canvas);
          };
          
          tempImg.onerror = () => {
            console.error('Failed to load image data for texture conversion');
            // Return blank canvas rather than failing completely
            resolve(canvas);
          };
          
          tempImg.src = tempCanvas.toDataURL();
        } else {
          // If all else fails, return a blank canvas
          resolve(canvas);
        }
      }
    } catch (error) {
      console.error('Error converting texture to canvas:', error);
      // Return a blank canvas rather than failing completely
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1;
      fallbackCanvas.height = 1;
      resolve(fallbackCanvas);
    }
  });
};

/**
 * Processes a material to ensure its textures are exportable
 * @param {THREE.Material} material - The material to process
 * @returns {Promise<void>} - A promise that resolves when processing is complete
 */
const processMaterial = async (material) => {
  if (!material) return;
  
  // Identify texture properties in the material
  const textureProps = Object.entries(material)
    .filter(([_, value]) => value && value.isTexture);
  
  // Process each texture property
  for (const [prop, texture] of textureProps) {
    try {
      // Convert texture image to canvas
      const canvas = await textureToCanvas(texture);
      
      if (canvas) {
        // Create a new texture from the canvas
        const newTexture = new THREE.Texture(canvas);
        
        // Copy essential properties from the original texture
        newTexture.wrapS = texture.wrapS;
        newTexture.wrapT = texture.wrapT;
        newTexture.magFilter = texture.magFilter;
        newTexture.minFilter = texture.minFilter;
        newTexture.mapping = texture.mapping;
        newTexture.encoding = texture.encoding;
        newTexture.flipY = texture.flipY;
        newTexture.needsUpdate = true;
        
        // Replace the original texture
        material[prop] = newTexture;
      }
    } catch (error) {
      console.error(`Error processing texture for property '${prop}':`, error);
    }
  }
};

/**
 * Processes the scene to ensure all materials and textures are exportable
 * @param {THREE.Object3D} scene - The scene to process
 * @returns {Promise<THREE.Object3D>} - A promise resolving to the processed scene
 */
const processScene = async (scene) => {
  // Clone the scene to avoid modifying the original
  const clonedScene = scene.clone();
  
  // Process all materials in the scene
  const promises = [];
  
  clonedScene.traverse((object) => {
    if (!object.material) return;
    
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    
    materials.forEach(material => {
      promises.push(processMaterial(material));
    });
  });
  
  // Wait for all texture processing to complete
  await Promise.all(promises);
  
  return clonedScene;
};

/**
 * Exports the configured model as a GLB file
 * @param {THREE.Object3D} scene - The THREE.js scene to export
 * @returns {Promise<Blob>} - A promise resolving to the GLB blob
 */
export const exportConfiguredModel = async (scene) => {
  try {
    console.log("Starting export process...");
    
    // Process the scene for export
    const processedScene = await processScene(scene);
    console.log("Scene processing complete");
    
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      
      const options = {
        binary: true,
        includeCustomExtensions: true,
        animations: scene.animations || []
      };
      
      exporter.parse(
        processedScene,
        (result) => {
          console.log("Export successful");
          const blob = new Blob([result], { type: 'application/octet-stream' });
          resolve(blob);
        },
        (error) => {
          console.error('Export error:', error);
          reject(error);
        },
        options
      );
    });
  } catch (error) {
    console.error('Export preparation error:', error);
    throw error;
  }
};


