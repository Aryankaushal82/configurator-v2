
import React, { useState } from 'react';
import { useConfigurator, handleColors } from '../contexts/ConfiguratorContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Individual texture swatch component
const TextureSwatch: React.FC<{
  image?: string;
  color?: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ image, color, name, isActive, onClick }) => {
  return (
    <div className="flex flex-col items-center mb-2">
      <button
        className={`w-12 h-12 rounded-md border-2 transition-all ${
          isActive ? 'border-black scale-110' : 'border-gray-200'
        } hover:border-gray-400`}
        style={{
          backgroundColor: image ? 'transparent' : color,
          backgroundImage: image ? `url(${image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onClick={onClick}
        aria-label={`Select ${name} material`}
        title={name}
      />
      <span className="text-xs mt-1 text-center">{name}</span>
    </div>
  );
};

// Color swatch component for handle colors
const ColorSwatch: React.FC<{
  color: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
  price: number;
}> = ({ color, name, isActive, onClick, price }) => {
  return (
    <div className="flex flex-col items-center mb-2">
      <button
        className={`w-12 h-12 rounded-md border-2 transition-all ${
          isActive ? 'border-black scale-110' : 'border-gray-200'
        } hover:border-gray-400`}
        style={{
          backgroundColor: color,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onClick={onClick}
        aria-label={`Select ${name} color`}
        title={name}
      />
      <span className="text-xs mt-1 text-center">{name}</span>
      {price > 0 && <span className="text-xs text-gray-500">+${price}</span>}
    </div>
  );
};

// Collapsible section component
const ConfigSection: React.FC<{
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  subtitle?: string;
}> = ({ title, children, isOpen, onToggle, subtitle }) => {
  return (
    <div className="border-b pb-4 mb-4">
      <div 
        className="flex items-center justify-between py-3 cursor-pointer" 
        onClick={onToggle}
      >
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isOpen && (
        <div className="mt-4 pl-2">
          {children}
        </div>
      )}
    </div>
  );
};

// Main configurator panel
const ConfiguratorPanel: React.FC = () => {
  const { 
    state,
    setSelectedHandle, 
    setSelectedLeg, 
    setSelectedMaterial,
    setHandleColor,
    materials
  } = useConfigurator();
  
  // Extract state variables for easier access
  const { selectedHandle, selectedLeg, selectedMaterial, handleColor, totalPrice } = state;
  
  // State for section toggles
  const [sections, setSections] = useState({
    handles: true,
    handleColors: false,
    materials: false,
    legs: false,
  });
  
  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  // Group materials by category for better organization
  const materialsByCategory = {
    TEXTURE: materials.filter(m => m.category === 'TEXTURE'),
  };
  
  return (
    <div className="bg-white h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Box Configurator</h1>
      <div className="w-32 h-2 bg-gray-200 mb-6"></div>
      
      <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
        Customize your box
        <span className="cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9H21M9 21V9M15 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </h2>
      
      {/* Handles Selection Section */}
      <ConfigSection
        title="1. Handles"
        subtitle="Choose your hardware style"
        isOpen={sections.handles}
        onToggle={() => toggleSection('handles')}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="handle1"
              name="handle"
              checked={selectedHandle === '603-02-Hardware-1'}
              onChange={() => setSelectedHandle('603-02-Hardware-1')}
              className="h-4 w-4"
            />
            <label htmlFor="handle1" className="flex-1">Hardware Style 1</label>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="handle2"
              name="handle"
              checked={selectedHandle === '603-02-Hardware-2'}
              onChange={() => setSelectedHandle('603-02-Hardware-2')}
              className="h-4 w-4"
            />
            <label htmlFor="handle2" className="flex-1">Hardware Style 2</label>
          </div>
        </div>
      </ConfigSection>
      
      {/* Handle Colors Section */}
      <ConfigSection
        title="2. Handle Color"
        subtitle="Choose handle color finish"
        isOpen={sections.handleColors}
        onToggle={() => toggleSection('handleColors')}
      >
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            {handleColors.map(colorOption => (
              <ColorSwatch
                key={colorOption.id}
                color={colorOption.value}
                name={colorOption.name}
                price={colorOption.price}
                isActive={handleColor === colorOption.value}
                onClick={() => setHandleColor(colorOption.value)}
              />
            ))}
          </div>
        </div>
      </ConfigSection>
      
      {/* Material Selection Section */}
      <ConfigSection
        title="3. Material Finish"
        subtitle="Choose your material"
        isOpen={sections.materials}
        onToggle={() => toggleSection('materials')}
      >
       {/* Texture Materials */}
       <div className="mb-6">
          <h4 className="text-md font-medium mb-3">Texture</h4>
          <div className="grid grid-cols-4 gap-3">
            {materialsByCategory.TEXTURE.map(material => (
              <TextureSwatch
                key={material.id}
                image={`/textures/${material.image}`}
                name={material.name}
                isActive={selectedMaterial?.id === material.id}
                onClick={() => setSelectedMaterial(material)}
              />
            ))}
          </div>
        </div>
      </ConfigSection>
      
      {/* Legs Selection Section */}
      <ConfigSection
        title="4. Legs"
        subtitle="Choose your leg style"
        isOpen={sections.legs}
        onToggle={() => toggleSection('legs')}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="legA"
              name="leg"
              checked={selectedLeg === 'Leg-A'}
              onChange={() => setSelectedLeg('Leg-A')}
              className="h-4 w-4"
            />
            <label htmlFor="legA" className="flex-1">Standard Legs (Leg A)</label>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="legB"
              name="leg"
              checked={selectedLeg === 'Leg-B'}
              onChange={() => setSelectedLeg('Leg-B')}
              className="h-4 w-4"
            />
            <label htmlFor="legB" className="flex-1">Premium Legs (Leg B)</label>
          </div>
        </div>
      </ConfigSection>
      
      {/* Price and Cart Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total Price</span>
          <div>
            <span className="text-2xl font-bold">${totalPrice}</span>
            <span className="text-gray-500 text-sm ml-2 line-through">${totalPrice + 45}</span>
          </div>
        </div>
        
        <button className="w-full py-4 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors">
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ConfiguratorPanel;