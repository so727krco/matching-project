const axios = require('axios');
const mysql = require('mysql2/promise');

const dbConfig = { host: 'localhost', user: 'root', password: '9621', database: 'matching_db' };

const firstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
const maleNames = ['민준', '도윤', '시우', '지호', '지훈', '태원', '철수', '동현', '승민', '은우', '주원', '예준', '준서', '하준', '우진', '건우', '선우', '서진', '연우', '정우'];
const femaleNames = ['서연', '서윤', '지우', '하은', '지안', '민지', '수현', '영희', '다은', '시아', '수아', '유진', '지원', '채원', '수민', '은지', '윤아', '나은', '다현', '소이'];
const jobs = ['개발자', '디자이너', '공무원', '의사', '교사', '마케터', '은행원', '사업가', '변호사', '약사', '간호사', '연구원', '기획자', '회계사', '유튜버', '건축가', '요리사', '엔지니어', '승무원', '아나운서'];

// 70가지 취미 리스트
const hobbies = [
    '독서', '국내여행', '해외여행', '영화감상', '넷플릭스 정주행', '요리', '베이킹', '헬스', '크로스핏', '등산', 
    '캠핑', '서핑', '수영', '자전거 라이딩', '러닝', '마라톤', '테니스', '스쿼시', '배드민턴', '골프', 
    '볼링', '당구', '요가', '필라테스', '명상', '사진촬영', '출사', '그림 그리기', '수채화', '드로잉', 
    '캘리그라피', '피아노 연주', '기타 연주', '바이올린 연주', '드럼 연주', '음악감상', 'LP 수집', '콘서트 관람', '뮤지컬 관람', '연극 관람', 
    '전시회 관람', '미술관 투어', '방탈출 게임', '보드게임', 'PC/콘솔 게임', '맛집 탐방', '카페 투어', '와인 테이스팅', '위스키 수집', '커피 핸드드립', 
    '외국어 공부', '영어 회화', '코딩', '주식 투자', '부동산 임장', '재테크', '블로그 운영', '유튜브 시청', '반려동물 산책', '유기견 봉사활동', 
    '십자수', '뜨개질', '레고 조립', '프라모델 조립', '다이어리 꾸미기', '향수 수집', '자동차 드라이브', '가죽공예', '도자기 공예', '클라이밍'
];

// 이상형 1: 외모 / 인상 (20개)
const idealTypes1 = [
    '웃는 모습이 예쁘고', '키가 훤칠하며 듬직하고', '눈빛이 선하고 부드러우며', '단정하고 깔끔한 인상에', '스타일이 세련되고',
    '피부가 맑고 깨끗하며', '첫인상이 밝고 환한', '이목구비가 뚜렷하고', '체격이 탄탄하고 건강해 보이며', '귀엽고 사랑스러운 매력이 있고',
    '옷차림이 센스 있고', '차분하고 우아한 분위기를 풍기며', '운동으로 다져진 몸매를 가졌고', '머릿결이 좋고 자기 관리를 잘하는 듯한', '인상이 호감형이고',
    '눈웃음이 매력적이며', '목소리가 안정감 있고 좋으며', '전체적인 비율이 좋고', '생기 있고 에너지 넘치는 표정의', '풋풋하고 맑은 느낌을 주는'
];

