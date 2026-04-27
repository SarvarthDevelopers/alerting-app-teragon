import svgPaths from "./svg-ys8o77ii8g";

export default function AnomalyCard() {
  return (
    <div className="bg-white relative rounded-[12px] size-full" data-name="anomalyCard">
      <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip pb-[32px] pt-[16px] px-[16px] relative rounded-[inherit] size-full">
        <div className="content-stretch flex h-[56px] items-start justify-between relative shrink-0 w-full" data-name="Title">
          <div className="relative self-stretch shrink-0" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start not-italic relative size-full whitespace-nowrap">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#838383] text-[14px]">Surface Inspection</p>
              <p className="font-['Inter:Bold',sans-serif] font-bold leading-[32px] relative shrink-0 text-[#262626] text-[24px]">SN-98652</p>
            </div>
          </div>
          <div className="relative self-stretch shrink-0" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-end relative size-full">
              <div className="relative shrink-0" data-name="Container">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
                  <div className="bg-[#dedede] relative rounded-[4px] shrink-0" data-name="statusBadge">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[4px] relative size-full">
                      <p className="font-['Outfit:SemiBold',sans-serif] font-semibold leading-[16px] relative shrink-0 text-[#262626] text-[12px] whitespace-nowrap">ACK</p>
                    </div>
                  </div>
                  <div className="bg-[#ff3b30] relative rounded-[4px] shrink-0" data-name="severityBadge">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[4px] relative size-full">
                      <p className="font-['Outfit:SemiBold',sans-serif] font-semibold leading-[16px] relative shrink-0 text-[12px] text-white whitespace-nowrap">Critical</p>
                    </div>
                  </div>
                  <div className="relative shrink-0 size-[23.991px]" data-name="Icon">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9911 23.9911">
                      <g id="Icon">
                        <path d={svgPaths.p23e87f80} id="Vector" stroke="var(--stroke-0, #262626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99926" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0" data-name="Text">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[4px] relative size-full">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#838383] text-[14px] whitespace-nowrap">16 min ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="-translate-x-1/2 absolute bg-white bottom-0 h-[16px] left-[calc(50%-0.26px)] w-[380px]" data-name="anomalyHistogramCollapsed">
          <div className="content-stretch flex flex-col items-start overflow-clip px-[55px] relative rounded-[inherit] size-full">
            <div className="absolute bg-[#ff3b30] h-[16px] left-[92.18px] top-0 w-[12.513px]" />
          </div>
          <div aria-hidden="true" className="absolute border-[#dedede] border-solid border-t-[0.5px] inset-[-0.5px_0_0_0] pointer-events-none" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dedede] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}