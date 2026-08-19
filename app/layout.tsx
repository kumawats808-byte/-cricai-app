import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CricAI — Live Cricket Intelligence",
  description: "Live scores, ball-by-ball, odds, fancy and AI cricket analysis."
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