// 이상형 2: 성격 / 가치관 (20개)
const idealTypes2 = [
    '배려심이 깊고 다정한 성격을 가졌으며,', '자기 주관이 뚜렷하고 결단력이 있으며,', '유머 감각이 뛰어나 함께 있으면 즐겁고,', '작은 일에도 감사할 줄 아는 긍정적인 성격이며,', '책임감이 강해 믿고 의지할 수 있으며,',
    '어른을 공경하고 예의가 바르며,', '감정 기복이 적고 평온한 성품을 가졌으며,', '지적이면서도 겸손함을 잃지 않고,', '대화할 때 경청을 잘 해주고 공감 능력이 뛰어나며,', '솔직하고 거짓 없이 감정을 표현하며,',
    '자기계발을 게을리하지 않는 성실함이 있고,', '타인의 단점보다는 장점을 먼저 봐주는 따뜻함이 있으며,', '결단력 있게 리드해 줄 수 있는 든든함이 있고,', '화를 내기보다는 대화로 현명하게 풀어나갈 줄 알며,', '새로운 도전을 즐기고 진취적인 성향을 가졌으며,',
    '사소한 배려가 몸에 배어 있고 눈치가 빠르며,', '자신감 넘치면서도 남을 무시하지 않고,', '호기심이 많고 열정적으로 살아가는 마인드를 가졌으며,', '어떤 상황에서도 여유를 잃지 않는 단단함이 있고,', '가족을 최우선으로 생각하는 헌신적인 마음이 있으며,'
];

// 이상형 3: 라이프스타일 / 원하는 관계 (20개)
const idealTypes3 = [
    '휴일에는 함께 예쁜 카페나 맛집 투어를 다닐 수 있는 사람을 찾습니다.', '서로의 개인 시간을 존중하며 각자의 워라밸을 지켜주는 분을 원합니다.', '퇴근 후 같이 가볍게 산책하거나 운동을 즐길 수 있는 분이면 좋겠습니다.', '경제 관념이 확실하여 미래를 함께 탄탄하게 준비할 수 있는 사람을 희망합니다.', '자연을 좋아해 주말마다 근교로 캠핑이나 드라이브를 떠날 수 있는 분이 좋습니다.',
    '취미 생활이 비슷해 대화가 끊이지 않는 편안한 친구 같은 연인을 찾습니다.', '연락을 중요하게 생각하여 자주 소통하고 애정 표현을 아끼지 않는 분을 원합니다.', '동물을 사랑하고 함께 반려동물을 키우는 데 거부감이 없는 따뜻한 분을 찾습니다.', '가정적인 성향으로 결혼 후 아이들과 화목한 가정을 꾸리길 원하는 사람을 희망합니다.', '자기 직업에 자부심을 가지고 일하는 모습이 존경스러운 분을 만나고 싶습니다.',
    '술이나 담배를 즐기지 않고 건전한 여가 생활을 보내는 분을 선호합니다.', '비슷한 종교관을 가지고 있어 함께 신앙 생활을 할 수 있는 분이면 좋겠습니다.', '평범하고 소소한 일상 속에서도 소확행을 찾아 함께 웃을 수 있는 사람을 찾습니다.', '음악이나 예술 코드가 맞아 같이 전시회나 공연을 즐길 수 있는 분을 원합니다.', '서로에게 긍정적인 자극을 주며 함께 성장해 나갈 수 있는 파트너를 찾습니다.',
    '요리하는 것을 즐겨서 함께 장을 보고 밥을 해 먹는 소박한 데이트를 할 수 있는 분이 좋습니다.', '가끔은 분위기 있는 곳에서 와인 한 잔하며 진지한 대화를 나눌 수 있는 분을 희망합니다.', '계획적이고 꼼꼼한 제 성격을 잘 보완해 줄 수 있는 분을 찾고 있습니다.', '장거리 연애도 극복할 수 있을 만큼 믿음을 주는 확고한 분을 원합니다.', '결혼에 대한 가치관이 일치하여 빠른 시일 내에 미래를 약속할 수 있는 분을 찾습니다.'
];

