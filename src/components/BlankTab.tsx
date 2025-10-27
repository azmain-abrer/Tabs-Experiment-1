import { useState, useEffect } from 'react';
import { CanvasType } from '../types';
import svgPathsM from '../imports/svg-hk6v9dtb4t';
import svgPathsL from '../imports/svg-aanrt793pm';

/**
 * BlankTab component - shown when a new tab is created
 * Displays canvas type selection (Doc, Sheet, Comm, Chat)
 * Responsive design: M variant for < 500px, L variant for >= 500px
 */

interface BlankTabProps {
  onCanvasTypeSelect: (type: CanvasType) => void;
}

export default function BlankTab({ onCanvasTypeSelect }: BlankTabProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  useEffect(() => {
    // Update viewport width on resize
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine which variant to use based on viewport width
  // Using approximate breakpoint: < 500px = M, >= 500px = L
  const isSmall = viewportWidth < 500;
  
  // Use appropriate SVG paths based on variant
  const svgPaths = isSmall ? svgPathsM : svgPathsL;
  
  // Responsive values - scaled down for better fit
  const headlineSize = isSmall ? 'text-[20px]' : 'text-[24px]';
  const labelSize = isSmall ? 'text-[14px]' : 'text-[16px]';
  const gridHeight = isSmall ? 'h-[280px]' : 'h-[320px]';
  const iconViewBox = isSmall ? "0 0 63 72" : "0 0 79 90";
  const maxWidth = isSmall ? '' : 'max-w-[480px]';

  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full" data-name="Blank-Tab">
      <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Canvas">
        <div className="flex flex-col items-center justify-center size-full">
          <div className="box-border content-stretch flex flex-col gap-[24px] items-center justify-center p-[20px] relative size-full">
            {/* Headline */}
            <div className={`box-border content-stretch flex items-center justify-center ${maxWidth} px-0 py-[12px] relative shrink-0 w-full`} data-name="Headline">
              <p className={`basis-0 font-['Outfit:Regular',_sans-serif] font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#222222] ${headlineSize} text-center`}>
                What would you like to create?
              </p>
            </div>

            {/* Canvas Type Selector Grid */}
            <div className={`gap-[16px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] ${gridHeight} ${maxWidth} relative shrink-0 w-full`} data-name="Canvas-Type-Selector">
              
              {/* New Doc */}
              <button
                onClick={() => onCanvasTypeSelect('doc')}
                className="[grid-area:1_/_1] bg-white relative rounded-[20px] shrink-0"
                data-name="New-Doc"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Doc-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <path d={isSmall ? svgPaths.p2b3600 : svgPaths.paec4200} fill="var(--fill-0, #0A84FF)" id="Doc-Icon" />
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Doc
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

              {/* New Sheet */}
              <button
                onClick={() => onCanvasTypeSelect('sheet')}
                className="[grid-area:1_/_2] bg-white relative rounded-[20px] shrink-0"
                data-name="New-Sheet"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Sheet-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <path d={isSmall ? svgPaths.p21295200 : svgPaths.p2b640f80} fill="var(--fill-0, #34C759)" id="Sheet-Icon" />
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Sheet
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

              {/* New Comm */}
              <button
                onClick={() => onCanvasTypeSelect('comm')}
                className="[grid-area:2_/_1] bg-white relative rounded-[20px] shrink-0"
                data-name="New-Comm"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[69.9997/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Comm-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <g id="Comm-Icon">
                          <path 
                            clipRule="evenodd" 
                            d={isSmall ? svgPaths.p3b07a100 : svgPaths.pd2dfc00} 
                            fill="var(--fill-0, #FF453A)" 
                            fillRule="evenodd" 
                          />
                          <path 
                            d={isSmall ? svgPaths.p32a7aa80 : svgPaths.p34aa4c00} 
                            fill="var(--fill-0, #FF453A)" 
                          />
                        </g>
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Comm
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

              {/* New Chat */}
              <button
                onClick={() => onCanvasTypeSelect('chat')}
                className="[grid-area:2_/_2] bg-white relative rounded-[20px] shrink-0"
                data-name="New-Chat"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Chat-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <path d={isSmall ? svgPaths.p129b9600 : svgPaths.p5c1e400} fill="var(--fill-0, #BF5AF2)" id="Chat-Icon" />
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Chat
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
