import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Trash2, Sparkles, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop";
import { cn } from "@/lib/utils";
import { axiosGet, axiosPost } from "@/constants/api-context";
import { GenerateImage } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { ShimmerButton } from "../ui/shimmer-button";
import { MagicalLoader } from "./MagicalLoader";
import { set } from "react-hook-form";

export function FileUpload({
  onImageCropped,
  formData,
  enableAIGeneration = false,
}) {
  const [image, setImage] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cropped, SetCropped] = useState(null);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        setImage(reader.result);
        setIsDialogOpen(true);
      };
    }
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async () => {
    try {
      const img = await createImage(image);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg();
      // Create URL for preview
      const croppedPreviewUrl = URL.createObjectURL(croppedImage);
      setCroppedPreview(croppedPreviewUrl);
      onImageCropped(croppedImage);
      setIsDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async () => {
    setIsDialogOpen(false);
    setImage(null);
    setCroppedPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setCroppedPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onImageCropped(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setImage(reader.result);
          setIsDialogOpen(true);
        };
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!formData?.productName || !formData?.categoryName) {
      showNotification.error("Please fill in product name and category first");
      return;
    }

    try {
      setIsGenerating(true);
      const data = {
        product: formData.productName,
        category: formData.categoryName,
      };

      const response = await axiosPost(GenerateImage, data, {
        responseType: "blob", // Ensure response is returned as Blob
      });

      if (!response.status === 200) {
        throw new Error("Failed to generate image");
      }

      const reader = new FileReader();

      reader.onload = () => {
        setImage(reader.result);
        setIsDialogOpen(true);
      };

      reader.readAsDataURL(response.data);
      showNotification.success("AI image generated successfully!");
    } catch (error) {
      showNotification.error(error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4">
        {/* Upload Area */}
        <Label
          htmlFor="image-upload"
          className={cn(
            "flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4",
            "transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-muted-foreground/25 hover:bg-muted/25"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isGenerating ? (
            <MagicalLoader />
          ) : croppedPreview || image ? (
            // Show cropped preview when available, fallback to original image
            <div className="flex flex-col items-center gap-2">
              <img
                src={croppedPreview || image}
                alt="Preview"
                className="max-h-[120px] object-contain rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Click to change image
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus
                className={cn(
                  "h-10 w-10 transition-colors duration-200",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              />
              <p
                className={cn(
                  "text-sm transition-colors duration-200",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isDragging
                  ? "Drop image here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                SVG, PNG, JPG or GIF (max. 5MB)
              </p>
            </div>
          )}
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={inputRef}
          />
        </Label>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {image && (
            <Button variant="destructive" size="sm" onClick={handleRemoveImage}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Image
            </Button>
          )}

          {enableAIGeneration && (
            <ShimmerButton
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className={cn("px-4 py-2", isGenerating && "opacity-80")}
              shimmerColor="pink"
            >
              <div className="relative flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>
                      {image ? "Generate Another Image" : "Generate Image"}
                    </span>
                  </>
                )}
              </div>
            </ShimmerButton>
          )}
        </div>
      </div>

      {/* Cropper Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="relative h-[450px] w-full">
            {image && (
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
