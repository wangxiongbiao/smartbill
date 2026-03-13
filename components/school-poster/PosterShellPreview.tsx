import React from 'react';
import DocumentCardPreview from '@/components/school-poster/DocumentCardPreview';
import PreviewImage from '@/components/school-poster/PreviewImage';
import image1 from './1.png'
import image2 from './2.png'
import type { SchoolPoster } from '@/types';

interface PosterShellPreviewProps {
  poster: SchoolPoster;
}

function hasValue(value?: string) {
  return Boolean(value && value.trim());
}

export default function PosterShellPreview({ poster }: PosterShellPreviewProps) {
  const { shell } = poster;
  const brandVisible = shell.visibility.brand && (
    hasValue(shell.brand.logo)
    || hasValue(shell.brand.title)
    || hasValue(shell.brand.subtitle)
  );
  const studentRows = [
    { label: '姓名', value: shell.student.name },
    { label: '年龄 / 年级', value: shell.student.age },
    { label: '地区 / 标签', value: shell.student.city },
    { label: '申请周期 / 入学时间', value: shell.student.applicationPeriod },
    { label: '路径说明', value: shell.student.transferPath },
  ].filter((item) => hasValue(item.value));
  const footerRows = [
    shell.footer.tuition,
    shell.footer.pathway,
    shell.footer.highlights,
  ].filter(hasValue);
  const showSchoolCn = hasValue(shell.school.nameCn);
  const showSchoolEn = hasValue(shell.school.nameEn);
  const heroVisible = hasValue(shell.heroImage);
  const qrVisible = hasValue(shell.qrCode);
  const showStudentBlock = studentRows.length > 0;
  const showFooterBlock = footerRows.length > 0;
  const showDocumentFrame = shell.documentFrame.variant === 'placeholder' && brandVisible;

  return (
    <div className="relative min-h-[66rem] rounded-3xl overflow-hidden  bg-[#d0f0ff]  text-slate-900 shadow-[0_2.75rem_5.5rem_-2.5rem_rgba(15,23,42,0.32)]">
      {/* 标题 */}
      <div className='relative' style={{ zIndex: 2 }}>
        <div className="pt-8 px-10 flex">
          <img src={image1.src} alt="logo" className=" object-contain w-[5.5rem] h-[5.5rem]" />
          <div className='pt-3'>
            <div className="text-[0.6rem] font-semibold text-[#466382] mb-[0.2rem] tracking-[0.02em]"> 環球視野教育</div>
            <div className="text-[0.9rem] leading-none mb-[0.08rem] font-bold text-[#044195]" > ABCSSSSS</div>
            <div className="text-[0.9rem] leading-none mb-[0.08rem] font-bold text-[#044195]"> ABCSSSSS</div>
            <div className="text-[0.9rem] leading-none mb-[0.08rem] font-bold text-[#044195]"> ABCSSSSS</div>
          </div>
        </div>

        <div className='px-6'>
          <div className='flex leading-none mb-[0.4rem] text-[3.5rem] font-semibold text-[#044195] mt-10'>
            <div className='leading-none '>「</div>
            <div className='leading-none '>诺贝尔国际学校</div>
            <div className='leading-none '>」</div>
          </div>
          <div className='pl-8'>
            <div className='text-[1.7rem]  leading-none font-semibold text-[#777]'>wweaddada.wadada</div>
            <div className='pt-6'>
              <div className='flex text-[1.3rem] font-bold text-[#222]'>
                <div>王同学</div>
                <div>｜</div>
                <div>10岁</div>
                <div>｜</div>
                <div>河北邯郸</div>
              </div>
              <div className='flex text-[1.3rem] font-bold text-[#222]'>
                <div>申请周期1个月</div>

              </div>
              <div className='flex text-[1.3rem] font-bold text-[#222]'>
                <div>中国义务教育转Cambridge Primary Year 4</div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className='absolute bottom-0 w-full overflow-hidden'
        style={{
          zIndex: 1,
          clipPath: 'polygon(0 0, 100% 60%, 100% 100%, 0 100%)',
        }}
      >
        <img src={image2.src} alt="logo" className="max-h-[40rem] object-cover w-full h-full" />
      </div>

      <div
        className='absolute bottom-0 w-full bg-[#265aa8] h-[24%] overflow-hidden'
        style={{
          zIndex: 3,
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        <div className='w-full h-full '></div>
      </div>


      <div className='absolute flex pt-[5rem] gap-6 px-10 justify-end items-center bottom-0 text-[#f0f0f0] w-full  h-[22.5%]' style={{
        zIndex: 4
      }}>
        <div className='text-[1rem] font-light text-right'>
          <div >学费预算:6万元/年</div>
          <div>学术路径:IGCSE</div>
          <div>幼儿教育|小学教育|中学教育|国际预科</div>
        </div>
        <img src={image1.src} alt="logo" className="object-cover  w-[5rem] h-[5rem]" />
      </div>
    </div>
  );
}
