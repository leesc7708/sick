import { storage } from './storage';

// 시연용 샘플 데이터 — 빈 화면 방지. 설정에서 호출, "전체 삭제"로 정리 가능.
export async function seedDemo() {
  const today = new Date();
  const d = (offset: number) => new Date(today.getTime() + offset * 86400000).toISOString().slice(0, 10);

  await storage.addHealthRecord({
    id: 'hc_demo1', type: '특수건강진단', title: '2026 상반기 특수건강진단 결과.pdf',
    fileType: 'pdf', fileUri: '', examDate: d(-30), expireDate: d(18), result: '적합', createdAt: d(-30),
  });
  await storage.addHealthRecord({
    id: 'hc_demo2', type: '일반건강검진', title: '일반건강검진 결과.jpg',
    fileType: 'image', fileUri: '', examDate: d(-120), createdAt: d(-120),
  });
  await storage.addWorkCheck({
    id: 'wc_demo1', workType: '밀폐공간', sleepOk: true, noAlcohol: true, tookMeds: true, noDizziness: true,
    completedAt: `${d(0)} 07:30`,
  });
  await storage.addIncident({
    id: 'inc_demo1', type: '질식', locationText: 'A구역 맨홀 내부', memo: '어지럼 호소',
    reportedAt: `${d(0)} 10:15`,
  });
  await storage.addSymptomMemo({
    id: 'memo_demo1', who: 'self', startedAt: `${d(0)} 오전 10시`, bodyParts: ['머리'], severity: 6,
    accompanying: ['어지럼'], atWork: true, workType: '밀폐공간', createdAt: `${d(0)} 10:20`,
  });
}
