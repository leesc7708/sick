import type { Lang } from '../i18n/translations';

// ─────────────────────────────────────────────────────────────
// 응급 의료 표현집 "바로 말하기"
//  - 외국인 근로자가 자기 언어 문장을 탭 → 한국어 음성 재생(+큰 자막).
//  - 번역기 아님: 미리 만든 고정 문장. 다급할 때 부위×양상 2탭으로 도달.
//  - ⚠️ 번역은 클로드 생성(의료통역 검수 없음). 정반대 뜻(부정문)·약/알레르기만 특히 주의.
//    사용자 신고 버튼으로 오역을 사후 수정. 진단 아님(의사 전달 보조).
//  - 음성은 "한국어"만 필요(입력 언어는 화면 텍스트로만). 1차 배치 = 아래 세트.
// ─────────────────────────────────────────────────────────────

export type PhraseGroupId =
  | 'emergency' | 'work' // 특수(부위 밖)
  | 'head' | 'eye' | 'chest' | 'belly' | 'back' | 'hand' | 'leg' | 'skin' | 'body' // 부위
  | 'history' | 'request' | 'basic'; // 특수(부위 밖)

export interface PhraseGroup {
  id: PhraseGroupId;
  icon: string;
  kind: 'urgent' | 'part' | 'info';
  label: Record<Lang, string>;
}

export interface Phrase {
  id: string;
  group: PhraseGroupId;
  ko: string;              // 재생되는 한국어(음성 대상)
  text: Record<Lang, string>; // 화면 표시(자국어). ko 포함.
}

// 그룹(1차 축): 응급·산재 먼저, 그다음 신체부위, 마지막 정보/요청/기본
export const PHRASE_GROUPS: PhraseGroup[] = [
  { id: 'emergency', icon: '🆘', kind: 'urgent', label: { ko: '응급 (급할 때)', en: 'Emergency', zh: '紧急', ja: '緊急', vi: 'Khẩn cấp', th: 'ฉุกเฉิน', es: 'Emergencia' } },
  { id: 'work', icon: '🦺', kind: 'urgent', label: { ko: '작업 중 다침', en: 'Injured at work', zh: '工伤', ja: '仕事中のけが', vi: 'Tai nạn lao động', th: 'บาดเจ็บจากงาน', es: 'Accidente laboral' } },
  { id: 'head', icon: '🤕', kind: 'part', label: { ko: '머리', en: 'Head', zh: '头', ja: '頭', vi: 'Đầu', th: 'ศีรษะ', es: 'Cabeza' } },
  { id: 'eye', icon: '👁️', kind: 'part', label: { ko: '눈', en: 'Eye', zh: '眼睛', ja: '目', vi: 'Mắt', th: 'ตา', es: 'Ojo' } },
  { id: 'chest', icon: '🫁', kind: 'part', label: { ko: '가슴', en: 'Chest', zh: '胸', ja: '胸', vi: 'Ngực', th: 'หน้าอก', es: 'Pecho' } },
  { id: 'belly', icon: '🩹', kind: 'part', label: { ko: '배', en: 'Stomach', zh: '肚子', ja: 'お腹', vi: 'Bụng', th: 'ท้อง', es: 'Estómago' } },
  { id: 'back', icon: '🧎', kind: 'part', label: { ko: '허리·등', en: 'Back', zh: '腰背', ja: '腰・背中', vi: 'Lưng', th: 'หลัง', es: 'Espalda' } },
  { id: 'hand', icon: '✋', kind: 'part', label: { ko: '손·팔', en: 'Hand / Arm', zh: '手·胳膊', ja: '手・腕', vi: 'Tay', th: 'มือ/แขน', es: 'Mano / Brazo' } },
  { id: 'leg', icon: '🦵', kind: 'part', label: { ko: '다리·발', en: 'Leg / Foot', zh: '腿·脚', ja: '足', vi: 'Chân', th: 'ขา/เท้า', es: 'Pierna / Pie' } },
  { id: 'skin', icon: '🩹', kind: 'part', label: { ko: '피부', en: 'Skin', zh: '皮肤', ja: '皮膚', vi: 'Da', th: 'ผิวหนัง', es: 'Piel' } },
  { id: 'body', icon: '🌡️', kind: 'part', label: { ko: '전신·열', en: 'Whole body', zh: '全身', ja: '全身', vi: 'Toàn thân', th: 'ทั้งตัว', es: 'Cuerpo entero' } },
  { id: 'history', icon: '💊', kind: 'info', label: { ko: '지병·약·알레르기', en: 'History / Meds', zh: '病史·用药', ja: '持病・薬', vi: 'Bệnh nền / Thuốc', th: 'โรคประจำตัว/ยา', es: 'Antecedentes / Medicación' } },
  { id: 'request', icon: '🙏', kind: 'info', label: { ko: '요청', en: 'Requests', zh: '请求', ja: 'お願い', vi: 'Yêu cầu', th: 'คำขอ', es: 'Peticiones' } },
  { id: 'basic', icon: '💬', kind: 'info', label: { ko: '기본 말', en: 'Basics', zh: '基本', ja: '基本', vi: 'Cơ bản', th: 'พื้นฐาน', es: 'Básico' } },
];

