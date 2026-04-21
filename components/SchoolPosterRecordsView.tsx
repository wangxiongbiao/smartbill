"use client";

import React, { useMemo, useState } from 'react';
import type { Language, SchoolPoster } from '@/types';

interface SchoolPosterRecordsViewProps {
  records: SchoolPoster[];
  lang: Language;
  onCreate: () => void;
  onEdit: (record: SchoolPoster) => void;
  onDuplicate: (record: SchoolPoster) => void;
  onDelete: (record: SchoolPoster) => void;
}

export default function SchoolPosterRecordsView({
  records,
  lang,
  onCreate,
  onEdit,
  onDuplicate,
  onDelete,
}: SchoolPosterRecordsViewProps) {
  const [search, setSearch] = useState('');
  const copy = lang === 'zh-CN' || lang === 'zh-TW'
    ? {
      title: '院校海报',
      subtitle: '管理院校海报壳、学校信息和学生展示页面。',
      create: '新建海报',
      search: '搜索学校、同学或路径',
      emptyTitle: '还没有院校海报',
      emptySubtitle: '先创建一个示例海报，进入左编右预览模式。',
      edit: '编辑',
      duplicate: '复制',
      delete: '删除',
      updatedAt: '最近更新',
      student: '学生',
      posterShell: '海报壳',
    }
    : {
      title: 'School Posters',
      subtitle: 'Manage school poster shells, school info, and student-facing visuals.',
      create: 'Create Poster',
      search: 'Search school, student, or pathway',
      emptyTitle: 'No posters yet',
      emptySubtitle: 'Create one and open the split editor with live preview.',
      edit: 'Edit',
      duplicate: 'Duplicate',
      delete: 'Delete',
      updatedAt: 'Updated',
      student: 'Student',
      posterShell: 'Poster Shell',
    };

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => {
      const haystack = [
        record.shell.school.nameCn,
        record.shell.school.nameEn,
        record.shell.student.name,
        record.shell.student.age,
        record.shell.student.city,
        record.shell.student.applicationPeriod,
        record.shell.student.transferPath,
        record.shell.footer.tuition,
        record.shell.footer.pathway,
        record.shell.footer.highlights,
      ].join(' ').toLowerCase();

      return haystack.includes(query);
    });
  }, [records, search]);

  return (
    <div className="container mx-auto p-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">School Module</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-900">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{copy.subtitle}</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.search}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-300 focus:bg-white lg:w-80"
            />
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_1.25rem_2.5rem_-1.2rem_rgba(37,99,235,0.55)] transition hover:bg-blue-700"
            >
              {copy.create}
            </button>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <i className="fas fa-school text-2xl"></i>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-900">{copy.emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">{copy.emptySubtitle}</p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {copy.create}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {filteredRecords.map((record) => (
            <div key={record.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative overflow-hidden bg-[#dbeefb] px-6 py-6">
                {/* <div className="absolute inset-x-0 bottom-0 h-20 bg-[#2d5eaf]" style={{ clipPath: 'polygon(0 45%, 100% 0, 100% 100%, 0 100%)' }} /> */}
                <div className="relative z-10 flex gap-5">
                  <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] bg-white shadow-md">
                    {record.shell.heroImage ? (
                      <img src={record.shell.heroImage} alt={record.shell.school.nameEn} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 text-blue-600">
                        <i className="fas fa-image text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/80 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {record.shell.student.applicationPeriod || copy.posterShell}
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-2xl font-black tracking-[-0.04em] text-[#0d49a6]">
                      {record.shell.school.nameCn || record.shell.school.nameEn || copy.posterShell}
                    </h2>
                    {record.shell.school.nameEn && (
                      <p className="mt-2 truncate text-sm font-semibold uppercase tracking-[0.05em] text-slate-500">{record.shell.school.nameEn}</p>
                    )}
                    <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <p><span className="font-semibold">{copy.student}:</span> {record.shell.student.name}</p>
                      <p><span className="font-semibold">{copy.updatedAt}:</span> {new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(record.updatedAt))}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">

                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => onEdit(record)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    {copy.edit}
                  </button>
                  <button type="button" onClick={() => onDuplicate(record)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    {copy.duplicate}
                  </button>
                  <button type="button" onClick={() => onDelete(record)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                    {copy.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
