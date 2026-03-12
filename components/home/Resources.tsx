import React from 'react';
import type { Language } from '@/types';

type Article = { tag: string; title: string; desc: string; image: string };
type ProductCard = { label: string; image?: string };
type ResourceCopy = { title: string; allArticles: string; moreProducts: string; articles: Article[]; products: ProductCard[] };

export function Resources({ lang }: { lang: Language }) {
  const englishCopy: ResourceCopy = {
      title: 'More resources',
      allArticles: 'See all articles',
      moreProducts: 'Discover more products',
      articles: [
        { tag: 'Guide', title: 'How to write an invoice', desc: 'Learn the essential elements every professional invoice needs.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2D0YPYhtjV0YF_-UA6HcPf3krXByXj02TuMzoDpLIWyum475bRvG0fOWFVlSFSUnlmrxiUk8yHXYeEcg5H4cZWZYB28YS3wjjeyrV0vcFvM__ZkUF4K3LkW3EEec3PBTvmN0S5MMNodAIj9KrDAhCYpyYJ-LI_j0roXJqZ73NILyNxwvL5qzivGLktGfRZjNA6TuvRmN23R1SEx5MqwD6dbO3BJ8qTqS4kFxaaJmUXgBd63czhS1Mcqvng3zEf5EIo8khZo7CXk' },
        { tag: 'Tips', title: '5 tips for getting paid on time', desc: 'Actionable advice to improve your cash flow and reduce late payments.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqm9xrxDtZVRpdV2JbRlAgKE5LbJb40R021IJz1_1lt76yPtipJUyZ5zF16mCC3H4EPUqmKDG3CUoNWwXMUzFxHipUW9RuqQdQQsi0BOjHdfgJRlT7T1SEi2PgXS4YLqwanXpJI9D39DesctK-_5X362Ly15d52UlXC4yJqhEhFcSWkeyU1TXEg3gSnkmD0tsMVppmNnmZJnS2KFtHI_qhr8_MRXGW2MCj_6iwkQfcYXsOmpHSIzDnm-9-K4WNyxhF8AzQ8MF5ihc' },
        { tag: 'Freelancing', title: 'Invoicing for freelancers 101', desc: 'Everything you need to know about billing clients as a freelancer.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTYw3EyaYjLlhWIT8658mFKYzQWSLcQwt40cTPokZckSacqrhMOIA_ojdW4k3Aj-bXPq8pEP6nyJkhSAktpHtZIaH4jNMGes57YMF_RKL7AStiHvhbt93B82pgrVuKJY6Z5NyGmqMvwY9bChJtsbuOp-F37HVEcA6X4ErCZiw-KK7d1V6zbeGzR1Mhph-71qoCVENXKx1F__HpOcHlpGfZm9dAe6SdqHfMxekC5YFd22AYupQVu50GQt-ongq1CIQHKUybEBSjqk' },
      ],
      products: [
        { label: 'Newsletters', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-II_B3rCmCPZb4qe_CTxIn7aE2bvst7sU9qAKXUo9wZw2iKOASMj_z5T0MbbahE5A7EA-MASRVG-N-Hq2ImWvD9hORffFdfi8kB3Oz1GOStlwuemFDhKlpDMa7CF0ezTpP6CnnigKpkh7nyW_pTkY8sWWkyImRPWmemTBmQaqARnIxV7stpOKftIdw3aeF2gfwKzZCdaCwGV_7v2CweXYu0HALJehMIrMY1NIZOLNQNloC6zx-giy236HUfswOCWimezRASJyMVY' },
        { label: 'Business Cards', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2GY-dB6Z8WLbwQY-Y_-wfdEs-3m-a8GsaIyT1DcGrZ9Wifzu_VRfftk9PH6X0c4JjrKs5s1Qsjm3h28FEe43hawp-lvtdjYZHOo_8R7rgjbepmt2OfTgKPsnWd_MC311UMWYv0jx6kYsvs21ttru8aM6ItDi2rqGH7m2zNyQG2bygd1OcWRqDIkw65h8tXyCde7-NXuXl2amZW1NUck94YpfCk-x4BeCbHp82vl_zkjn8KO_507MBNnJdO4b3ykrVVnOJ4KvOkxU' },
        { label: 'Presentations', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5t9YVhRwtOv8zRKILkDrPhRNLTIaiW2r0wOtA2KDIkp0bbyWPOl-3AC3ji4507hbDX261n-GcCwAGUjt_kYXb8-lrufHuaM4BvE0OxxSjryAmWpvUtKx5fp5aBjACN3Y2Fn0qF2F_dWgBkwpyx86VltCgsdVczHOygKxuJhlFwXLacqnKxoBF9vzUA7jc8Ux8g85WCbu6or2SO56Kj8vy3ALjtHy9BvgGhFaqVeLc5PUiWjCCz9wYBX2MD9-_kdLqzshf53o6yE' },
        { label: 'Flyers' }, { label: 'Logos' }, { label: 'Resumes' },
      ],
    };
  const traditionalChineseCopy: ResourceCopy = {
      title: '更多資源',
      allArticles: '查看全部文章',
      moreProducts: '探索更多產品',
      articles: [
        { tag: '指南', title: '如何撰寫一張專業發票', desc: '快速掌握每一張專業發票都該具備的核心欄位。', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2D0YPYhtjV0YF_-UA6HcPf3krXByXj02TuMzoDpLIWyum475bRvG0fOWFVlSFSUnlmrxiUk8yHXYeEcg5H4cZWZYB28YS3wjjeyrV0vcFvM__ZkUF4K3LkW3EEec3PBTvmN0S5MMNodAIj9KrDAhCYpyYJ-LI_j0roXJqZ73NILyNxwvL5qzivGLktGfRZjNA6TuvRmN23R1SEx5MqwD6dbO3BJ8qTqS4kFxaaJmUXgBd63czhS1Mcqvng3zEf5EIo8khZo7CXk' },
        { tag: '技巧', title: '5 個準時收款的小技巧', desc: '用幾個可執行的動作改善現金流，減少拖延付款。', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqm9xrxDtZVRpdV2JbRlAgKE5LbJb40R021IJz1_1lt76yPtipJUyZ5zF16mCC3H4EPUqmKDG3CUoNWwXMUzFxHipUW9RuqQdQQsi0BOjHdfgJRlT7T1SEi2PgXS4YLqwanXpJI9D39DesctK-_5X362Ly15d52UlXC4yJqhEhFcSWkeyU1TXEg3gSnkmD0tsMVppmNnmZJnS2KFtHI_qhr8_MRXGW2MCj_6iwkQfcYXsOmpHSIzDnm-9-K4WNyxhF8AzQ8MF5ihc' },
        { tag: '接案', title: '自由工作者開票入門', desc: '從服務描述到收款條款，一次搞懂接案開票的基本功。', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTYw3EyaYjLlhWIT8658mFKYzQWSLcQwt40cTPokZckSacqrhMOIA_ojdW4k3Aj-bXPq8pEP6nyJkhSAktpHtZIaH4jNMGes57YMF_RKL7AStiHvhbt93B82pgrVuKJY6Z5NyGmqMvwY9bChJtsbuOp-F37HVEcA6X4ErCZiw-KK7d1V6zbeGzR1Mhph-71qoCVENXKx1F__HpOcHlpGfZm9dAe6SdqHfMxekC5YFd22AYupQVu50GQt-ongq1CIQHKUybEBSjqk' },
      ],
      products: [
        { label: '電子報', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-II_B3rCmCPZb4qe_CTxIn7aE2bvst7sU9qAKXUo9wZw2iKOASMj_z5T0MbbahE5A7EA-MASRVG-N-Hq2ImWvD9hORffFdfi8kB3Oz1GOStlwuemFDhKlpDMa7CF0ezTpP6CnnigKpkh7nyW_pTkY8sWWkyImRPWmemTBmQaqARnIxV7stpOKftIdw3aeF2gfwKzZCdaCwGV_7v2CweXYu0HALJehMIrMY1NIZOLNQNloC6zx-giy236HUfswOCWimezRASJyMVY' },
        { label: '名片', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2GY-dB6Z8WLbwQY-Y_-wfdEs-3m-a8GsaIyT1DcGrZ9Wifzu_VRfftk9PH6X0c4JjrKs5s1Qsjm3h28FEe43hawp-lvtdjYZHOo_8R7rgjbepmt2OfTgKPsnWd_MC311UMWYv0jx6kYsvs21ttru8aM6ItDi2rqGH7m2zNyQG2bygd1OcWRqDIkw65h8tXyCde7-NXuXl2amZW1NUck94YpfCk-x4BeCbHp82vl_zkjn8KO_507MBNnJdO4b3ykrVVnOJ4KvOkxU' },
        { label: '簡報', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5t9YVhRwtOv8zRKILkDrPhRNLTIaiW2r0wOtA2KDIkp0bbyWPOl-3AC3ji4507hbDX261n-GcCwAGUjt_kYXb8-lrufHuaM4BvE0OxxSjryAmWpvUtKx5fp5aBjACN3Y2Fn0qF2F_dWgBkwpyx86VltCgsdVczHOygKxuJhlFwXLacqnKxoBF9vzUA7jc8Ux8g85WCbu6or2SO56Kj8vy3ALjtHy9BvgGhFaqVeLc5PUiWjCCz9wYBX2MD9-_kdLqzshf53o6yE' },
        { label: '傳單' }, { label: 'Logo' }, { label: '履歷' },
      ],
    };
  const simplifiedChineseCopy: ResourceCopy = {
      title: '更多资源',
      allArticles: '查看全部文章',
      moreProducts: '探索更多产品',
      articles: [
        { tag: '指南', title: '如何写一张专业发票', desc: '快速掌握一张专业发票必须包含的核心信息。', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2D0YPYhtjV0YF_-UA6HcPf3krXByXj02TuMzoDpLIWyum475bRvG0fOWFVlSFSUnlmrxiUk8yHXYeEcg5H4cZWZYB28YS3wjjeyrV0vcFvM__ZkUF4K3LkW3EEec3PBTvmN0S5MMNodAIj9KrDAhCYpyYJ-LI_j0roXJqZ73NILyNxwvL5qzivGLktGfRZjNA6TuvRmN23R1SEx5MqwD6dbO3BJ8qTqS4kFxaaJmUXgBd63czhS1Mcqvng3zEf5EIo8khZo7CXk' },
        { tag: '技巧', title: '5 个提高准时回款率的小技巧', desc: '用几个可执行的方法改善现金流，减少拖延付款。', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqm9xrxDtZVRpdV2JbRlAgKE5LbJb40R021IJz1_1lt76yPtipJUyZ5zF16mCC3H4EPUqmKDG3CUoNWwXMUzFxHipUW9RuqQdQQsi0BOjHdfgJRlT7T1SEi2PgXS4YLqwanXpJI9D39DesctK-_5X362Ly15d52UlXC4yJqhEhFcSWkeyU1TXEg3gSnkmD0tsMVppmNnmZJnS2KFtHI_qhr8_MRXGW2MCj_6iwkQfcYXsOmpHSIzDnm-9-K4WNyxhF8AzQ8MF5ihc' },
        { tag: '接案', title: '自由职业者开票入门', desc: '从服务描述到收款条款，快速建立你的开票基本功。', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTYw3EyaYjLlhWIT8658mFKYzQWSLcQwt40cTPokZckSacqrhMOIA_ojdW4k3Aj-bXPq8pEP6nyJkhSAktpHtZIaH4jNMGes57YMF_RKL7AStiHvhbt93B82pgrVuKJY6Z5NyGmqMvwY9bChJtsbuOp-F37HVEcA6X4ErCZiw-KK7d1V6zbeGzR1Mhph-71qoCVENXKx1F__HpOcHlpGfZm9dAe6SdqHfMxekC5YFd22AYupQVu50GQt-ongq1CIQHKUybEBSjqk' },
      ],
      products: [
        { label: '电子报', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-II_B3rCmCPZb4qe_CTxIn7aE2bvst7sU9qAKXUo9wZw2iKOASMj_z5T0MbbahE5A7EA-MASRVG-N-Hq2ImWvD9hORffFdfi8kB3Oz1GOStlwuemFDhKlpDMa7CF0ezTpP6CnnigKpkh7nyW_pTkY8sWWkyImRPWmemTBmQaqARnIxV7stpOKftIdw3aeF2gfwKzZCdaCwGV_7v2CweXYu0HALJehMIrMY1NIZOLNQNloC6zx-giy236HUfswOCWimezRASJyMVY' },
        { label: '名片', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2GY-dB6Z8WLbwQY-Y_-wfdEs-3m-a8GsaIyT1DcGrZ9Wifzu_VRfftk9PH6X0c4JjrKs5s1Qsjm3h28FEe43hawp-lvtdjYZHOo_8R7rgjbepmt2OfTgKPsnWd_MC311UMWYv0jx6kYsvs21ttru8aM6ItDi2rqGH7m2zNyQG2bygd1OcWRqDIkw65h8tXyCde7-NXuXl2amZW1NUck94YpfCk-x4BeCbHp82vl_zkjn8KO_507MBNnJdO4b3ykrVVnOJ4KvOkxU' },
        { label: '演示文稿', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5t9YVhRwtOv8zRKILkDrPhRNLTIaiW2r0wOtA2KDIkp0bbyWPOl-3AC3ji4507hbDX261n-GcCwAGUjt_kYXb8-lrufHuaM4BvE0OxxSjryAmWpvUtKx5fp5aBjACN3Y2Fn0qF2F_dWgBkwpyx86VltCgsdVczHOygKxuJhlFwXLacqnKxoBF9vzUA7jc8Ux8g85WCbu6or2SO56Kj8vy3ALjtHy9BvgGhFaqVeLc5PUiWjCCz9wYBX2MD9-_kdLqzshf53o6yE' },
        { label: '传单' }, { label: 'Logo' }, { label: '简历' },
      ],
    };
  const thaiCopy: ResourceCopy = {
      title: 'แหล่งข้อมูลเพิ่มเติม',
      allArticles: 'ดูบทความทั้งหมด',
      moreProducts: 'ค้นหาผลิตภัณฑ์เพิ่มเติม',
      articles: [
        { tag: 'คู่มือ', title: 'วิธีเขียนใบแจ้งหนี้อย่างมืออาชีพ', desc: 'เรียนรู้องค์ประกอบสำคัญที่ใบแจ้งหนี้ระดับมืออาชีพควรมี', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2D0YPYhtjV0YF_-UA6HcPf3krXByXj02TuMzoDpLIWyum475bRvG0fOWFVlSFSUnlmrxiUk8yHXYeEcg5H4cZWZYB28YS3wjjeyrV0vcFvM__ZkUF4K3LkW3EEec3PBTvmN0S5MMNodAIj9KrDAhCYpyYJ-LI_j0roXJqZ73NILyNxwvL5qzivGLktGfRZjNA6TuvRmN23R1SEx5MqwD6dbO3BJ8qTqS4kFxaaJmUXgBd63czhS1Mcqvng3zEf5EIo8khZo7CXk' },
        { tag: 'เคล็ดลับ', title: '5 วิธีช่วยให้ได้รับชำระเงินตรงเวลา', desc: 'ใช้แนวทางที่ทำได้จริงเพื่อปรับปรุงกระแสเงินสดและลดการจ่ายล่าช้า', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqm9xrxDtZVRpdV2JbRlAgKE5LbJb40R021IJz1_1lt76yPtipJUyZ5zF16mCC3H4EPUqmKDG3CUoNWwXMUzFxHipUW9RuqQdQQsi0BOjHdfgJRlT7T1SEi2PgXS4YLqwanXpJI9D39DesctK-_5X362Ly15d52UlXC4yJqhEhFcSWkeyU1TXEg3gSnkmD0tsMVppmNnmZJnS2KFtHI_qhr8_MRXGW2MCj_6iwkQfcYXsOmpHSIzDnm-9-K4WNyxhF8AzQ8MF5ihc' },
        { tag: 'ฟรีแลนซ์', title: 'พื้นฐานการออกใบแจ้งหนี้สำหรับฟรีแลนซ์', desc: 'ทำความเข้าใจเรื่องคำอธิบายบริการ เงื่อนไขการชำระเงิน และโครงสร้างใบแจ้งหนี้แบบง่าย ๆ', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTYw3EyaYjLlhWIT8658mFKYzQWSLcQwt40cTPokZckSacqrhMOIA_ojdW4k3Aj-bXPq8pEP6nyJkhSAktpHtZIaH4jNMGes57YMF_RKL7AStiHvhbt93B82pgrVuKJY6Z5NyGmqMvwY9bChJtsbuOp-F37HVEcA6X4ErCZiw-KK7d1V6zbeGzR1Mhph-71qoCVENXKx1F__HpOcHlpGfZm9dAe6SdqHfMxekC5YFd22AYupQVu50GQt-ongq1CIQHKUybEBSjqk' },
      ],
      products: [
        { label: 'จดหมายข่าว', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-II_B3rCmCPZb4qe_CTxIn7aE2bvst7sU9qAKXUo9wZw2iKOASMj_z5T0MbbahE5A7EA-MASRVG-N-Hq2ImWvD9hORffFdfi8kB3Oz1GOStlwuemFDhKlpDMa7CF0ezTpP6CnnigKpkh7nyW_pTkY8sWWkyImRPWmemTBmQaqARnIxV7stpOKftIdw3aeF2gfwKzZCdaCwGV_7v2CweXYu0HALJehMIrMY1NIZOLNQNloC6zx-giy236HUfswOCWimezRASJyMVY' },
        { label: 'นามบัตร', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2GY-dB6Z8WLbwQY-Y_-wfdEs-3m-a8GsaIyT1DcGrZ9Wifzu_VRfftk9PH6X0c4JjrKs5s1Qsjm3h28FEe43hawp-lvtdjYZHOo_8R7rgjbepmt2OfTgKPsnWd_MC311UMWYv0jx6kYsvs21ttru8aM6ItDi2rqGH7m2zNyQG2bygd1OcWRqDIkw65h8tXyCde7-NXuXl2amZW1NUck94YpfCk-x4BeCbHp82vl_zkjn8KO_507MBNnJdO4b3ykrVVnOJ4KvOkxU' },
        { label: 'พรีเซนเทชัน', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5t9YVhRwtOv8zRKILkDrPhRNLTIaiW2r0wOtA2KDIkp0bbyWPOl-3AC3ji4507hbDX261n-GcCwAGUjt_kYXb8-lrufHuaM4BvE0OxxSjryAmWpvUtKx5fp5aBjACN3Y2Fn0qF2F_dWgBkwpyx86VltCgsdVczHOygKxuJhlFwXLacqnKxoBF9vzUA7jc8Ux8g85WCbu6or2SO56Kj8vy3ALjtHy9BvgGhFaqVeLc5PUiWjCCz9wYBX2MD9-_kdLqzshf53o6yE' },
        { label: 'ใบปลิว' }, { label: 'โลโก้' }, { label: 'เรซูเม่' },
      ],
    };
  const indonesianCopy: ResourceCopy = {
      title: 'Sumber daya lainnya',
      allArticles: 'Lihat semua artikel',
      moreProducts: 'Temukan lebih banyak produk',
      articles: [
        { tag: 'Panduan', title: 'Cara menulis faktur yang profesional', desc: 'Pelajari elemen penting yang seharusnya ada di setiap faktur profesional.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2D0YPYhtjV0YF_-UA6HcPf3krXByXj02TuMzoDpLIWyum475bRvG0fOWFVlSFSUnlmrxiUk8yHXYeEcg5H4cZWZYB28YS3wjjeyrV0vcFvM__ZkUF4K3LkW3EEec3PBTvmN0S5MMNodAIj9KrDAhCYpyYJ-LI_j0roXJqZ73NILyNxwvL5qzivGLktGfRZjNA6TuvRmN23R1SEx5MqwD6dbO3BJ8qTqS4kFxaaJmUXgBd63czhS1Mcqvng3zEf5EIo8khZo7CXk' },
        { tag: 'Tips', title: '5 tips agar dibayar tepat waktu', desc: 'Gunakan langkah praktis untuk memperbaiki arus kas dan mengurangi pembayaran terlambat.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqm9xrxDtZVRpdV2JbRlAgKE5LbJb40R021IJz1_1lt76yPtipJUyZ5zF16mCC3H4EPUqmKDG3CUoNWwXMUzFxHipUW9RuqQdQQsi0BOjHdfgJRlT7T1SEi2PgXS4YLqwanXpJI9D39DesctK-_5X362Ly15d52UlXC4yJqhEhFcSWkeyU1TXEg3gSnkmD0tsMVppmNnmZJnS2KFtHI_qhr8_MRXGW2MCj_6iwkQfcYXsOmpHSIzDnm-9-K4WNyxhF8AzQ8MF5ihc' },
        { tag: 'Freelance', title: 'Dasar-dasar penagihan untuk freelancer', desc: 'Pahami deskripsi layanan, syarat pembayaran, dan fondasi faktur yang rapi untuk pekerjaan freelance.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTYw3EyaYjLlhWIT8658mFKYzQWSLcQwt40cTPokZckSacqrhMOIA_ojdW4k3Aj-bXPq8pEP6nyJkhSAktpHtZIaH4jNMGes57YMF_RKL7AStiHvhbt93B82pgrVuKJY6Z5NyGmqMvwY9bChJtsbuOp-F37HVEcA6X4ErCZiw-KK7d1V6zbeGzR1Mhph-71qoCVENXKx1F__HpOcHlpGfZm9dAe6SdqHfMxekC5YFd22AYupQVu50GQt-ongq1CIQHKUybEBSjqk' },
      ],
      products: [
        { label: 'Newsletter', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-II_B3rCmCPZb4qe_CTxIn7aE2bvst7sU9qAKXUo9wZw2iKOASMj_z5T0MbbahE5A7EA-MASRVG-N-Hq2ImWvD9hORffFdfi8kB3Oz1GOStlwuemFDhKlpDMa7CF0ezTpP6CnnigKpkh7nyW_pTkY8sWWkyImRPWmemTBmQaqARnIxV7stpOKftIdw3aeF2gfwKzZCdaCwGV_7v2CweXYu0HALJehMIrMY1NIZOLNQNloC6zx-giy236HUfswOCWimezRASJyMVY' },
        { label: 'Kartu Nama', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2GY-dB6Z8WLbwQY-Y_-wfdEs-3m-a8GsaIyT1DcGrZ9Wifzu_VRfftk9PH6X0c4JjrKs5s1Qsjm3h28FEe43hawp-lvtdjYZHOo_8R7rgjbepmt2OfTgKPsnWd_MC311UMWYv0jx6kYsvs21ttru8aM6ItDi2rqGH7m2zNyQG2bygd1OcWRqDIkw65h8tXyCde7-NXuXl2amZW1NUck94YpfCk-x4BeCbHp82vl_zkjn8KO_507MBNnJdO4b3ykrVVnOJ4KvOkxU' },
        { label: 'Presentasi', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf5t9YVhRwtOv8zRKILkDrPhRNLTIaiW2r0wOtA2KDIkp0bbyWPOl-3AC3ji4507hbDX261n-GcCwAGUjt_kYXb8-lrufHuaM4BvE0OxxSjryAmWpvUtKx5fp5aBjACN3Y2Fn0qF2F_dWgBkwpyx86VltCgsdVczHOygKxuJhlFwXLacqnKxoBF9vzUA7jc8Ux8g85WCbu6or2SO56Kj8vy3ALjtHy9BvgGhFaqVeLc5PUiWjCCz9wYBX2MD9-_kdLqzshf53o6yE' },
        { label: 'Flyer' }, { label: 'Logo' }, { label: 'Resume' },
      ],
    };
  const copyByLang = {
    en: englishCopy,
    'zh-CN': simplifiedChineseCopy,
    'zh-TW': traditionalChineseCopy,
    th: thaiCopy,
    id: indonesianCopy,
  } satisfies Record<Language, ResourceCopy>;
  const copy = copyByLang[lang];

  return (
    <>
      <section className="bg-white py-14 md:py-20" data-purpose="blog-resources">
        <div className="px-4 sm:px-6">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-semibold tracking-tight text-dark md:text-4xl">{copy.title}</h2>
            <a className="hidden text-base font-semibold text-primary hover:underline md:block" href="#">{copy.allArticles}</a>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {copy.articles.map((item) => (
              <div key={item.title} className="group cursor-pointer">
                <div className="mb-5 overflow-hidden rounded-2xl"><img alt={item.title} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105" src={item.image} /></div>
                <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">{item.tag}</span>
                <h3 className="mt-2 mb-2 text-xl font-semibold text-slate-900 transition-colors group-hover:text-primary">{item.title}</h3>
                <p className="text-base leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden"><a className="text-base font-semibold text-primary hover:underline" href="#">{copy.allArticles}</a></div>
        </div>
      </section>

      <section className="border-t border-blue-100 bg-white py-12 md:py-14" data-purpose="product-discovery">
        <div className="px-4 sm:px-6">
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-dark md:text-left md:text-4xl">{copy.moreProducts}</h2>
          <div className="grid grid-cols-3 gap-6 md:grid-cols-6">
            {copy.products.map((item) => (
              <a key={item.label} className="group block text-center" href="#">
                <div className="mb-3 aspect-square overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all group-hover:shadow-md">
                  {item.image ? <img alt={item.label} className="h-full w-full object-cover" src={item.image} /> : <div className="flex h-full w-full items-center justify-center"><span className="text-sm font-medium text-gray-300">Img</span></div>}
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-primary">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
