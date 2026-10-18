import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Handbookly — your handbook, answerable any hour"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4EFE4",
          color: "#1C2B24",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#1F6B4A", color: "#F7F3EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
            H
          </div>
          <div style={{ fontSize: 36 }}>Handbookly</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05 }}>Your handbook, answerable any hour.</div>
          <div style={{ fontSize: 28, color: "#3D5C4A" }}>Liam cites the section. HR sees the questions the handbook never covered.</div>
        </div>
      </div>
    ),
    size,
  )
}