export const PHRASES: Phrase[] = [
  // 🆘 응급
  { id: 'e1', group: 'emergency', ko: '숨을 쉬기가 힘들어요.', text: { ko: '숨을 쉬기가 힘들어요.', en: 'I have trouble breathing.', zh: '我呼吸困难。', ja: '息が苦しいです。', vi: 'Tôi khó thở.', th: 'ฉันหายใจลำบาก', es: 'Tengo dificultad para respirar.' } },
  { id: 'e2', group: 'emergency', ko: '가슴이 조이고 식은땀이 나요.', text: { ko: '가슴이 조이고 식은땀이 나요.', en: 'My chest is tight and I am sweating cold.', zh: '我胸口发紧，冒冷汗。', ja: '胸が締めつけられ、冷や汗が出ます。', vi: 'Ngực tôi bị thắt lại và ra mồ hôi lạnh.', th: 'แน่นหน้าอกและเหงื่อออกเย็น', es: 'Tengo opresión en el pecho y sudor frío.' } },
  { id: 'e3', group: 'emergency', ko: '갑자기 한쪽 팔다리에 힘이 빠져요.', text: { ko: '갑자기 한쪽 팔다리에 힘이 빠져요.', en: 'One side of my body suddenly went weak.', zh: '我一侧手脚突然无力。', ja: '突然、片側の手足に力が入りません。', vi: 'Đột nhiên một bên tay chân của tôi bị yếu.', th: 'จู่ๆ แขนขาข้างหนึ่งอ่อนแรง', es: 'De repente un lado del cuerpo se me debilitó.' } },
  { id: 'e4', group: 'emergency', ko: '말이 어눌하고 얼굴이 비뚤어졌어요.', text: { ko: '말이 어눌하고 얼굴이 비뚤어졌어요.', en: 'My speech is slurred and my face is drooping.', zh: '我说话含糊，脸歪了。', ja: 'ろれつが回らず、顔がゆがんでいます。', vi: 'Tôi nói ngọng và mặt bị méo.', th: 'พูดไม่ชัดและหน้าเบี้ยว', es: 'Hablo con dificultad y se me tuerce la cara.' } },
  { id: 'e5', group: 'emergency', ko: '의식을 잃을 것 같아요.', text: { ko: '의식을 잃을 것 같아요.', en: 'I feel like I am going to pass out.', zh: '我快要昏过去了。', ja: '意識を失いそうです。', vi: 'Tôi cảm thấy như sắp ngất.', th: 'ฉันรู้สึกเหมือนจะหมดสติ', es: 'Siento que voy a desmayarme.' } },
  { id: 'e6', group: 'emergency', ko: '피가 멈추지 않아요.', text: { ko: '피가 멈추지 않아요.', en: 'The bleeding will not stop.', zh: '血止不住。', ja: '血が止まりません。', vi: 'Máu không ngừng chảy.', th: 'เลือดไหลไม่หยุด', es: 'La hemorragia no se detiene.' } },
  { id: 'e7', group: 'emergency', ko: '구급차를 불러 주세요.', text: { ko: '구급차를 불러 주세요.', en: 'Please call an ambulance.', zh: '请叫救护车。', ja: '救急車を呼んでください。', vi: 'Làm ơn gọi xe cấp cứu.', th: 'ช่วยเรียกรถพยาบาลด้วย', es: 'Por favor, llame a una ambulancia.' } },

  // 🦺 산업재해
  { id: 'w1', group: 'work', ko: '작업하다가 다쳤어요.', text: { ko: '작업하다가 다쳤어요.', en: 'I got hurt while working.', zh: '我工作时受伤了。', ja: '作業中にけがをしました。', vi: 'Tôi bị thương khi làm việc.', th: 'ฉันบาดเจ็บระหว่างทำงาน', es: 'Me lastimé mientras trabajaba.' } },
  { id: 'w2', group: 'work', ko: '기계에 손이 끼었어요.', text: { ko: '기계에 손이 끼었어요.', en: 'My hand got caught in a machine.', zh: '我的手被机器夹住了。', ja: '手が機械に挟まれました。', vi: 'Tay tôi bị kẹt vào máy.', th: 'มือฉันติดในเครื่องจักร', es: 'Se me atrapó la mano en una máquina.' } },
  { id: 'w3', group: 'work', ko: '높은 곳에서 떨어졌어요.', text: { ko: '높은 곳에서 떨어졌어요.', en: 'I fell from a height.', zh: '我从高处摔下来了。', ja: '高い所から落ちました。', vi: 'Tôi bị ngã từ trên cao.', th: 'ฉันตกจากที่สูง', es: 'Me caí desde una altura.' } },
  { id: 'w4', group: 'work', ko: '화학약품이 눈에 튀었어요.', text: { ko: '화학약품이 눈에 튀었어요.', en: 'A chemical splashed into my eye.', zh: '化学药品溅进了我的眼睛。', ja: '薬品が目に入りました。', vi: 'Hóa chất bắn vào mắt tôi.', th: 'สารเคมีกระเด็นเข้าตา', es: 'Un producto químico me salpicó el ojo.' } },
  { id: 'w5', group: 'work', ko: '화상을 입었어요.', text: { ko: '화상을 입었어요.', en: 'I got burned.', zh: '我烧伤了。', ja: 'やけどをしました。', vi: 'Tôi bị bỏng.', th: 'ฉันโดนไฟไหม้/ลวก', es: 'Me quemé.' } },
  { id: 'w6', group: 'work', ko: '감전됐어요.', text: { ko: '감전됐어요.', en: 'I got an electric shock.', zh: '我触电了。', ja: '感電しました。', vi: 'Tôi bị điện giật.', th: 'ฉันโดนไฟฟ้าช็อต', es: 'Me dio una descarga eléctrica.' } },
  { id: 'w7', group: 'work', ko: '이상한 가스 냄새가 나고 어지러워요.', text: { ko: '이상한 가스 냄새가 나고 어지러워요.', en: 'I smell strange gas and feel dizzy.', zh: '有奇怪的气体味，我头晕。', ja: '変なガスの匂いがして、めまいがします。', vi: 'Tôi ngửi thấy mùi khí lạ và bị chóng mặt.', th: 'ได้กลิ่นแก๊สแปลกๆ และรู้สึกเวียนหัว', es: 'Huelo un gas extraño y estoy mareado.' } },

  // 🤕 머리
  { id: 'h1', group: 'head', ko: '머리가 아파요.', text: { ko: '머리가 아파요.', en: 'I have a headache.', zh: '我头疼。', ja: '頭が痛いです。', vi: 'Tôi bị đau đầu.', th: 'ฉันปวดหัว', es: 'Me duele la cabeza.' } },
  { id: 'h2', group: 'head', ko: '어지럽고 핑 돌아요.', text: { ko: '어지럽고 핑 돌아요.', en: 'I feel dizzy and the room is spinning.', zh: '我头晕，天旋地转。', ja: 'めまいがして、ぐるぐる回ります。', vi: 'Tôi chóng mặt và mọi thứ quay cuồng.', th: 'ฉันเวียนหัวและบ้านหมุน', es: 'Estoy mareado y todo me da vueltas.' } },
  { id: 'h3', group: 'head', ko: '머리를 부딪혔어요.', text: { ko: '머리를 부딪혔어요.', en: 'I hit my head.', zh: '我撞到头了。', ja: '頭をぶつけました。', vi: 'Tôi bị đập đầu.', th: 'ฉันหัวกระแทก', es: 'Me golpeé la cabeza.' } },

  // 👁️ 눈
  { id: 'y1', group: 'eye', ko: '눈이 아파요.', text: { ko: '눈이 아파요.', en: 'My eye hurts.', zh: '我眼睛疼。', ja: '目が痛いです。', vi: 'Mắt tôi bị đau.', th: 'ฉันปวดตา', es: 'Me duele el ojo.' } },
  { id: 'y2', group: 'eye', ko: '눈에 뭐가 들어갔어요.', text: { ko: '눈에 뭐가 들어갔어요.', en: 'Something got into my eye.', zh: '有东西进了我的眼睛。', ja: '目に何か入りました。', vi: 'Có gì đó rơi vào mắt tôi.', th: 'มีอะไรเข้าตา', es: 'Se me metió algo en el ojo.' } },
  { id: 'y3', group: 'eye', ko: '용접하고 나서 눈이 아파요.', text: { ko: '용접하고 나서 눈이 아파요.', en: 'My eyes hurt after welding.', zh: '焊接后我的眼睛疼。', ja: '溶接のあと、目が痛いです。', vi: 'Mắt tôi đau sau khi hàn.', th: 'ตาฉันเจ็บหลังจากเชื่อมโลหะ', es: 'Me duelen los ojos después de soldar.' } },

  // 🫁 가슴
  { id: 'c1', group: 'chest', ko: '가슴이 답답해요.', text: { ko: '가슴이 답답해요.', en: 'My chest feels tight.', zh: '我胸口发闷。', ja: '胸が苦しいです。', vi: 'Ngực tôi tức nặng.', th: 'ฉันแน่นหน้าอก', es: 'Siento opresión en el pecho.' } },
  { id: 'c2', group: 'chest', ko: '숨이 차요.', text: { ko: '숨이 차요.', en: 'I am short of breath.', zh: '我喘不上气。', ja: '息切れがします。', vi: 'Tôi bị hụt hơi.', th: 'ฉันหายใจไม่ทัน', es: 'Me falta el aire.' } },
  { id: 'c3', group: 'chest', ko: '명치가 답답하고 체한 것 같아요.', text: { ko: '명치가 답답하고 체한 것 같아요.', en: 'My upper stomach feels blocked, like indigestion.', zh: '我心口发闷，好像积食了。', ja: 'みぞおちが苦しく、消化不良のようです。', vi: 'Vùng thượng vị của tôi tức, như bị khó tiêu.', th: 'ลิ้นปี่อึดอัดเหมือนอาหารไม่ย่อย', es: 'Siento pesadez en la boca del estómago, como indigestión.' } },

  // 🩹 배
  { id: 'b1', group: 'belly', ko: '배가 아파요.', text: { ko: '배가 아파요.', en: 'My stomach hurts.', zh: '我肚子疼。', ja: 'お腹が痛いです。', vi: 'Tôi bị đau bụng.', th: 'ฉันปวดท้อง', es: 'Me duele el estómago.' } },
  { id: 'b2', group: 'belly', ko: '속이 더부룩하고 메스꺼워요.', text: { ko: '속이 더부룩하고 메스꺼워요.', en: 'I feel bloated and nauseous.', zh: '我肚子胀，还想吐。', ja: 'お腹が張って、吐き気がします。', vi: 'Tôi bị đầy bụng và buồn nôn.', th: 'ท้องอืดและคลื่นไส้', es: 'Me siento hinchado y con náuseas.' } },
  { id: 'b3', group: 'belly', ko: '설사를 해요.', text: { ko: '설사를 해요.', en: 'I have diarrhea.', zh: '我拉肚子。', ja: '下痢をしています。', vi: 'Tôi bị tiêu chảy.', th: 'ฉันท้องเสีย', es: 'Tengo diarrea.' } },
  { id: 'b4', group: 'belly', ko: '토할 것 같아요.', text: { ko: '토할 것 같아요.', en: 'I feel like vomiting.', zh: '我想吐。', ja: '吐きそうです。', vi: 'Tôi buồn nôn muốn ói.', th: 'ฉันรู้สึกอยากอาเจียน', es: 'Tengo ganas de vomitar.' } },

  // 🧎 허리·등
  { id: 'k1', group: 'back', ko: '허리가 아파서 움직이기 힘들어요.', text: { ko: '허리가 아파서 움직이기 힘들어요.', en: 'My back hurts and it is hard to move.', zh: '我腰疼，很难活动。', ja: '腰が痛くて動くのがつらいです。', vi: 'Lưng tôi đau, khó cử động.', th: 'ฉันปวดหลังจนขยับลำบาก', es: 'Me duele la espalda y me cuesta moverme.' } },
  { id: 'k2', group: 'back', ko: '허리를 삐끗했어요.', text: { ko: '허리를 삐끗했어요.', en: 'I strained my back.', zh: '我闪到腰了。', ja: 'ぎっくり腰になりました。', vi: 'Tôi bị trẹo lưng.', th: 'ฉันปวดหลังจากยกของ (หลังเคล็ด)', es: 'Me lastioné la espalda (tirón).' } },

  // ✋ 손·팔
  { id: 'n1', group: 'hand', ko: '손이 저리고 감각이 없어요.', text: { ko: '손이 저리고 감각이 없어요.', en: 'My hand is numb and has no feeling.', zh: '我的手发麻，没有知觉。', ja: '手がしびれて感覚がありません。', vi: 'Tay tôi bị tê và mất cảm giác.', th: 'มือฉันชาและไม่มีความรู้สึก', es: 'Tengo la mano dormida y sin sensibilidad.' } },
  { id: 'n2', group: 'hand', ko: '손을 베였어요.', text: { ko: '손을 베였어요.', en: 'I cut my hand.', zh: '我的手割伤了。', ja: '手を切りました。', vi: 'Tôi bị đứt tay.', th: 'ฉันมีดบาดมือ', es: 'Me corté la mano.' } },
  { id: 'n3', group: 'hand', ko: '손목이 아파요.', text: { ko: '손목이 아파요.', en: 'My wrist hurts.', zh: '我手腕疼。', ja: '手首が痛いです。', vi: 'Cổ tay tôi bị đau.', th: 'ฉันปวดข้อมือ', es: 'Me duele la muñeca.' } },

  // 🦵 다리·발
  { id: 'l1', group: 'leg', ko: '다리가 아파요.', text: { ko: '다리가 아파요.', en: 'My leg hurts.', zh: '我腿疼。', ja: '足が痛いです。', vi: 'Chân tôi bị đau.', th: 'ฉันปวดขา', es: 'Me duele la pierna.' } },
  { id: 'l2', group: 'leg', ko: '발가락에 감각이 없어요.', text: { ko: '발가락에 감각이 없어요.', en: 'My toes have no feeling.', zh: '我脚趾没有知觉。', ja: '足の指の感覚がありません。', vi: 'Ngón chân tôi mất cảm giác.', th: 'นิ้วเท้าฉันไม่มีความรู้สึก', es: 'No siento los dedos del pie.' } },
  { id: 'l3', group: 'leg', ko: '발목을 삐었어요.', text: { ko: '발목을 삐었어요.', en: 'I sprained my ankle.', zh: '我扭到脚踝了。', ja: '足首をひねりました。', vi: 'Tôi bị trẹo mắt cá chân.', th: 'ฉันข้อเท้าแพลง', es: 'Me torcí el tobillo.' } },

  // 🩹 피부
  { id: 's1', group: 'skin', ko: '피부가 가렵고 발진이 났어요.', text: { ko: '피부가 가렵고 발진이 났어요.', en: 'My skin is itchy and has a rash.', zh: '我皮肤痒，起了疹子。', ja: '肌がかゆく、発疹が出ました。', vi: 'Da tôi bị ngứa và nổi mẩn.', th: 'ผิวฉันคันและมีผื่น', es: 'Me pica la piel y tengo un sarpullido.' } },
  { id: 's2', group: 'skin', ko: '데어서 화끈거려요.', text: { ko: '데어서 화끈거려요.', en: 'I got burned and it stings.', zh: '我烫伤了，火辣辣的。', ja: 'やけどしてヒリヒリします。', vi: 'Tôi bị bỏng và rát.', th: 'ฉันโดนลวกและแสบร้อน', es: 'Me quemé y me arde.' } },

  // 🌡️ 전신·열
  { id: 'g1', group: 'body', ko: '열이 나요.', text: { ko: '열이 나요.', en: 'I have a fever.', zh: '我发烧了。', ja: '熱があります。', vi: 'Tôi bị sốt.', th: 'ฉันมีไข้', es: 'Tengo fiebre.' } },
  { id: 'g2', group: 'body', ko: '온몸이 쑤시고 힘이 없어요.', text: { ko: '온몸이 쑤시고 힘이 없어요.', en: 'My whole body aches and I have no energy.', zh: '我浑身酸痛，没力气。', ja: '全身が痛くて、力が出ません。', vi: 'Toàn thân tôi ê ẩm và không có sức.', th: 'ปวดเมื่อยทั้งตัวและไม่มีแรง', es: 'Me duele todo el cuerpo y no tengo fuerzas.' } },
  { id: 'g3', group: 'body', ko: '식은땀이 나요.', text: { ko: '식은땀이 나요.', en: 'I am breaking out in a cold sweat.', zh: '我冒冷汗。', ja: '冷や汗が出ます。', vi: 'Tôi ra mồ hôi lạnh.', th: 'ฉันเหงื่อออกเย็น', es: 'Tengo sudor frío.' } },

  // 💊 지병·약·알레르기 (오역 주의 — 특히 알레르기)
  { id: 'd1', group: 'history', ko: '저는 당뇨가 있어요.', text: { ko: '저는 당뇨가 있어요.', en: 'I have diabetes.', zh: '我有糖尿病。', ja: '私は糖尿病があります。', vi: 'Tôi bị bệnh tiểu đường.', th: 'ฉันเป็นเบาหวาน', es: 'Tengo diabetes.' } },
  { id: 'd2', group: 'history', ko: '저는 고혈압이 있어요.', text: { ko: '저는 고혈압이 있어요.', en: 'I have high blood pressure.', zh: '我有高血压。', ja: '私は高血圧があります。', vi: 'Tôi bị cao huyết áp.', th: 'ฉันเป็นความดันโลหิตสูง', es: 'Tengo presión arterial alta.' } },
  { id: 'd3', group: 'history', ko: '저는 이 약을 먹고 있어요.', text: { ko: '저는 이 약을 먹고 있어요.', en: 'I am taking this medicine.', zh: '我在吃这个药。', ja: '私はこの薬を飲んでいます。', vi: 'Tôi đang uống thuốc này.', th: 'ฉันกำลังกินยานี้', es: 'Estoy tomando este medicamento.' } },
  { id: 'd4', group: 'history', ko: '저는 이 약에 알레르기가 있어요.', text: { ko: '저는 이 약에 알레르기가 있어요.', en: 'I am allergic to this medicine.', zh: '我对这个药过敏。', ja: '私はこの薬にアレルギーがあります。', vi: 'Tôi bị dị ứng với thuốc này.', th: 'ฉันแพ้ยานี้', es: 'Soy alérgico a este medicamento.' } },

  // 🙏 요청
  { id: 'r1', group: 'request', ko: '병원에 데려다 주세요.', text: { ko: '병원에 데려다 주세요.', en: 'Please take me to a hospital.', zh: '请带我去医院。', ja: '病院に連れて行ってください。', vi: 'Làm ơn đưa tôi đến bệnh viện.', th: 'ช่วยพาฉันไปโรงพยาบาลด้วย', es: 'Por favor, lléveme a un hospital.' } },
  { id: 'r2', group: 'request', ko: '통역을 불러 주세요.', text: { ko: '통역을 불러 주세요.', en: 'Please call an interpreter.', zh: '请叫一位翻译。', ja: '通訳を呼んでください。', vi: 'Làm ơn gọi phiên dịch.', th: 'ช่วยเรียกล่ามให้ด้วย', es: 'Por favor, llame a un intérprete.' } },
  { id: 'r3', group: 'request', ko: '물 좀 주세요.', text: { ko: '물 좀 주세요.', en: 'Please give me some water.', zh: '请给我一点水。', ja: '水をください。', vi: 'Làm ơn cho tôi ít nước.', th: 'ขอน้ำหน่อย', es: 'Por favor, deme un poco de agua.' } },

  // 💬 기본
  { id: 'a1', group: 'basic', ko: '아파요.', text: { ko: '아파요.', en: 'It hurts.', zh: '很疼。', ja: '痛いです。', vi: 'Tôi bị đau.', th: 'เจ็บ/ปวด', es: 'Me duele.' } },
  { id: 'a2', group: 'basic', ko: '여기가 아파요.', text: { ko: '여기가 아파요.', en: 'It hurts here.', zh: '这里疼。', ja: 'ここが痛いです。', vi: 'Chỗ này bị đau.', th: 'เจ็บตรงนี้', es: 'Me duele aquí.' } },
  { id: 'a3', group: 'basic', ko: '천천히 말해 주세요.', text: { ko: '천천히 말해 주세요.', en: 'Please speak slowly.', zh: '请说慢一点。', ja: 'ゆっくり話してください。', vi: 'Làm ơn nói chậm lại.', th: 'ช่วยพูดช้าๆ หน่อย', es: 'Por favor, hable despacio.' } },
  { id: 'a4', group: 'basic', ko: '한국어를 잘 못해요.', text: { ko: '한국어를 잘 못해요.', en: 'I cannot speak Korean well.', zh: '我韩语说得不好。', ja: '韓国語がうまく話せません。', vi: 'Tôi không nói tốt tiếng Hàn.', th: 'ฉันพูดภาษาเกาหลีไม่เก่ง', es: 'No hablo bien el coreano.' } },
  { id: 'a5', group: 'basic', ko: '도와주세요.', text: { ko: '도와주세요.', en: 'Please help me.', zh: '请帮帮我。', ja: '助けてください。', vi: 'Làm ơn giúp tôi.', th: 'ช่วยฉันด้วย', es: 'Por favor, ayúdeme.' } },

  // ── 확장 배치 (부위×양상 심화 + 응급·산재·과거력) ──
  { id: 'e8', group: 'emergency', ko: '온몸이 붓고 숨쉬기가 힘들어요.', text: { ko: '온몸이 붓고 숨쉬기가 힘들어요.', en: 'My whole body is swelling and I cannot breathe well.', zh: '我全身肿胀，呼吸困难。', ja: '全身が腫れて、息がしにくいです。', vi: 'Toàn thân tôi sưng lên và khó thở.', th: 'ตัวบวมทั้งตัวและหายใจลำบาก', es: 'Se me hincha todo el cuerpo y no puedo respirar bien.' } },
  { id: 'e9', group: 'emergency', ko: '사람이 쓰러졌어요.', text: { ko: '사람이 쓰러졌어요.', en: 'Someone has collapsed.', zh: '有人晕倒了。', ja: '人が倒れました。', vi: 'Có người bị ngất.', th: 'มีคนล้มหมดสติ', es: 'Alguien se ha desplomado.' } },
  { id: 'w8', group: 'work', ko: '무거운 물건에 깔렸어요.', text: { ko: '무거운 물건에 깔렸어요.', en: 'I am pinned under something heavy.', zh: '我被重物压住了。', ja: '重い物の下敷きになりました。', vi: 'Tôi bị vật nặng đè lên.', th: 'ฉันถูกของหนักทับ', es: 'Estoy atrapado bajo algo pesado.' } },
  { id: 'w9', group: 'work', ko: '손가락이 잘렸어요.', text: { ko: '손가락이 잘렸어요.', en: 'My finger was cut off.', zh: '我的手指被切断了。', ja: '指が切断されました。', vi: 'Ngón tay tôi bị đứt lìa.', th: 'นิ้วฉันขาด', es: 'Se me cortó un dedo.' } },
  { id: 'w10', group: 'work', ko: '날카로운 것에 찔렸어요.', text: { ko: '날카로운 것에 찔렸어요.', en: 'I got stabbed by something sharp.', zh: '我被尖锐物刺伤了。', ja: '鋭い物が刺さりました。', vi: 'Tôi bị vật sắc nhọn đâm.', th: 'ฉันถูกของมีคมทิ่ม', es: 'Me pinché con algo afilado.' } },
  { id: 'h4', group: 'head', ko: '뒷목이 뻣뻣하고 아파요.', text: { ko: '뒷목이 뻣뻣하고 아파요.', en: 'The back of my neck is stiff and painful.', zh: '我后脖子僵硬又疼。', ja: '首の後ろがこわばって痛いです。', vi: 'Gáy của tôi bị cứng và đau.', th: 'ต้นคอฉันแข็งและปวด', es: 'Tengo la nuca rígida y me duele.' } },
  { id: 'h5', group: 'head', ko: '갑자기 심한 두통이 왔어요.', text: { ko: '갑자기 심한 두통이 왔어요.', en: 'I suddenly got a severe headache.', zh: '我突然剧烈头痛。', ja: '突然ひどい頭痛がしました。', vi: 'Tôi đột nhiên đau đầu dữ dội.', th: 'จู่ๆ ฉันปวดหัวรุนแรง', es: 'De repente me dio un dolor de cabeza muy fuerte.' } },
  { id: 'y4', group: 'eye', ko: '눈이 잘 안 보여요.', text: { ko: '눈이 잘 안 보여요.', en: 'I cannot see well.', zh: '我看不清楚。', ja: 'よく見えません。', vi: 'Tôi nhìn không rõ.', th: 'ฉันมองไม่ค่อยเห็น', es: 'No veo bien.' } },
  { id: 'y5', group: 'eye', ko: '눈이 빨갛게 충혈됐어요.', text: { ko: '눈이 빨갛게 충혈됐어요.', en: 'My eye is red and bloodshot.', zh: '我的眼睛红了、充血了。', ja: '目が赤く充血しています。', vi: 'Mắt tôi bị đỏ và sung huyết.', th: 'ตาฉันแดงก่ำ', es: 'Tengo el ojo rojo e irritado.' } },
  { id: 'c4', group: 'chest', ko: '심장이 빨리 뛰어요.', text: { ko: '심장이 빨리 뛰어요.', en: 'My heart is beating fast.', zh: '我心跳很快。', ja: '心臓がドキドキします。', vi: 'Tim tôi đập nhanh.', th: 'หัวใจฉันเต้นเร็ว', es: 'El corazón me late muy rápido.' } },
  { id: 'b5', group: 'belly', ko: '오른쪽 아랫배가 아파요.', text: { ko: '오른쪽 아랫배가 아파요.', en: 'My lower right belly hurts.', zh: '我右下腹疼。', ja: '右下腹が痛いです。', vi: 'Bụng dưới bên phải của tôi đau.', th: 'ท้องน้อยด้านขวาปวด', es: 'Me duele la parte inferior derecha del abdomen.' } },
  { id: 'b6', group: 'belly', ko: '토했어요.', text: { ko: '토했어요.', en: 'I vomited.', zh: '我吐了。', ja: '吐きました。', vi: 'Tôi đã bị nôn.', th: 'ฉันอาเจียนแล้ว', es: 'Vomité.' } },
  { id: 'k3', group: 'back', ko: '허리부터 다리까지 저려요.', text: { ko: '허리부터 다리까지 저려요.', en: 'Numbness runs from my lower back down my leg.', zh: '我从腰到腿都发麻。', ja: '腰から足までしびれます。', vi: 'Tôi bị tê từ thắt lưng xuống chân.', th: 'ชาตั้งแต่หลังลงไปถึงขา', es: 'Siento entumecimiento desde la espalda baja hasta la pierna.' } },
  { id: 'n4', group: 'hand', ko: '손가락이 안 움직여요.', text: { ko: '손가락이 안 움직여요.', en: 'My fingers will not move.', zh: '我的手指动不了。', ja: '指が動きません。', vi: 'Ngón tay tôi không cử động được.', th: 'นิ้วฉันขยับไม่ได้', es: 'No puedo mover los dedos.' } },
  { id: 'n5', group: 'hand', ko: '어깨가 아파서 팔을 못 들겠어요.', text: { ko: '어깨가 아파서 팔을 못 들겠어요.', en: 'My shoulder hurts and I cannot raise my arm.', zh: '我肩膀疼，抬不起胳膊。', ja: '肩が痛くて腕を上げられません。', vi: 'Vai tôi đau, không giơ tay lên được.', th: 'ไหล่ปวดจนยกแขนไม่ขึ้น', es: 'Me duele el hombro y no puedo levantar el brazo.' } },
  { id: 'l4', group: 'leg', ko: '무릎이 붓고 아파요.', text: { ko: '무릎이 붓고 아파요.', en: 'My knee is swollen and painful.', zh: '我的膝盖肿了、疼。', ja: '膝が腫れて痛いです。', vi: 'Đầu gối tôi sưng và đau.', th: 'เข่าฉันบวมและปวด', es: 'Tengo la rodilla hinchada y me duele.' } },
  { id: 'l5', group: 'leg', ko: '다리에 쥐가 났어요.', text: { ko: '다리에 쥐가 났어요.', en: 'I have a cramp in my leg.', zh: '我腿抽筋了。', ja: '足がつりました。', vi: 'Chân tôi bị chuột rút.', th: 'ขาฉันเป็นตะคริว', es: 'Tengo un calambre en la pierna.' } },
  { id: 's3', group: 'skin', ko: '상처가 곪았어요.', text: { ko: '상처가 곪았어요.', en: 'My wound is festering.', zh: '我的伤口化脓了。', ja: '傷が化膿しました。', vi: 'Vết thương của tôi bị mưng mủ.', th: 'แผลฉันเป็นหนอง', es: 'La herida se me ha infectado.' } },
  { id: 's4', group: 'skin', ko: '벌레에 물렸어요.', text: { ko: '벌레에 물렸어요.', en: 'I got bitten by an insect.', zh: '我被虫子咬了。', ja: '虫に刺されました。', vi: 'Tôi bị côn trùng cắn.', th: 'ฉันโดนแมลงกัด', es: 'Me picó un insecto.' } },
  { id: 'g4', group: 'body', ko: '오한이 들고 추워요.', text: { ko: '오한이 들고 추워요.', en: 'I have chills and feel cold.', zh: '我发冷、打寒战。', ja: '寒気がして震えます。', vi: 'Tôi bị ớn lạnh và thấy lạnh.', th: 'ฉันหนาวสั่น', es: 'Tengo escalofríos y frío.' } },
  { id: 'g5', group: 'body', ko: '기운이 하나도 없어요.', text: { ko: '기운이 하나도 없어요.', en: 'I have no energy at all.', zh: '我一点力气都没有。', ja: '全く力が出ません。', vi: 'Tôi hoàn toàn không có sức.', th: 'ฉันไม่มีแรงเลย', es: 'No tengo nada de energía.' } },
  { id: 'd5', group: 'history', ko: '저는 심장병이 있어요.', text: { ko: '저는 심장병이 있어요.', en: 'I have heart disease.', zh: '我有心脏病。', ja: '私は心臓病があります。', vi: 'Tôi bị bệnh tim.', th: 'ฉันเป็นโรคหัวใจ', es: 'Tengo una enfermedad del corazón.' } },
  { id: 'd6', group: 'history', ko: '저는 천식이 있어요.', text: { ko: '저는 천식이 있어요.', en: 'I have asthma.', zh: '我有哮喘。', ja: '私は喘息があります。', vi: 'Tôi bị hen suyễn.', th: 'ฉันเป็นโรคหอบหืด', es: 'Tengo asma.' } },
  { id: 'd7', group: 'history', ko: '저는 임신 중이에요.', text: { ko: '저는 임신 중이에요.', en: 'I am pregnant.', zh: '我怀孕了。', ja: '私は妊娠しています。', vi: 'Tôi đang mang thai.', th: 'ฉันกำลังตั้งครรภ์', es: 'Estoy embarazada.' } },
  { id: 'r4', group: 'request', ko: '회사(사장님)에 연락해 주세요.', text: { ko: '회사(사장님)에 연락해 주세요.', en: 'Please contact my company (boss).', zh: '请联系我的公司（老板）。', ja: '会社（社長）に連絡してください。', vi: 'Làm ơn liên hệ công ty (chủ) của tôi.', th: 'ช่วยติดต่อบริษัท (เจ้านาย) ของฉัน', es: 'Por favor, contacte a mi empresa (jefe).' } },
  { id: 'r5', group: 'request', ko: '가까운 응급실이 어디예요?', text: { ko: '가까운 응급실이 어디예요?', en: 'Where is the nearest emergency room?', zh: '最近的急诊室在哪里？', ja: '近い救急室はどこですか？', vi: 'Phòng cấp cứu gần nhất ở đâu?', th: 'ห้องฉุกเฉินที่ใกล้ที่สุดอยู่ที่ไหน?', es: '¿Dónde está la sala de urgencias más cercana?' } },
  { id: 'a6', group: 'basic', ko: '많이 아파요.', text: { ko: '많이 아파요.', en: 'It hurts a lot.', zh: '非常疼。', ja: 'とても痛いです。', vi: 'Tôi rất đau.', th: 'เจ็บมาก', es: 'Me duele mucho.' } },
  { id: 'a7', group: 'basic', ko: '어제부터 아팠어요.', text: { ko: '어제부터 아팠어요.', en: 'It has hurt since yesterday.', zh: '从昨天开始就疼。', ja: '昨日から痛いです。', vi: 'Tôi đau từ hôm qua.', th: 'ปวดตั้งแต่เมื่อวาน', es: 'Me duele desde ayer.' } },
  { id: 'a8', group: 'basic', ko: '갑자기 아프기 시작했어요.', text: { ko: '갑자기 아프기 시작했어요.', en: 'It started hurting suddenly.', zh: '突然开始疼了。', ja: '急に痛くなりました。', vi: 'Nó bắt đầu đau đột ngột.', th: 'จู่ๆ ก็เริ่มปวด', es: 'Empezó a doler de repente.' } },

  // ── 확장 배치 2 (100개 목표) ──
  { id: 'e10', group: 'emergency', ko: '갑자기 가슴이 찢어질 듯 아파요.', text: { ko: '갑자기 가슴이 찢어질 듯 아파요.', en: 'I suddenly have a tearing pain in my chest.', zh: '我胸口突然像撕裂一样痛。', ja: '突然、胸が引き裂かれるように痛みます。', vi: 'Ngực tôi đột nhiên đau như xé.', th: 'จู่ๆ เจ็บหน้าอกเหมือนถูกฉีก', es: 'De repente siento un dolor desgarrador en el pecho.' } },
  { id: 'w11', group: 'work', ko: '눈에 쇳가루가 들어갔어요.', text: { ko: '눈에 쇳가루가 들어갔어요.', en: 'Metal shavings got into my eye.', zh: '铁屑进了我的眼睛。', ja: '目に鉄粉が入りました。', vi: 'Mạt sắt bay vào mắt tôi.', th: 'ผงเหล็กเข้าตา', es: 'Me entraron virutas de metal en el ojo.' } },
  { id: 'w12', group: 'work', ko: '미끄러져 넘어졌어요.', text: { ko: '미끄러져 넘어졌어요.', en: 'I slipped and fell.', zh: '我滑倒了。', ja: '滑って転びました。', vi: 'Tôi bị trượt ngã.', th: 'ฉันลื่นล้ม', es: 'Me resbalé y me caí.' } },
  { id: 'h6', group: 'head', ko: '귀가 아파요.', text: { ko: '귀가 아파요.', en: 'My ear hurts.', zh: '我耳朵疼。', ja: '耳が痛いです。', vi: 'Tai tôi bị đau.', th: 'ฉันปวดหู', es: 'Me duele el oído.' } },
  { id: 'h7', group: 'head', ko: '코피가 나요.', text: { ko: '코피가 나요.', en: 'My nose is bleeding.', zh: '我流鼻血。', ja: '鼻血が出ます。', vi: 'Tôi bị chảy máu mũi.', th: 'ฉันเลือดกำเดาไหล', es: 'Me sangra la nariz.' } },
  { id: 'h8', group: 'head', ko: '이가 아파요.', text: { ko: '이가 아파요.', en: 'My tooth hurts.', zh: '我牙疼。', ja: '歯が痛いです。', vi: 'Tôi bị đau răng.', th: 'ฉันปวดฟัน', es: 'Me duele una muela.' } },
  { id: 'c5', group: 'chest', ko: '기침이 심하고 가래가 나와요.', text: { ko: '기침이 심하고 가래가 나와요.', en: 'I have a bad cough with phlegm.', zh: '我咳嗽厉害，还有痰。', ja: '咳がひどく、痰が出ます。', vi: 'Tôi ho nhiều và có đờm.', th: 'ฉันไอหนักและมีเสมหะ', es: 'Tengo mucha tos con flema.' } },
  { id: 'b7', group: 'belly', ko: '피가 섞인 변을 봤어요.', text: { ko: '피가 섞인 변을 봤어요.', en: 'I had bloody stool.', zh: '我大便带血。', ja: '血の混じった便が出ました。', vi: 'Tôi đi ngoài ra máu.', th: 'ฉันถ่ายมีเลือดปน', es: 'Tuve heces con sangre.' } },
  { id: 'b8', group: 'belly', ko: '며칠째 변을 못 봤어요.', text: { ko: '며칠째 변을 못 봤어요.', en: 'I have not had a bowel movement for several days.', zh: '我好几天没大便了。', ja: '数日間、便が出ていません。', vi: 'Tôi đã mấy ngày không đi ngoài được.', th: 'ฉันไม่ถ่ายมาหลายวันแล้ว', es: 'Llevo varios días sin poder evacuar.' } },
  { id: 'k4', group: 'back', ko: '목이 아파서 돌리기 힘들어요.', text: { ko: '목이 아파서 돌리기 힘들어요.', en: 'My neck hurts and is hard to turn.', zh: '我脖子疼，转动困难。', ja: '首が痛くて回しにくいです。', vi: 'Cổ tôi đau, khó quay.', th: 'คอฉันปวดจนหันลำบาก', es: 'Me duele el cuello y me cuesta girarlo.' } },
  { id: 'n6', group: 'hand', ko: '팔이 부었어요.', text: { ko: '팔이 부었어요.', en: 'My arm is swollen.', zh: '我的胳膊肿了。', ja: '腕が腫れています。', vi: 'Cánh tay tôi bị sưng.', th: 'แขนฉันบวม', es: 'Tengo el brazo hinchado.' } },
  { id: 'l6', group: 'leg', ko: '걸을 때 다리가 아파요.', text: { ko: '걸을 때 다리가 아파요.', en: 'My leg hurts when I walk.', zh: '我走路时腿疼。', ja: '歩くと足が痛いです。', vi: 'Chân tôi đau khi đi bộ.', th: 'ฉันปวดขาเวลาเดิน', es: 'Me duele la pierna al caminar.' } },
  { id: 'l7', group: 'leg', ko: '발이 부었어요.', text: { ko: '발이 부었어요.', en: 'My foot is swollen.', zh: '我的脚肿了。', ja: '足が腫れています。', vi: 'Bàn chân tôi bị sưng.', th: 'เท้าฉันบวม', es: 'Tengo el pie hinchado.' } },
  { id: 's5', group: 'skin', ko: '온몸이 가려워요.', text: { ko: '온몸이 가려워요.', en: 'My whole body itches.', zh: '我全身痒。', ja: '全身がかゆいです。', vi: 'Toàn thân tôi bị ngứa.', th: 'ฉันคันทั้งตัว', es: 'Me pica todo el cuerpo.' } },
  { id: 'g6', group: 'body', ko: '너무 피곤하고 잠을 못 잤어요.', text: { ko: '너무 피곤하고 잠을 못 잤어요.', en: 'I am very tired and could not sleep.', zh: '我很累，睡不着。', ja: 'とても疲れていて、眠れませんでした。', vi: 'Tôi rất mệt và không ngủ được.', th: 'ฉันเหนื่อยมากและนอนไม่หลับ', es: 'Estoy muy cansado y no pude dormir.' } },
  { id: 'd8', group: 'history', ko: '저는 수술한 적이 있어요.', text: { ko: '저는 수술한 적이 있어요.', en: 'I have had surgery before.', zh: '我做过手术。', ja: '私は手術を受けたことがあります。', vi: 'Tôi đã từng phẫu thuật.', th: 'ฉันเคยผ่าตัดมาก่อน', es: 'Me han operado antes.' } },
  { id: 'd9', group: 'history', ko: '저는 피를 묽게 하는 약을 먹어요.', text: { ko: '저는 피를 묽게 하는 약을 먹어요.', en: 'I take blood-thinning medication.', zh: '我在吃抗凝血（稀释血液）的药。', ja: '私は血液をさらさらにする薬を飲んでいます。', vi: 'Tôi đang dùng thuốc làm loãng máu.', th: 'ฉันกินยาละลายลิ่มเลือด', es: 'Tomo anticoagulantes (medicación para diluir la sangre).' } },
  { id: 'r6', group: 'request', ko: '진통제를 주세요.', text: { ko: '진통제를 주세요.', en: 'Please give me a painkiller.', zh: '请给我止痛药。', ja: '痛み止めをください。', vi: 'Làm ơn cho tôi thuốc giảm đau.', th: 'ขอยาแก้ปวดหน่อย', es: 'Por favor, deme un analgésico.' } },
  { id: 'r7', group: 'request', ko: '잠깐 쉬어야 해요.', text: { ko: '잠깐 쉬어야 해요.', en: 'I need to rest for a moment.', zh: '我需要休息一下。', ja: '少し休まなければなりません。', vi: 'Tôi cần nghỉ một lát.', th: 'ฉันต้องพักสักครู่', es: 'Necesito descansar un momento.' } },
  { id: 'a9', group: 'basic', ko: '이 검사를 꼭 해야 하나요?', text: { ko: '이 검사를 꼭 해야 하나요?', en: 'Do I really need this test?', zh: '这个检查一定要做吗？', ja: 'この検査は必ず必要ですか？', vi: 'Tôi có nhất thiết phải làm xét nghiệm này không?', th: 'จำเป็นต้องตรวจนี้ไหม?', es: '¿De verdad necesito esta prueba?' } },
  { id: 'a10', group: 'basic', ko: '건강보험이 없어요.', text: { ko: '건강보험이 없어요.', en: 'I do not have health insurance.', zh: '我没有医疗保险。', ja: '健康保険がありません。', vi: 'Tôi không có bảo hiểm y tế.', th: 'ฉันไม่มีประกันสุขภาพ', es: 'No tengo seguro médico.' } },
];

