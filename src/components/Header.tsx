
import { useState } from 'react';
import { Menu, Settings, Share2, Download, Upload, Info, Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onShowConfig: () => void;
  onShowInfo: () => void;
}

const Header = ({ onShowConfig, onShowInfo }: HeaderProps) => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: isDarkMode ? "Light Mode Enabled" : "Dark Mode Enabled",
      description: "Theme preference has been updated.",
    });
    // In a real implementation, we would apply dark mode classes to the document
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            <Menu size={20} />
          </Button>
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ShapeShifter
            </span>
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Beta
            </span>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onShowConfig}
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Configure</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onShowInfo}
          >
            <Info size={16} />
            <span className="hidden sm:inline">Info</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => toast({
              title: "Share Feature",
              description: "Sharing functionality will be available soon!",
            })}
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} 
          absolute top-16 right-0 left-0 bg-white shadow-md z-50 p-4 border-b border-neutral-200 md:hidden
          transition-all duration-300 animate-fade-in`}
        >
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => {
                onShowConfig();
                setIsMenuOpen(false);
              }}
            >
              <Settings size={16} className="mr-2" />
              Configure
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => {
                onShowInfo();
                setIsMenuOpen(false);
              }}
            >
              <Info size={16} className="mr-2" />
              Information
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => toast({
                title: "Share Feature",
                description: "Sharing functionality will be available soon!",
              })}
            >
              <Share2 size={16} className="mr-2" />
              Share Model
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
