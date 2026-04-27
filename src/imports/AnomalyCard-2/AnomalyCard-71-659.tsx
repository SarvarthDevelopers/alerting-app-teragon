import svgPaths from "./svg-7z6p7n5bqm";

function Container() {
  return (
    <div className="relative self-stretch shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start not-italic relative size-full whitespace-nowrap">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#838383] text-[14px]">Surface Inspection</p>
        <p className="font-['Inter:Bold',sans-serif] font-bold leading-[32px] relative shrink-0 text-[#262626] text-[24px]">SN-98652</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[23.991px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9911 23.9911">
        <g id="Icon">
          <path d={svgPaths.p23e87f80} id="Vector" stroke="var(--stroke-0, #262626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99926" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <div className="bg-[#34c759] relative rounded-[9999px] shrink-0 size-[18px]" data-name="statusBadge">
          <div className="flex flex-row items-center size-full">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid size-full" />
          </div>
        </div>
        <Icon />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[4px] relative size-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#838383] text-[14px] whitespace-nowrap">16 min ago</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative self-stretch shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-end relative size-full">
        <Container2 />
        <Text />
      </div>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex h-[56px] items-start justify-between relative shrink-0 w-full" data-name="Title">
      <Container />
      <Container1 />
    </div>
  );
}

export default function AnomalyCard() {
  return (
    <div className="bg-white relative rounded-[12px] size-full" data-name="anomalyCard">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <Title />
      </div>
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}