import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'LOOP PLAY · 월드컵 결과',description:'계정 없이 참여하는 인바이츠루프 V5 게임 월드컵 결과 모음'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>;}
