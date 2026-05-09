"use client";

import { Camera } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

interface Props {
  name: string;
  image: string | null;
  onUpload: (url: string) => void;
}

export default function AvatarUpload({ name, image, onUpload }: Props) {
  return (
    <div className="relative w-fit">
      {image ? (
        <img
          src={image}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400 border-2 border-zinc-200 dark:border-zinc-700">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          maxFiles: 1,
          resourceType: "image",
          cropping: true,
          croppingAspectRatio: 1,
          croppingShowDimensions: true,
          maxFileSize: 5000000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        }}
        onSuccess={(result: any) => {
          if (result?.info?.secure_url) {
            onUpload(result.info.secure_url);
          }
        }}
      >
        {({ open }) => (
          <button
            onClick={() => open()}
            type="button"
            className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
          </button>
        )}
      </CldUploadWidget>
    </div>
  );
}
