// components/BrandLogoUpload.tsx
import { PiBuildingApartment } from "react-icons/pi";
import { RiLandscapeLine } from "react-icons/ri";
import React from "react";

const BrandLogoUpload: React.FC = () => {
  return (
    <div className="flex flex-row justify-start items-center gap-4">
      {/* Logo Placeholder */}
      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300">
        <PiBuildingApartment className="size-6" />
      </div>

      {/* Text Description */}
      <div className="">
        <div className="text-start ">
          <p className="text-sm text-gray-700 font-medium">Brand logo</p>
          <p className="text-xs text-gray-500">
            Select a 200 × 200 px image, up to 10 MB in size
          </p>
        </div>

        {/* Upload Button */}
        <label
          htmlFor="upload-logo"
          className="cursor-pointer  text-gray-700 border border-gray-300 rounded-full my-2 
          px-4 py-1 text-sm hover:bg-gray-100 transition items-center gap-2 inline-flex"
        >
          <RiLandscapeLine />
          Upload logo
        </label>
        <input
          id="upload-logo"
          type="file"
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default BrandLogoUpload;
