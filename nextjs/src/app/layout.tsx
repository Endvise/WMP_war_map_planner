import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전쟁맵 전략 - 둠스데이 라스트서바이버",
  description: "둠스데이 라스트서바이버 전쟁 이벤트 전략 협업 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
