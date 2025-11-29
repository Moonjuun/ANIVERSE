import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "AniVerse";
    const rating = searchParams.get("rating");
    const posterUrl = searchParams.get("poster");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b",
            backgroundImage: posterUrl
              ? `url(${posterUrl})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(9, 9, 11, 0.8)",
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              zIndex: 1,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: 64,
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: rating ? "20px" : "0",
                maxWidth: "1000px",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            {rating && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: 32,
                  color: "#fbbf24",
                }}
              >
                ⭐ {rating}/10
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error("OG Image generation error:", error);
    return new Response(`Failed to generate image: ${error.message}`, {
      status: 500,
    });
  }
}