const intros1 = [
    '안녕하세요. 저는 매사에 긍정적이고 밝은 에너지를 가진 사람입니다.', '반갑습니다! 저는 조용하고 차분한 성격으로 상대방의 이야기를 잘 들어주는 편입니다.', '안녕하세요, 저는 호기심이 많고 새로운 도전을 두려워하지 않는 활동적인 성향입니다.', '안정적이고 평온한 일상을 중요하게 생각하는 사람입니다.', '안녕하세요! 저는 주변 사람들을 챙기는 것을 좋아하고 다정다감한 성격입니다.',
    '논리적이고 이성적인 편이지만, 내 사람에게는 한없이 따뜻한 사람입니다.', '매우 외향적이며 처음 만나는 사람과도 금방 친해지는 친화력을 가지고 있습니다.', '감수성이 풍부하고 작은 것에도 감사할 줄 아는 성격입니다.', '원리원칙을 중요하게 생각하며, 책임감이 강해 맡은 바를 끝까지 해냅니다.', '안녕하세요. 유머 감각이 있어 주변에 늘 웃음이 끊이지 않게 만드는 사람입니다.'
];
const intros2 = [
    '현재 직장에서는 어느 정도 자리를 잡았고, 일에 대한 자부심을 가지고 있습니다.', '워라밸을 매우 중요하게 생각해서 퇴근 후에는 온전히 개인 시간을 즐기는 편입니다.', '일에 열정이 많아 때로는 바쁘게 지내지만, 사랑하는 사람과의 시간은 꼭 챙기려고 합니다.', '전문직에 종사하고 있어 경제적으로는 꽤 안정적인 기반을 다져두었습니다.', '스타트업에서 일하며 매일매일 성장하는 것을 즐기고 있습니다.',
    '안정적인 직장에서 근무 중이며, 정시 퇴근 후 취미 생활을 즐기는 평범한 직장인입니다.', '프리랜서로 일하고 있어서 시간 활용이 비교적 자유로운 편입니다.', '최근 승진을 해서 바쁘지만, 이제는 제 짝을 찾는데 집중하고 싶습니다.', '사업을 운영하고 있어 책임감이 막중하지만, 그만큼 보람도 크게 느끼고 있습니다.', '직업 특성상 출장이 잦지만, 주말만큼은 가족과 함께 보내는 것을 최우선으로 여깁니다.'
];
const intros3 = [
    '주말에는 집에 있는 것보다 밖으로 나가 드라이브나 캠핑을 즐기는 것을 좋아합니다.', '전형적인 집돌이/집순이 성향이라 주말에는 집에서 넷플릭스를 보며 쉬는 것이 힐링입니다.', '운동을 매우 좋아해서 매일 퇴근 후 크로스핏이나 러닝을 꼭 합니다.', '맛집 탐방을 즐겨서 유명한 식당은 꼭 가봐야 직성이 풀리는 성격입니다.', '예술에 관심이 많아 틈틈이 미술 전시회나 오케스트라 공연을 보러 다닙니다.',
    '요리하는 것을 좋아해서 주말에는 종종 새로운 레시피로 지인들을 초대하곤 합니다.', '여행을 좋아해서 일 년에 한두 번은 꼭 해외여행을 가려고 노력합니다.', '반려동물을 키우고 있어서 산책 겸 공원에 나가는 것이 일상입니다.', '자기계발에 관심이 많아 퇴근 후에는 어학 공부나 새로운 자격증 공부를 합니다.', '음악 듣는 것을 좋아해서 LP를 수집하거나 인디 밴드 공연을 보러 가는 것을 즐깁니다.'
];
const intros4 = [
    '저와 가치관이 비슷하고 대화가 잘 통하는 분을 만나고 싶습니다.', '서로의 다름을 인정하고 배려하며 예쁜 만남을 이어나갈 분을 찾고 있습니다.', '활동적인 취미를 함께 공유하며 주말마다 즐거운 데이트를 할 수 있었으면 좋겠습니다.', '저를 리드해 줄 수 있는 결단력 있고 듬직한 분과 매칭되고 싶습니다.', '거짓 없고 솔직하게 감정을 표현해 주는 맑은 분을 만나고 싶네요.',
    '무엇보다 연락을 중요하게 생각해서 자주 소통하고 애정을 표현해 주는 분이 좋습니다.', '자기 일을 사랑하고 배울 점이 있는 존경스러운 분을 만나고 싶습니다.', '소소한 일상에서도 함께 웃을 수 있는 편안한 친구 같은 연인을 찾습니다.', '갈등이 생겼을 때 회피하지 않고 대화로 현명하게 풀어나갈 수 있는 성숙한 분을 원합니다.', '이제는 정착해서 화목한 가정을 꾸리고 싶어, 결혼을 진지하게 생각하시는 분과 만나고 싶습니다.'
];

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 랜덤으로 2~7개의 고유한 취미를 선택하여 문자열로 반환
function getRandomHobbies() {
    const numHobbies = Math.floor(Math.random() * 6) + 2; // 2 ~ 7
    let selected = new Set();
    while (selected.size < numHobbies) {
        selected.add(getRandomItem(hobbies));
    }
    return Array.from(selected).join(', ');
}

