function Tab() {
  return (
    <div className="bg-[#f5f5f5] flex-[1_0_0] min-w-px relative rounded-[12px]" data-name="tab">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#838383] text-[16px] text-center whitespace-nowrap">Surface</p>
        </div>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="bg-[#262626] flex-[1_0_0] min-w-px relative rounded-[12px]" data-name="tab">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Profile</p>
        </div>
      </div>
    </div>
  );
}

function Tab2() {
  return (
    <div className="bg-[#f5f5f5] flex-[1_0_0] min-w-px relative rounded-[12px]" data-name="tab">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#838383] text-[16px] text-center whitespace-nowrap">Flatness</p>
        </div>
      </div>
    </div>
  );
}

export default function SystemTabs() {
  return (
    <div className="bg-white content-stretch flex gap-[10px] items-start overflow-clip p-[8px] relative rounded-[12px] size-full" data-name="SystemTabs">
      <Tab />
      <Tab1 />
      <Tab2 />
    </div>
  );
}