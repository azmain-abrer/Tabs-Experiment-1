import svgPaths from "./svg-eqb2atdqkn";

function UserIcon() {
  return (
    <div className="bg-[#ff6778] content-stretch flex flex-col h-[30px] items-center justify-center overflow-clip relative rounded-[74.999px] shrink-0 w-[29.999px]" data-name="User-Icon">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[15px] text-center text-nowrap text-white whitespace-pre">M</p>
    </div>
  );
}

function User() {
  return (
    <div className="content-stretch flex gap-[10px] h-[38px] items-center justify-center relative shrink-0" data-name="User">
      <UserIcon />
    </div>
  );
}

function TopLine() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Top-Line">
      <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[12px] text-black text-nowrap whitespace-pre">Marco Boerries</p>
      <p className="font-['Inter:Light',_sans-serif] font-light leading-[normal] not-italic relative shrink-0 text-[12px] text-black text-nowrap whitespace-pre">9h ago</p>
      <div className="relative shrink-0 size-[5px]" data-name="Badge">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <circle cx="2.5" cy="2.5" fill="var(--fill-0, #007AFF)" id="Badge" r="2.5" />
        </svg>
      </div>
    </div>
  );
}

function Body() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[5px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Body">
      <TopLine />
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[15px] text-black w-full">Their current plan expires next week.</p>
    </div>
  );
}

function LeftSide() {
  return (
    <div className="basis-0 content-stretch flex gap-[10.001px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Left-Side">
      <User />
      <Body />
    </div>
  );
}

function RightSide() {
  return (
    <div className="h-[38px] relative shrink-0 w-[16px]" data-name="Right-Side">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 38">
        <g id="Right-Side">
          <path d={svgPaths.p2eed1800} fill="var(--fill-0, #007AFF)" id="Check-Icon" />
        </g>
      </svg>
    </div>
  );
}

function Comment() {
  return (
    <div className="content-stretch flex gap-[30px] items-start relative shrink-0 w-full" data-name="Comment">
      <LeftSide />
      <RightSide />
    </div>
  );
}

function UserIcon1() {
  return (
    <div className="bg-[#469fff] content-stretch flex flex-col h-[30px] items-center justify-center overflow-clip relative rounded-[74.999px] shrink-0 w-[29.999px]" data-name="User-Icon">
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[15px] text-center text-nowrap text-white whitespace-pre">A</p>
    </div>
  );
}

function User1() {
  return (
    <div className="content-stretch flex gap-[10px] h-[38px] items-center justify-center relative shrink-0" data-name="User">
      <UserIcon1 />
    </div>
  );
}

function TopLine1() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 text-[12px] text-nowrap w-full whitespace-pre" data-name="Top-Line">
      <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0">Azmain Abrer</p>
      <p className="font-['Inter:Light',_sans-serif] font-light relative shrink-0">now</p>
    </div>
  );
}

function Body1() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[5px] grow items-start leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-black" data-name="Body">
      <TopLine1 />
      <p className="font-['Inter:Regular',_sans-serif] font-normal relative shrink-0 text-[15px] w-full">I’ll take them out of the list.</p>
    </div>
  );
}

function LeftSide1() {
  return (
    <div className="basis-0 content-stretch flex gap-[10.001px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Left-Side">
      <User1 />
      <Body1 />
    </div>
  );
}

function RightSide1() {
  return (
    <div className="h-[38px] relative shrink-0 w-[16px]" data-name="Right-Side">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 38">
        <g id="Right-Side">
          <path d={svgPaths.p2eed1800} fill="var(--fill-0, #007AFF)" id="Check-Icon" />
        </g>
      </svg>
    </div>
  );
}

function Comment1() {
  return (
    <div className="content-stretch flex gap-[30px] items-start relative shrink-0 w-full" data-name="Comment">
      <LeftSide1 />
      <RightSide1 />
    </div>
  );
}

function ChatBox() {
  return (
    <div className="absolute bg-white bottom-[25px] left-[20px] right-[20px] rounded-[30px]" data-name="Chat-Box">
      <div className="box-border content-stretch flex gap-[30px] items-center overflow-clip p-[15px] relative rounded-[inherit] w-full">
        <p className="basis-0 font-['Outfit:Regular',_sans-serif] font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#5f6276] text-[15.709px]">Add Comment</p>
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
            <g id="vector">
              <path d={svgPaths.p129a7900} fill="var(--fill-0, #5F6276)" />
              <path d={svgPaths.p3f1e1300} fill="var(--fill-0, #5F6276)" />
            </g>
          </svg>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[30px]" />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute left-0 right-0 top-0" data-name="Header">
      <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center overflow-clip pb-[15px] pt-[10px] px-0 relative rounded-[inherit] w-full">
        <div className="bg-[rgba(0,0,0,0.4)] h-[2px] rounded-[100px] shrink-0 w-[40px]" data-name="Handle" />
        <p className="font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre">Comments</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none" />
    </div>
  );
}

export default function Comments() {
  return (
    <div className="bg-white relative rounded-tl-[40px] rounded-tr-[40px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)] size-full" data-name="Comments">
      <div className="flex flex-col items-center max-h-inherit min-h-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-center max-h-inherit min-h-inherit overflow-clip pb-[95px] pt-[77px] px-[20px] relative size-full">
          <Comment />
          <Comment1 />
          <ChatBox />
          <Header />
        </div>
      </div>
    </div>
  );
}