function generateRandomPhone() { return `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`; }
function generateRandomKakao() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
}
function getRandomManagerId() { return Math.floor(Math.random() * (101 - 82 + 1)) + 82; }

async function runBatch() {
    console.log("=== 기존 데이터 초기화 시작 ===");
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE member_trait');
        await connection.execute('TRUNCATE TABLE matching_history');
        await connection.execute('TRUNCATE TABLE approval_request');
        await connection.execute('TRUNCATE TABLE member');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        await connection.end();
        console.log("기존 회원 및 AI 성향 데이터 삭제 완료");
    } catch (e) {
        console.error("DB 초기화 실패:", e.message); return;
    }

    console.log("\n=== 회원 3000명 생성 시작 ===");
    
    for (let i = 1; i <= 3000; i++) {
        const gender = Math.random() > 0.5 ? 'M' : 'F';
        const name = getRandomItem(firstNames) + (gender === 'M' ? getRandomItem(maleNames) : getRandomItem(femaleNames));
        const fullIntro = getRandomItem(intros1) + " " + getRandomItem(intros2) + " " + getRandomItem(intros3) + " " + getRandomItem(intros4);
        const fullIdealType = getRandomItem(idealTypes1) + " " + getRandomItem(idealTypes2) + " " + getRandomItem(idealTypes3);
        const selectedHobbies = getRandomHobbies();

        let phone = null;
        let kakao = null;
        const contactType = Math.random();
        if (contactType < 0.33) phone = generateRandomPhone();
        else if (contactType < 0.66) kakao = generateRandomKakao();
        else { phone = generateRandomPhone(); kakao = generateRandomKakao(); }

        const salaryList = [3000, 3100, 3200, 3300, 3500, 3600, 3700, 3800, 4000, 4100, 4200, 4300, 4400, 4500, 4700, 4800, 4900, 4950, 5000, 5500, 6000, 7000, 8000, 10000, 12000];
        const salary = salaryList[Math.floor(Math.random() * salaryList.length)];

        const memberData = {
            name: name, gender: gender, age: Math.floor(25 + Math.random() * 15), height: Math.floor(150 + Math.random() * 40),
            job: getRandomItem(jobs), salary: salary, phoneNumber: phone, kakaoId: kakao,
            hobbies: selectedHobbies,
            idealType: fullIdealType, introduction: fullIntro, remarks: "배치 스크립트로 생성된 회원", managerId: getRandomManagerId()
        };

        try {
            const response = await axios.post('http://localhost:8080/api/members', memberData);
            console.log(`[${i}/3000] 회원 생성 완료: ${memberData.name} (취미: ${selectedHobbies})`);
        } catch (error) {
            console.error(`[${i}/3000] 회원 생성 실패:`, error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 429) {
                console.log("API 한도 초과(429). 30초 대기 후 재개합니다...");
                await new Promise(resolve => setTimeout(resolve, 30000));
                // 한 번 더 시도 (간단한 재시도 로직)
                i--; // 실패한 회원부터 다시 시도하기 위해 인덱스 차감
            }
        }
    }
    console.log("=== 모든 회원 생성 완료 ===");
}
runBatch();
