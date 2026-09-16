"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Download, ExternalLink } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
  title?: string;
  proofId?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  title = "Verification QR Code",
  proofId,
  size = 180,
}) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `BotProof-Verify-${proofId || "QR"}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-black/40 border border-white/10 text-center">
      <div
        ref={containerRef}
        className="p-3 bg-white rounded-xl shadow-lg mb-4 flex items-center justify-center inline-block"
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#0a0d14"
        />
      </div>

      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-zinc-400 mb-4 max-w-xs break-all line-clamp-2">
        {url}
      </p>

      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          onClick={handleCopyLink}
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 hover:text-white border border-white/10 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-botchain-400" />
              <span className="text-botchain-400">Copied Link</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownloadQR}
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-botchain-500/10 hover:bg-botchain-500/20 text-xs font-medium text-botchain-300 border border-botchain-500/20 transition-colors"
        >
          <Download size={14} />
          <span>Save QR</span>
        </button>
      </div>
    </div>
  );
};