// ── 역방향(의료진·관리자 → 환자): 한국어 질문을 고르면 환자 언어 음성/자막 ──
export interface StaffQuestion {
  id: string;
  ko: string;               // 의료진이 보고 고르는 한국어
  text: Record<Lang, string>; // 환자 언어로 출력(음성+자막)
}

export const STAFF_QUESTIONS: StaffQuestion[] = [
  { id: 'q1', ko: '어디가 아파요?', text: { ko: '어디가 아파요?', en: 'Where does it hurt?', zh: '哪里疼？', ja: 'どこが痛いですか？', vi: 'Bạn đau ở đâu?', th: 'เจ็บตรงไหน?', es: '¿Dónde le duele?' } },
  { id: 'q2', ko: '언제부터 아팠어요?', text: { ko: '언제부터 아팠어요?', en: 'When did the pain start?', zh: '什么时候开始疼的？', ja: 'いつから痛いですか？', vi: 'Bạn đau từ khi nào?', th: 'เริ่มเจ็บตั้งแต่เมื่อไหร่?', es: '¿Desde cuándo le duele?' } },
  { id: 'q3', ko: '다친 거예요, 아니면 그냥 아픈 거예요?', text: { ko: '다친 거예요, 아니면 그냥 아픈 거예요?', en: 'Were you injured, or did it just start hurting?', zh: '是受伤了，还是自己疼起来的？', ja: 'けがですか、それとも自然に痛くなりましたか？', vi: 'Bạn bị thương hay tự nhiên đau?', th: 'บาดเจ็บ หรือว่าปวดขึ้นมาเอง?', es: '¿Se lastimó o simplemente empezó a dolerle?' } },
  { id: 'q4', ko: '많이 아파요, 조금 아파요?', text: { ko: '많이 아파요, 조금 아파요?', en: 'Does it hurt a lot or a little?', zh: '很疼还是有点疼？', ja: 'とても痛いですか、少しですか？', vi: 'Đau nhiều hay đau ít?', th: 'เจ็บมากหรือเจ็บนิดหน่อย?', es: '¿Le duele mucho o poco?' } },
  { id: 'q5', ko: '약 알레르기가 있어요?', text: { ko: '약 알레르기가 있어요?', en: 'Do you have any medication allergies?', zh: '您对药物过敏吗？', ja: '薬のアレルギーはありますか？', vi: 'Bạn có bị dị ứng thuốc không?', th: 'คุณแพ้ยาไหม?', es: '¿Tiene alergia a algún medicamento?' } },
  { id: 'q6', ko: '지금 먹는 약이 있어요?', text: { ko: '지금 먹는 약이 있어요?', en: 'Are you taking any medication now?', zh: '您现在在吃什么药吗？', ja: '今飲んでいる薬はありますか？', vi: 'Bạn có đang uống thuốc gì không?', th: 'ตอนนี้กินยาอะไรอยู่ไหม?', es: '¿Está tomando algún medicamento?' } },
  { id: 'q7', ko: '지병이 있어요? (당뇨, 고혈압 등)', text: { ko: '지병이 있어요? (당뇨, 고혈압 등)', en: 'Do you have any chronic illness? (diabetes, high blood pressure, etc.)', zh: '您有慢性病吗？（糖尿病、高血压等）', ja: '持病はありますか？（糖尿病・高血圧など）', vi: 'Bạn có bệnh mãn tính không? (tiểu đường, cao huyết áp...)', th: 'มีโรคประจำตัวไหม? (เบาหวาน ความดัน ฯลฯ)', es: '¿Tiene alguna enfermedad crónica? (diabetes, hipertensión, etc.)' } },
  { id: 'q8', ko: '임신했어요?', text: { ko: '임신했어요?', en: 'Are you pregnant?', zh: '您怀孕了吗？', ja: '妊娠していますか？', vi: 'Bạn có đang mang thai không?', th: 'คุณตั้งครรภ์ไหม?', es: '¿Está embarazada?' } },
  { id: 'q9', ko: '여기가 아파요? (누르면서)', text: { ko: '여기가 아파요? (누르면서)', en: 'Does it hurt here? (while pressing)', zh: '这里疼吗？（按压时）', ja: 'ここが痛いですか？（押しながら）', vi: 'Chỗ này có đau không? (khi ấn vào)', th: 'ตรงนี้เจ็บไหม? (ขณะกด)', es: '¿Le duele aquí? (al presionar)' } },
  { id: 'q10', ko: '숨쉬기 힘들어요?', text: { ko: '숨쉬기 힘들어요?', en: 'Do you have trouble breathing?', zh: '呼吸困难吗？', ja: '息がしにくいですか？', vi: 'Bạn có khó thở không?', th: 'หายใจลำบากไหม?', es: '¿Tiene dificultad para respirar?' } },
  { id: 'q11', ko: '어지러워요?', text: { ko: '어지러워요?', en: 'Do you feel dizzy?', zh: '头晕吗？', ja: 'めまいがしますか？', vi: 'Bạn có bị chóng mặt không?', th: 'เวียนหัวไหม?', es: '¿Se siente mareado?' } },
  { id: 'q12', ko: '곧 의사가 올 거예요. 잠시만 기다리세요.', text: { ko: '곧 의사가 올 거예요. 잠시만 기다리세요.', en: 'The doctor will come soon. Please wait a moment.', zh: '医生马上来，请稍等。', ja: 'まもなく医師が来ます。少しお待ちください。', vi: 'Bác sĩ sẽ đến ngay. Xin chờ một lát.', th: 'เดี๋ยวหมอจะมา รอสักครู่นะ', es: 'El médico vendrá pronto. Espere un momento, por favor.' } },
];
