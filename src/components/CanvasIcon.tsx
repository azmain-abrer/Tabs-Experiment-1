import { CanvasType } from '../types';
import svgPathsM from '../imports/svg-hk6v9dtb4t';
import svgPathsL from '../imports/svg-aanrt793pm';

/**
 * CanvasIcon component
 * Renders the appropriate canvas type icon
 * Uses the same icons from BlankTab but sized for the tab bar (16x18px)
 */

interface CanvasIconProps {
  canvasType: CanvasType | null;
  size?: 'small' | 'large'; // Optional size variant
}

export default function CanvasIcon({ canvasType, size = 'small' }: CanvasIconProps) {
  // Use small variant SVG paths by default (optimized for tab bar size)
  const svgPaths = size === 'small' ? svgPathsM : svgPathsL;

  // Blank canvas icon (when no canvas type is selected)
  if (canvasType === null) {
    return (
      <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Tab-Icon">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
          <g id="Tab-Icon">
            {/* Blank canvas icon - using a simple rectangle shape */}
            <path 
              d="M2 0H14C15.1046 0 16 0.89543 16 2V16C16 17.1046 15.1046 18 14 18H2C0.89543 18 0 17.1046 0 16V2C0 0.89543 0.89543 0 2 0Z" 
              fill="var(--fill-0, #8E8E93)" 
            />
          </g>
        </svg>
      </div>
    );
  }

  // Render specific canvas type icon
  switch (canvasType) {
    case 'doc':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Doc-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <path d={svgPaths.p2b3600} fill="var(--fill-0, #0A84FF)" />
          </svg>
        </div>
      );
    
    case 'sheet':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Sheet-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <path d={svgPaths.p21295200} fill="var(--fill-0, #34C759)" />
          </svg>
        </div>
      );
    
    case 'comm':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Comm-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <g>
              <path 
                clipRule="evenodd" 
                d={svgPaths.p3b07a100} 
                fill="var(--fill-0, #FF453A)" 
                fillRule="evenodd" 
              />
              <path 
                d={svgPaths.p32a7aa80} 
                fill="var(--fill-0, #FF453A)" 
              />
            </g>
          </svg>
        </div>
      );
    
    case 'chat':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Chat-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <path d={svgPaths.p129b9600} fill="var(--fill-0, #BF5AF2)" />
          </svg>
        </div>
      );
    
    default:
      return null;
  }
}
