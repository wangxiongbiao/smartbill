import type { Metadata } from 'next';
import App from '../App';

// 页面级别的 metadata，会与 layout 的 metadata 合并
export const metadata: Metadata = { 
  alternates: {
    canonical: '/', // 明确指定首页的 canonical URL
  },
};

export default function Home() {
  return <App />;
}
