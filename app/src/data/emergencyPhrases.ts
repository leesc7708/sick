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
];
