import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (url: string, file?: File) => void;
  currentUrl?: string;
  label?: string;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export function FileUpload({
  onFileSelect,
  currentUrl,
  label = "Upload Image",
  onUploadStart,
  onUploadComplete,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    console.log("📁 File selected:", file.name, file.type, file.size);
    setError(null);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = "Only JPEG, PNG, GIF, and WebP images are allowed";
      setError(errorMsg);
      console.error("❌", errorMsg);
      return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = "File is too large (max 10MB)";
      setError(errorMsg);
      console.error("❌", errorMsg);
      return;
    }

    // Show preview
    console.log("🖼️ Creating preview...");
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log("✅ Preview created, updating state");
      setPreview(result);
    };
    reader.onerror = (e) => {
      console.error("❌ FileReader error:", e);
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    console.log("📤 Starting upload...");
    onUploadStart?.();
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading file:", file.name, file.type, file.size);

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log("📨 Upload response status:", response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || `Upload failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Upload successful:", data.url);
      console.log("🔄 Calling onFileSelect with URL:", data.url);
      onFileSelect(data.url, file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again.";
      console.error("❌ Upload error:", errorMessage);
      setError(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
      console.log("✅ Upload complete");
      onUploadComplete?.();
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect("");
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>

      <div className="flex flex-col gap-3">
        {preview ? (
          <div className="relative w-full max-w-xs">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-input cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change image"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Click to replace with new image"
              >
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Drag and drop your image here, or click to select
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Select File"}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
