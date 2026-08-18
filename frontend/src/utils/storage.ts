export interface Member {
  id: number;
  name: string;
  gender: string;
  age: number;
  job: string;
  income: number;
  hobby: string;
  idealType: string;
  intro: string;
  humanCaution?: string;
  aiAnalysis?: string;
  managerName?: string;
  manager?: { id: number; name: string };
  phone?: string;
  kakaoId?: string;
  photos?: string[]; // Array of base64 strings or URLs
}

export interface MatchMember extends Member {
  approvalStatus?: 'approved' | 'pending';
  paymentStatus?: 'UNPAID' | 'PAID';
}

export interface Match {
  id: number;
  title: string;
  date: string;
  themes?: string[];
  members: MatchMember[];
  managerName?: string;
}

export interface Couple {
  id: number;
  member1: Member;
  member2: Member;
  date: string;
}

const MOCK_MEMBERS: Member[] = [
  { id: 101, name: '김철수', gender: '남성', age: 30, job: '개발자', income: 6000, hobby: '코딩, 게임', idealType: '이해심 많은 사람', intro: '안녕하세요. 백엔드 개발자입니다.', humanCaution: '연락 빈도에 민감함.', aiAnalysis: '조용하고 내향적인 성향으로 보이나 관심 분야(IT, 게임)에 대한 대화 시 매우 적극적임. 공감대를 형성할 수 있는 대화 주제 추천.', managerName: '매니저A' },
  { id: 102, name: '이영희', gender: '여성', age: 30, job: '디자이너', income: 5500, hobby: '미술관 관람', idealType: '대화가 잘 통하는 사람', intro: '시각 디자인을 전공했습니다.', humanCaution: '주말 데이트를 선호함.', aiAnalysis: '미적 감각이 뛰어나며 감성적인 소통을 중시함. 첫 만남 시 분위기 좋은 카페나 전시회 등 시각적으로 만족감을 줄 수 있는 장소 권장.', managerName: '매니저A' },
  { id: 103, name: '박지민', gender: '여성', age: 28, job: '마케터', income: 4500, hobby: '독서, 글쓰기', idealType: '차분한 사람', intro: '책 읽는 것을 좋아합니다.', humanCaution: '술, 담배 안 하는 사람 선호.', aiAnalysis: '논리적이고 차분한 성향. 무례하거나 지나치게 감정적인 태도를 경계함. 진중한 태도로 접근하는 것이 좋음.', managerName: '매니저B' },
  { id: 104, name: '최동훈', gender: '남성', age: 32, job: '기획자', income: 6500, hobby: '자전거 타기', idealType: '활동적인 사람', intro: '주말마다 라이딩을 즐깁니다.', humanCaution: '운동 싫어하는 사람은 피할 것.', aiAnalysis: '에너지가 넘치고 외향적임. 액티비티나 야외 활동 위주의 데이트를 기획하는 것이 매칭 확률을 높일 수 있음.', managerName: '매니저A' },
  { id: 105, name: '정우성', gender: '남성', age: 35, job: '변호사', income: 12000, hobby: '골프', idealType: '지적인 사람', intro: '성실하고 책임감 있는 사람입니다.', humanCaution: '약속 시간 엄수.', aiAnalysis: '바쁜 일정 탓에 효율적인 만남을 선호함. 지적인 대화와 서로의 전문성을 존중하는 태도가 필요함.', managerName: '매니저B' },
  { id: 106, name: '김태희', gender: '여성', age: 33, job: '의사', income: 11000, hobby: '요가', idealType: '다정한 사람', intro: '안녕하세요. 반갑습니다.', humanCaution: '교대근무로 인해 주말이 유동적일 수 있음.', aiAnalysis: '스트레스가 많은 직업이므로 다정하고 세심한 배려에 큰 매력을 느낌. 유연한 스케줄 조율이 관건임.', managerName: '매니저B' },
  { id: 107, name: '이민호', gender: '남성', age: 29, job: '프리랜서', income: 4000, hobby: '영화 감상', idealType: '유머 감각이 있는 사람', intro: '자유로운 영혼입니다.', humanCaution: '수입 편차에 대한 이해 필요.', aiAnalysis: '자유로운 라이프스타일을 추구하며 얽매이는 것을 싫어함. 가벼운 유머와 편안한 분위기로 리드할 필요가 있음.', managerName: '매니저A' },
  { id: 108, name: '송혜교', gender: '여성', age: 31, job: '사업가', income: 9000, hobby: '여행', idealType: '리더십 있는 사람', intro: '새로운 도전을 좋아합니다.', humanCaution: '해외 출장이 잦음.', aiAnalysis: '목표 지향적이고 독립심이 강함. 상대방 역시 자기 주도적인 삶을 살고 있는 리더십 있는 성향일 때 좋은 시너지가 예상됨.', managerName: '매니저B' },
];

