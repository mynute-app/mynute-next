import { PiBuildingApartment } from "react-icons/pi";
import { RiLandscapeLine, RiDeleteBin6Line } from "react-icons/ri";
import React from "react";

type BrandLogoUploadProps = {
  logo: string | null;
  onUploadLogo: (dataUrl: string) => void;
  onRemoveLogo: () => void;
};

const BrandLogoUpload: React.FC<BrandLogoUploadProps> = ({
  logo,
  onUploadLogo,
  onRemoveLogo,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) onUploadLogo(reader.result.toString());
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-row justify-start items-center gap-4">
      {/* Preview ou ícone padrão */}
      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300 overflow-hidden">
        {logo ? (
          <img
            src={logo}
            alt="Logo preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <PiBuildingApartment className="size-6 text-gray-600" />
        )}
      </div>

      {/* Texto e botões */}
      <div>
        <div className="text-start">
          <p className="text-sm text-gray-700 font-medium">Brand logo</p>
          <p className="text-xs text-gray-500">
            Select a 200 × 200 px image, up to 10 MB in size
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <label
            htmlFor="upload-logo"
            className="cursor-pointer text-gray-700 border border-gray-300 rounded-full px-4 py-1 text-sm hover:bg-gray-100 transition items-center gap-2 inline-flex"
          >
            <RiLandscapeLine />
            Upload logo
          </label>

          {logo && (
            <button
              type="button"
              onClick={onRemoveLogo}
              className="text-red-600 border border-red-300 rounded-full px-4 py-1 text-sm hover:bg-red-50 transition items-center gap-2 inline-flex"
            >
              <RiDeleteBin6Line />
              Remover logo
            </button>
          )}
        </div>

        <input
          id="upload-logo"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default BrandLogoUpload;
