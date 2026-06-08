export interface BodyPart {
  id: string;
  label: string;
  emoji: string;
  defaultDepartments: string[];
}

export const BODY_PARTS: BodyPart[] = [
  { id: 'head', label: '머리', emoji: '🧠', defaultDepartments: ['신경과', '내과'] },
  { id: 'eye', label: '눈', emoji: '👁️', defaultDepartments: ['안과'] },
  { id: 'ear', label: '귀/코/목', emoji: '👂', defaultDepartments: ['이비인후과'] },
  { id: 'mouth', label: '입/치아', emoji: '🦷', defaultDepartments: ['치과'] },
  { id: 'chest', label: '가슴', emoji: '🫀', defaultDepartments: ['내과', '심장내과'] },
  { id: 'back', label: '등/허리', emoji: '🧍', defaultDepartments: ['정형외과', '신경외과'] },
  { id: 'abdomen', label: '배', emoji: '🫃', defaultDepartments: ['내과', '소화기내과'] },
  { id: 'arm', label: '팔/손', emoji: '💪', defaultDepartments: ['정형외과'] },
  { id: 'leg', label: '다리/발', emoji: '🦵', defaultDepartments: ['정형외과'] },
  { id: 'skin', label: '피부', emoji: '🩹', defaultDepartments: ['피부과'] },
  { id: 'genital', label: '비뇨/생식기', emoji: '⚕️', defaultDepartments: ['비뇨의학과', '산부인과'] },
  { id: 'mental', label: '정신/수면', emoji: '😴', defaultDepartments: ['정신건강의학과'] },
];
