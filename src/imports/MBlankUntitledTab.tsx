import svgPaths from "./svg-hk6v9dtb4t";

function Headline() {
  return (
    <div className="box-border content-stretch flex items-center justify-center px-0 py-[20px] relative shrink-0 w-full" data-name="Headline">
      <p className="basis-0 font-['Outfit:Regular',_sans-serif] font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#222222] text-[24px] text-center">What would you like to create?</p>
    </div>
  );
}

function NewDoc() {
  return (
    <div className="[grid-area:1_/_1] bg-white relative rounded-[20px] shrink-0" data-name="New-Doc">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[15px] items-center justify-center pb-[25px] pt-[35px] px-[15px] relative size-full">
          <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Doc-Icon">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
              <path d={svgPaths.p2b3600} fill="var(--fill-0, #0A84FF)" id="Doc-Icon" />
            </svg>
          </div>
          <p className="[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] text-[16px] text-center text-nowrap w-[min-content]">New Doc</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function NewSheet() {
  return (
    <div className="[grid-area:1_/_2] bg-white relative rounded-[20px] shrink-0" data-name="New-Sheet">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[15px] items-center justify-center pb-[25px] pt-[35px] px-[15px] relative size-full">
          <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Sheet-Icon">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
              <path d={svgPaths.p21295200} fill="var(--fill-0, #34C759)" id="Sheet-Icon" />
            </svg>
          </div>
          <p className="[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] text-[16px] text-center text-nowrap w-[min-content]">New Sheet</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function NewComm() {
  return (
    <div className="[grid-area:2_/_1] bg-white relative rounded-[20px] shrink-0" data-name="New-Comm">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[15px] items-center justify-center pb-[25px] pt-[35px] px-[15px] relative size-full">
          <div className="aspect-[69.9997/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Comm-Icon">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
              <g id="Comm-Icon">
                <path clipRule="evenodd" d={svgPaths.p3b07a100} fill="var(--fill-0, #FF453A)" fillRule="evenodd" />
                <path d={svgPaths.p32a7aa80} fill="var(--fill-0, #FF453A)" />
              </g>
            </svg>
          </div>
          <p className="[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] text-[16px] text-center text-nowrap w-[min-content]">New Comm</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function NewChat() {
  return (
    <div className="[grid-area:2_/_2] bg-white relative rounded-[20px] shrink-0" data-name="New-Chat">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col gap-[15px] items-center justify-center pb-[25px] pt-[35px] px-[15px] relative size-full">
          <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Chat-Icon">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
              <path d={svgPaths.p129b9600} fill="var(--fill-0, #BF5AF2)" id="Chat-Icon" />
            </svg>
          </div>
          <p className="[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] text-[16px] text-center text-nowrap w-[min-content]">New Chat</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

function CanvasTypeSelector() {
  return (
    <div className="gap-[20px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[353px] relative shrink-0 w-full" data-name="Canvas-Type-Selector">
      <NewDoc />
      <NewSheet />
      <NewComm />
      <NewChat />
    </div>
  );
}

function Canvas() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Canvas">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-center justify-center p-[20px] relative size-full">
          <Headline />
          <CanvasTypeSelector />
        </div>
      </div>
    </div>
  );
}

export default function MBlankUntitledTab() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full" data-name="M/Blank-Untitled-Tab">
      <Canvas />
    </div>
  );
}