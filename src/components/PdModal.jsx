import clsx from "clsx";
import React, { useState } from "react";
import pdMeasureSvg from "/pdMeasure.svg";

const PdModal = ({ openModal, pd, setOpenModal, setPd, setEyeDist, isAutomaticMeasurePd, setIsAutomaticMeasurePd, setIsInitialValue }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className={clsx(
        "absolute w-full md:w-1/2 mx-auto bottom-0 left-0 right-0 rounded-t-2xl bg-white",
        { hidden: !openModal }
      )}
    >
      <div className="relative">
        <button
          className="absolute h-10 w-10 left-4 top-0 bottom-0 my-auto cursor-pointer flex items-center justify-center rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all duration-300"
          onClick={() => setOpenModal(false)}
        >
          <svg
            width="15"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            fill="currentColor"
          >
            <path d="M312.1 375c9.369 9.369 9.369 24.57 0 33.94s-24.57 9.369-33.94 0L160 289.9l-119 119c-9.369 9.369-24.57 9.369-33.94 0s-9.369-24.57 0-33.94L126.1 256L7.027 136.1c-9.369-9.369-9.369-24.57 0-33.94s24.57-9.369 33.94 0L160 222.1l119-119c9.369-9.369 24.57-9.369 33.94 0s9.369 24.57 0 33.94L193.9 256L312.1 375z"></path>
          </svg>
        </button>
        <div className="flex justify-center items-center h-[70px] text-lg font-bold px-12">
          Set your pupillary distance
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center gap-3">
          <div>45</div>
          <div className="flex grow shrink-0">
            <input
              type="range"
              min={45}
              max={75}
              step={1}
              className="w-full"
              value={pd}
              onChange={(e) => {
                const value = Number(e.target.value || 0);
                setPd(value);
                setEyeDist(value);
                setIsAutomaticMeasurePd(false);
                setIsInitialValue(true);
              }}
            />
          </div>
          <div>75</div>
        </div>
        <div className="my-2">
          <button
            className={clsx(
              "rounded-full cursor-pointer w-full px-3 py-2 text-white transition-all duration-300",
              isAutomaticMeasurePd ? 'bg-red-600 hover:bg-red-700' : 'bg-sky-600 hover:bg-sky-700'
            )}
            onClick={() => setIsAutomaticMeasurePd(prev => !prev)}
          >
            {isAutomaticMeasurePd ? 'Stop' : 'Start'} automatic PD measurement
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden mt-3">
          <div
            className="cursor-pointer bg-gray-200 text-center font-bold px-12 py-3 relative"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            How to measure PD yourself?
            <div className="absolute flex items-center justify-center left-6 top-0 bottom-0">
              <svg
                data-v-6e021274=""
                fill="currentColor"
                width="15"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className={clsx("transition-all duration-300", {
                  "rotate-180": !collapsed,
                })}
              >
                <path d="M4.251 181.1C7.392 177.7 11.69 175.1 16 175.1c3.891 0 7.781 1.406 10.86 4.25l197.1 181.1l197.1-181.1c6.5-6 16.64-5.625 22.61 .9062c6 6.5 5.594 16.59-.8906 22.59l-208 192c-6.156 5.688-15.56 5.688-21.72 0l-208-192C-1.343 197.7-1.749 187.6 4.251 181.1z"></path>
              </svg>
            </div>
          </div>
          <div
            className={clsx(
              "text-left leading-4.5 transition-all duration-300",
              collapsed ? "max-h-0 p-0" : "px-3 py-2 max-h-96"
            )}
          >
            If you don't know the distance, stand 20 cm in front of the mirror
            and measure the distance between the center of your pupils in
            millimeters with a ruler.
            <img src={pdMeasureSvg} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdModal;