const MOCK_MATCHES: Match[] = [
  {
    id: 1,
    title: '동갑내기 직장인 매칭',
    date: '2026-08-15',
    themes: ['동갑내기', '직장인', '소개팅'],
    managerName: '매니저A',
    members: [
      { ...MOCK_MEMBERS[0], approvalStatus: 'approved' },
      { ...MOCK_MEMBERS[1], approvalStatus: 'approved' },
    ]
  },
  {
    id: 2,
    title: '독서 모임 기반 매칭',
    date: '2026-08-14',
    themes: ['독서', '조용한', '자기계발'],
    managerName: '매니저B',
    members: [
      { ...MOCK_MEMBERS[2], approvalStatus: 'approved' },
      { ...MOCK_MEMBERS[3], approvalStatus: 'pending' }, // 매니저A의 회원이 매니저B 매칭에 들어감
    ]
  }
];

export const getCurrentUser = () => {
  return '매니저A';
};

export const getMembers = (): Member[] => {
  const data = localStorage.getItem('members_v2');
  if (data) return JSON.parse(data);
  localStorage.setItem('members_v2', JSON.stringify(MOCK_MEMBERS));
  return MOCK_MEMBERS;
};

export const setMembers = (members: Member[]) => {
  localStorage.setItem('members_v2', JSON.stringify(members));
};

export const getMatches = (): Match[] => {
  const data = localStorage.getItem('matches_v2');
  if (data) return JSON.parse(data);
  localStorage.setItem('matches_v2', JSON.stringify(MOCK_MATCHES));
  return MOCK_MATCHES;
};

export const setMatches = (matches: Match[]) => {
  localStorage.setItem('matches_v2', JSON.stringify(matches));
};

export const getCouples = (): Couple[] => {
  const data = localStorage.getItem('couples_v2');
  if (data) return JSON.parse(data);
  return [];
};

export const setCouples = (couples: Couple[]) => {
  localStorage.setItem('couples_v2', JSON.stringify(couples));
};

export type ApprovalType = 'INFO_VIEW' | 'MATCH_INVITE' | 'TRANSFER';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: number;
  type: ApprovalType;
  requesterName: string;
  targetManagerName: string;
  targetMemberId: number;
  matchId?: number;
  status: ApprovalStatus;
  requestDate: string;
}

const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 1, type: 'INFO_VIEW', requesterName: '매니저B', targetManagerName: '매니저A', targetMemberId: 101, status: 'pending', requestDate: '2026-08-15' },
  { id: 2, type: 'MATCH_INVITE', requesterName: '매니저A', targetManagerName: '매니저B', targetMemberId: 103, matchId: 2, status: 'pending', requestDate: '2026-08-15' }
];

export const getApprovalRequests = (): ApprovalRequest[] => {
  const data = localStorage.getItem('approvals_v2');
  if (data) return JSON.parse(data);
  localStorage.setItem('approvals_v2', JSON.stringify(MOCK_APPROVALS));
  return MOCK_APPROVALS;
};

export const setApprovalRequests = (reqs: ApprovalRequest[]) => {
  localStorage.setItem('approvals_v2', JSON.stringify(reqs));
};
