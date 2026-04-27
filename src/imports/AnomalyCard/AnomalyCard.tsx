export default function AnomalyCard() {
  return (
    <div className="bg-white relative rounded-[12px] size-full" data-name="anomalyCard">
      <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[inherit] size-full">
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
                  <div className="bg-[#ff3b30] relative rounded-[4px] shrink-0" data-name="severityBadge">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[4px] relative size-full">
                      <p className="font-['Outfit:SemiBold',sans-serif] font-semibold leading-[16px] relative shrink-0 text-[12px] text-white whitespace-nowrap">Critical</p>
                    </div>
                  </div>
                  <div className="relative shrink-0 size-[24px]" data-name="Icon">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="Icon">
                        <path d="M18 15L12 9L6 15" id="Vector" stroke="var(--stroke-0, #262626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99926" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0" data-name="Text">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[4px] relative size-full">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#838383] text-[14px] whitespace-nowrap">Today at 9:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[8px] items-start pt-[17px] relative shrink-0 w-full" data-name="Description">
          <div aria-hidden="true" className="absolute border-[#f5f5f5] border-solid border-t inset-0 pointer-events-none" />
          <div className="relative shrink-0 w-full" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Inter:Semi_Bold',sans-serif] font-semibold items-center justify-between leading-[20px] not-italic relative size-full text-[#838383] text-[14px] whitespace-nowrap">
              <p className="relative shrink-0">Hot Rolled Coil</p>
              <p className="decoration-dotted relative shrink-0 underline">12.4 m</p>
            </div>
          </div>
          <div className="relative shrink-0 w-[348px]" data-name="anomalyHistogram">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[4px] relative size-full">
              <div className="bg-[#f5f5f5] content-stretch flex gap-[64px] h-[48px] items-center overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="histogram">
                <div className="content-stretch flex h-full items-end justify-between relative shrink-0 w-[348px]" data-name="Ruler">
                  <div className="flex h-[24px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[24px]" data-name="quartile 1">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                          <g id="quartile 1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 1">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 2">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 3">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 4">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[24px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[24px]" data-name="quartile 2">
                        <div className="absolute inset-[-0.5px_-2.08%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 1">
                            <path d="M0.5 0.5H24.5" id="quartile 2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 5">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 6">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 7">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 8">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[24px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[24px]" data-name="quartile 3">
                        <div className="absolute inset-[-0.5px_-2.08%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 1">
                            <path d="M0.5 0.5H24.5" id="quartile 2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 9">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 10">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 11">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 12">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[24px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[24px]" data-name="quartile 4">
                        <div className="absolute inset-[-0.5px_-2.08%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 1">
                            <path d="M0.5 0.5H24.5" id="quartile 2" stroke="var(--stroke-0, #A8A8A8)" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 13">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 14">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 15">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[10px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[10px]" data-name="rule 16">
                        <div className="absolute inset-[-0.5px_0_0_0]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 0.5">
                            <line id="rule 1" stroke="var(--stroke-0, #A8A8A8)" strokeWidth="0.5" x2="10" y1="0.25" y2="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-[24px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "285", "--transform-inner-height": "19" } as React.CSSProperties}>
                    <div className="-rotate-90 flex-none">
                      <div className="h-0 relative w-[24px]" data-name="quartile 5">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                          <g id="quartile 1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bg-[#ff3b30] h-[48px] left-[62.47px] mix-blend-darken top-0 w-[14.256px]" />
                <div className="absolute bg-[#eebf04] h-[48px] left-[267.06px] mix-blend-darken top-0 w-[6.453px]" />
              </div>
              <div className="content-stretch flex flex-col font-['Outfit:SemiBold',sans-serif] font-semibold gap-[8px] items-start leading-[0] not-italic relative shrink-0 text-[#262626] text-[0px] w-full whitespace-nowrap" data-name="anomalyInfo">
                <p className="relative shrink-0">
                  <span className="font-['Inter:Semi_Bold',sans-serif] leading-[20px] text-[14px]">Visual Defect:</span>
                  <span className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] text-[14px]">{` `}</span>
                  <span className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] text-[#838383] text-[14px]">2,400-2,850 mm</span>
                </p>
                <p className="relative shrink-0">
                  <span className="font-['Inter:Semi_Bold',sans-serif] leading-[20px] text-[14px]">Surface Roughness:</span>
                  <span className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] text-[14px]">{` `}</span>
                  <span className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] text-[#838383] text-[14px]">8,100-8,420 mm</span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#dedede] relative rounded-[12px] shrink-0 w-full" data-name="buttonMobile">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[16px] relative size-full">
                <p className="font-['Inter:Bold',sans-serif] font-bold leading-[28px] not-italic relative shrink-0 text-[#262626] text-[18px] text-center whitespace-nowrap">ACKNOWLEDGE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#ff3b30] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}