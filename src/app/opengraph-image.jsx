import { ImageResponse } from "next/og";

export const alt = "Nova-X — Network & Security Diagnostics";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div>
        Nova-X Network & Security Diagnostics
      </div>
    ),
    {
      ...size,
    }
  );
}