
import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// Define types
export type HandleType = '603-02-Hardware-1' | '603-02-Hardware-2';
export type LegType = 'Leg-A' | 'Leg-B';
export type MaterialCategory = 'TEXTURE';
export type MaterialFinish = string;

export interface Material {
  id: string;
  name: string;
  image: string;
  category: MaterialCategory;
  price: number;
  finish?: MaterialFinish; // Optional finish property
}

export interface ConfiguratorState {
  selectedHandle: HandleType;
  selectedLeg: LegType;
  selectedMaterial: Material | null;
  handleColor: string; // New property for handle color
  basePrice: number;
  totalPrice: number;
  backgroundSetting: 'light' | 'dark' | 'gradient';
  isFullscreen: boolean;
}

interface ConfiguratorContextType {
  state: ConfiguratorState;
  setSelectedHandle: (handle: HandleType) => void;
  setSelectedLeg: (leg: LegType) => void;
  setSelectedMaterial: (material: Material) => void;
  setHandleColor: (color: string) => void; // New function for handle color
  setBackgroundSetting: (setting: 'light' | 'dark' | 'gradient') => void;
  toggleFullscreen: () => void;
  materials: Material[];
  getMaterialsByCategory: (category: MaterialCategory) => Material[];
}

// Create context
const ConfiguratorContext = createContext<ConfiguratorContextType | null>(null);

// Sample materials data with improved colors
const initialMaterials: Material[] = [
  { id: 't1', name: 'Bitmore', image: 'Bitmore.png', category: 'TEXTURE', price: 50 },
  { id: 't2', name: 'Brighton', image: 'Brighton.png', category: 'TEXTURE', price: 55 },
  { id: 't3', name: 'Cafelle', image: 'Cafelle.png', category: 'TEXTURE', price: 55 },
  { id: 't4', name: 'Cocoballa', image: 'Cocoballa.png', category: 'TEXTURE', price: 60 },
  { id: 't5', name: 'Columbian', image: 'Columbian.png', category: 'TEXTURE', price: 65 },
  { id: 't6', name: 'Empire', image: 'Empire.png', category: 'TEXTURE', price: 70 },
  { id: 't7', name: 'Fonthill', image: 'Fonthill.png', category: 'TEXTURE', price: 60 },
  { id: 't8', name: 'Macadamia Nut', image: 'Macadamia Nut.png', category: 'TEXTURE', price: 65 },
  { id: 't9', name: 'Natural Ash', image: 'Natural Ash.png', category: 'TEXTURE', price: 70 },
  { id: 't10', name: 'Raya', image: 'Raya.png', category: 'TEXTURE', price: 75 },
  { id: 't11', name: 'River Cherry', image: 'River Cherry.png', category: 'TEXTURE', price: 80 },
  { id: 't12', name: 'Studio Teak', image: 'Studio Teak.png', category: 'TEXTURE', price: 85 },
  { id: 't13', name: 'White Cypress', image: 'White Cypress.png', category: 'TEXTURE', price: 90 },
  { id: 't14', name: 'Williamsburg', image: 'Williamsburg.png', category: 'TEXTURE', price: 95 },
  { id: 't15', name: 'Windsor', image: 'Windsor.png', category: 'TEXTURE', price: 100 },
  { id: 't16', name: 'Amber', image: 'Amber.png', category: 'TEXTURE', price: 105 },
];

// Handle color options
export const handleColors = [
  { id: 'silver', name: 'Silver', value: '#C0C0C0', price: 0 },
  { id: 'gold', name: 'Gold', value: '#FFD700', price: 20 },
  { id: 'bronze', name: 'Bronze', value: '#CD7F32', price: 15 },
  { id: 'chrome', name: 'Chrome', value: '#E8E8E8', price: 10 },
  { id: 'black', name: 'Black', value: '#333333', price: 5 },
];

// Provider component
export const ConfiguratorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    selectedHandle: '603-02-Hardware-1',
    selectedLeg: 'Leg-A',
    selectedMaterial: initialMaterials[0], // Default to first material
    handleColor: handleColors[0].value, // Default handle color
    basePrice: 150,
    totalPrice: 200, // Base price + default material
    backgroundSetting: 'light',
    isFullscreen: false,
  });

  const setSelectedHandle = useCallback((handle: HandleType) => {
    setState(prev => ({
      ...prev,
      selectedHandle: handle,
      totalPrice: calculateTotalPrice(
        prev.basePrice, 
        prev.selectedMaterial, 
        handle, 
        prev.selectedLeg, 
        prev.handleColor
      ),
    }));
  }, []);

  const setSelectedLeg = useCallback((leg: LegType) => {
    setState(prev => ({
      ...prev,
      selectedLeg: leg,
      totalPrice: calculateTotalPrice(
        prev.basePrice, 
        prev.selectedMaterial, 
        prev.selectedHandle, 
        leg, 
        prev.handleColor
      ),
    }));
  }, []);

  const setSelectedMaterial = useCallback((material: Material) => {
    setState(prev => ({
      ...prev,
      selectedMaterial: material,
      totalPrice: calculateTotalPrice(
        prev.basePrice, 
        material, 
        prev.selectedHandle, 
        prev.selectedLeg, 
        prev.handleColor
      ),
    }));
  }, []);

  // New handler for handle color
  const setHandleColor = useCallback((color: string) => {
    setState(prev => ({
      ...prev,
      handleColor: color,
      totalPrice: calculateTotalPrice(
        prev.basePrice, 
        prev.selectedMaterial, 
        prev.selectedHandle, 
        prev.selectedLeg, 
        color
      ),
    }));
  }, []);

  const setBackgroundSetting = useCallback((setting: 'light' | 'dark' | 'gradient') => {
    setState(prev => ({ ...prev, backgroundSetting: setting }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const calculateTotalPrice = (
    basePrice: number, 
    material: Material | null, 
    handle: HandleType, 
    leg: LegType,
    handleColor: string
  ): number => {
    let total = basePrice;
    
    // Add material price
    if (material) {
      total += material.price;
    }
    
    // Handle specific pricing
    if (handle === '603-02-Hardware-2') {
      total += 15; // Premium handle costs more
    }
    
    // Leg specific pricing
    if (leg === 'Leg-B') {
      total += 10; // Premium leg costs more
    }
    
    // Handle color pricing
    const selectedColorPrice = handleColors.find(c => c.value === handleColor)?.price || 0;
    total += selectedColorPrice;
    
    return total;
  };

  // Helper function to filter materials by category
  const getMaterialsByCategory = useCallback((category: MaterialCategory) => {
    return initialMaterials.filter(material => material.category === category);
  }, []);

  const contextValue = useMemo(() => ({
    state,
    setSelectedHandle,
    setSelectedLeg,
    setSelectedMaterial,
    setHandleColor,
    setBackgroundSetting,
    toggleFullscreen,
    materials: initialMaterials,
    getMaterialsByCategory,
  }), [
    state, 
    setSelectedHandle, 
    setSelectedLeg,
    setSelectedMaterial,
    setHandleColor,
    setBackgroundSetting,
    toggleFullscreen,
    getMaterialsByCategory
  ]);

  return (
    <ConfiguratorContext.Provider value={contextValue}>
      {children}
    </ConfiguratorContext.Provider>
  );
};

// Custom hook for using the context
export const useConfigurator = () => {
  const context = useContext(ConfiguratorContext);
  if (!context) {
    throw new Error('useConfigurator must be used within a ConfiguratorProvider');
  }
  return context;
};