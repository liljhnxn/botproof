import React, { useState, useRef } from "react";
import { UploadCloud, File, AlertCircle, RefreshCw } from "lucide-react";
import { hashFile, HashedDocument } from "@/lib/hashing";
import { formatFileSize } from "@/lib/format";
import { HashDisplay } from "./HashDisplay";

interface DocumentUploaderProps {
  onHashGenerated: (doc: HashedDocument | null) => void;
  isLoading?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onHashGenerated,
  isLoading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [hashedDoc, setHashedDoc] = useState<HashedDocument | null>(null);
  const [hashing, setHashing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setHashing(true);
    try {
      const result = await hashFile(file);
      setHashedDoc(result);
      onHashGenerated(result);
    } catch (err: any) {
      console.error("Hashing failed:", err);
      setError(err?.message || "Failed to hash document locally.");
      onHashGenerated(null);
    } finally {
      setHashing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setHashedDoc(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onHashGenerated(null);
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !hashedDoc && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-botchain-400 bg-botchain-500/10"
            : hashedDoc
            ? "border-botchain-500/40 bg-botchain-950/20 cursor-default"
            : "border-white/10 hover:border-botchain-500/40 bg-white/[0.02] hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          disabled={isLoading || hashing}
        />

        {hashing ? (
          <div className="flex flex-col items-center justify-center py-4">
            <RefreshCw size={36} className="text-botchain-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-white">Generating SHA-256 fingerprint...</p>
            <p className="text-xs text-zinc-400 mt-1">Processing locally inside your browser</p>
          </div>
        ) : hashedDoc ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl bg-botchain-500/10 text-botchain-400 border border-botchain-500/20">
                <File size={28} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white max-w-xs truncate">{hashedDoc.name}</p>
                <p className="text-xs text-zinc-400">{formatFileSize(hashedDoc.size)}</p>
              </div>
            </div>

            <HashDisplay hash={hashedDoc.hash} label="Document SHA-256 Fingerprint" />

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
              >
                Choose a different document
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="p-4 rounded-2xl bg-white/5 text-botchain-400 mb-4 border border-white/10">
              <UploadCloud size={32} />
            </div>
            <p className="text-sm font-medium text-white mb-1">
              Click to choose a file or drag & drop
            </p>
            <p className="text-xs text-zinc-400 max-w-sm">
              PDF, image, certificate, or document file. Your document stays on your device.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
        <span className="font-semibold text-botchain-400 shrink-0">Privacy Note:</span>
        <p className="text-zinc-400">
          Your document is <strong className="text-zinc-200">never uploaded</strong> or stored on-chain. BotProof calculates and stores only its mathematical SHA-256 fingerprint.
        </p>
      </div>
    </div>
  );
};
