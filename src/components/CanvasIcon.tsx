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
            <path 
              d="M10.2846 3.9375V0.5625C10.2846 0.2475 10.0332 0 9.71322 0H1.14273C0.514229 0 0 0.50625 0 1.125V16.875C0 17.4938 0.514229 18 1.14273 18H14.8555C15.484 18 15.9982 17.4938 15.9982 16.875V6.1875C15.9982 5.8725 15.7468 5.625 15.4269 5.625H11.9987C11.0502 5.625 10.2846 4.87125 10.2846 3.9375ZM11.4273 0.5625V3.375C11.4273 3.99375 11.9415 4.5 12.57 4.5H15.4269C15.9411 4.5 16.1925 3.8925 15.8268 3.54375L12.3986 0.16875C12.0444 -0.19125 11.4273 0.0674999 11.4273 0.5625Z" 
              fill="var(--fill-0, #8E8E93)" 
              id="Icons/Blank-Canvas"
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
