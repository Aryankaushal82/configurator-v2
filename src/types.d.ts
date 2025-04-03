
// Type declarations for non-TypeScript modules or custom elements
declare module 'qrcode.react' {
  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate?: boolean;
    };
  }
  
  const QRCode: React.FC<QRCodeProps>;
  export default QRCode;
}

// Add google model-viewer to window
declare global {
  interface Window {
    ModelViewerElement?: any;
  }
}
