package com.matching.backapp.controller;

import com.matching.backmgr.entity.Manager;
import com.matching.backmgr.entity.Member;
import com.matching.backmgr.repository.ManagerRepository;
import com.matching.backmgr.repository.MemberRepository;
import com.matching.backmgr.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.matching.backmgr.repository.MatchingTraitReferenceRepository;
import com.matching.backmgr.repository.MemberTraitRepository;
import com.matching.backmgr.entity.MatchingTraitReference;
import com.matching.backmgr.entity.MemberTrait;
import java.util.Map;
import java.util.HashMap;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/dummy")
@RequiredArgsConstructor
public class DummyDataController {

    private final MatchingTraitReferenceRepository traitRefRepository;
    private final MemberTraitRepository memberTraitRepository;

    private final ManagerRepository managerRepository;
    private final com.matching.backmgr.repository.ApprovalRequestRepository approvalRequestRepository;
    private final MemberRepository memberRepository;

    private static final String[] LAST_NAMES = {"김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "전", "홍", "고", "문", "양", "손", "배", "조", "백", "허", "유", "남", "심", "노", "정", "하", "곽", "성", "차", "주", "우", "구", "신", "임", "나", "전", "민", "유", "진", "지", "엄", "채", "원", "천", "방", "공", "강", "현", "함", "변", "염", "양", "변", "여", "추", "노", "도", "소", "신", "석", "선", "설", "마", "길", "주", "연", "방", "위", "표", "명", "기", "반", "왕", "금", "옥", "육", "인", "맹", "제", "모", "장", "남", "탁", "국", "여", "진", "어", "은", "편", "구", "용"};
    private static final String[] FIRST_NAMES_M = {"민준", "서준", "도윤", "예준", "시우", "하준", "지호", "주원", "건우", "선우", "유준", "연우", "은우", "현우", "수현", "준우", "승우", "정우", "우진", "시윤", "이준", "지훈", "동현", "성민", "민성", "재윤", "재현", "승현", "진우", "민수", "태윤", "태민", "민석", "윤호", "승민", "재민", "시현", "준서", "태현", "지환", "민재", "지성", "은호", "시훈", "준형", "우석", "동주", "민기", "승기", "태경"};
    private static final String[] FIRST_NAMES_F = {"서윤", "서연", "지우", "서현", "하은", "지유", "민서", "하윤", "지민", "은서", "채원", "수아", "유진", "다은", "예은", "윤서", "수민", "지안", "소율", "예진", "채윤", "다인", "연주", "소은", "연서", "윤아", "지현", "수진", "민지", "예린", "지윤", "아인", "하율", "서진", "유빈", "민아", "시은", "가은", "유나", "지수", "채은", "현서", "예지", "은채", "은지", "수연", "시아", "아윤", "보름", "아영"};
    private static final String[] JOBS = {"의사", "변호사", "개발자", "디자이너", "교사", "공무원", "사업가", "회사원", "프리랜서", "건축가", "약사", "회계사", "마케터", "기획자", "강사", "은행원", "경찰", "소방관", "간호사", "승무원"};
    private static final String[] HOBBIES = {"독서", "영화감상", "요리", "운동", "여행", "게임", "음악감상", "사진", "등산", "캠핑", "자전거", "수영", "테니스", "골프", "피아노", "미술", "맛집탐방", "트렌드/핫플민감한", "전시회관람", "콘서트", "넷플릭스"};

    private static final String[] INTRO_GREETINGS = {
        "안녕하세요! 반가워요. 저는 평소에 긍정적이고 밝은 성격을 가지고 있어서 주변 사람들과 잘 어울리는 편입니다. ",
        "반갑습니다! 저는 상대방의 이야기를 잘 들어주고 배려하는 것을 중요하게 생각하는 사람입니다. ",
        "안녕하세요~ 저는 항상 새로운 것을 배우고 경험하는 것을 좋아하는 활동적인 성격입니다. ",
        "만나서 반갑습니다. 저는 차분하고 다정다감한 성격으로, 진중하고 깊은 대화를 나누는 것을 좋아합니다. ",
        "안녕하세요! 저는 매사에 열정적이고 호기심이 많아 다양한 경험을 즐기는 사람입니다. ",
        "반갑습니다! 평소에 웃음이 많고 사소한 일에도 감사함을 잘 느끼는 긍정적인 성격이에요. ",
        "안녕하세요. 저는 낯을 조금 가리지만 친해지면 장난도 잘 치고 의리 있는 스타일입니다. ",
        "반가워요! 저는 목표한 바는 꼭 이루고자 하는 끈기 있고 성실한 성격을 가졌습니다. ",
        "안녕하세요~ 언제나 여유를 잃지 않고 긍정적으로 생각하려고 노력하는 편이에요. ",
        "반갑습니다! 감수성이 풍부하고 공감 능력이 뛰어나서 다른 사람의 마음을 잘 헤아립니다. ",
        "안녕하세요! 저는 에너지가 넘치고 사람들을 만나는 것을 좋아해서 모임에서 주로 분위기 메이커 역할을 합니다. ",
        "반갑습니다. 조용하고 차분하지만, 제 주관이 뚜렷하고 내면이 단단한 사람입니다. ",
        "안녕하세요! 항상 유머를 잃지 않고 주변 사람들을 즐겁게 해주는 것을 좋아하는 성격이에요. ",
        "반가워요! 저는 꼼꼼하고 계획적인 성격이라 여행을 가거나 일을 할 때 철저하게 준비하는 편입니다. ",
        "안녕하세요~ 누구에게나 친절하고 다정하게 대하려고 노력하는 따뜻한 마음을 가진 사람입니다. ",
        "반갑습니다! 저는 호기심이 많아 낯선 곳에 가는 것을 두려워하지 않고 모험을 즐기는 편이에요. ",
        "안녕하세요. 감정 표현에 솔직하고 거짓 없이 진정성 있게 사람을 대하는 것을 중요하게 생각합니다. ",
        "반가워요! 둥글둥글한 성격이라 남들과 갈등을 만들기보다는 대화로 잘 풀어나가는 편이에요. ",
        "안녕하세요! 독립심이 강하고 혼자만의 시간도 잘 즐기지만, 좋은 사람과 함께할 때 더 큰 행복을 느낍니다. ",
        "반갑습니다. 저는 예술적인 감각이 있고 감각적인 것들을 좋아해서 예쁜 장소를 찾아다니는 것을 즐깁니다. "
    };

    private static final String[] INTRO_HOBBIES = {
        "평소 여가 시간이나 주말에는 주로 예쁜 카페를 찾아다니며 커피를 마시거나, 한적한 공원에서 산책하는 것을 정말 좋아해요. 가끔은 집에서 조용히 넷플릭스를 보면서 힐링하는 시간도 즐깁니다. 그리고 요리하는 것도 좋아해서 주말에는 가끔 맛있는 음식을 직접 만들어 먹기도 해요. ",
        "저는 운동을 아주 좋아해서 일주일에 세 번 정도는 헬스장에서 땀을 흘리거나 친구들과 배드민턴, 테니스를 치며 시간을 보냅니다. 땀을 흠뻑 흘리고 나면 스트레스가 싹 풀리더라고요! 날씨가 좋은 주말에는 근교로 드라이브를 가거나 등산을 가며 자연 속에서 재충전하는 것을 선호해요. ",
        "주로 책을 읽거나 음악을 들으며 차분한 시간을 보내는 것을 즐깁니다. 전시회나 미술관에 가서 문화생활을 하는 것도 정말 좋아해서 한 달에 한두 번은 꼭 다녀오려고 해요. 또 맛집 탐방도 좋아해서, SNS에서 핫한 식당을 찾아 맛있는 것을 먹으며 소소한 행복을 느낍니다. ",
        "새로운 곳으로 여행을 떠나는 것을 가장 좋아합니다! 낯선 곳에서 새로운 문화를 접하고 다양한 사람들을 만나는 것이 제 삶의 활력소예요. 평일 퇴근 후에는 주로 자전거를 타거나 수영을 하며 체력을 다지고, 주말에는 가까운 곳이라도 훌쩍 떠나는 편입니다. ",
        "저는 음악과 예술을 사랑하는 편이라서 혼자서 피아노를 치거나 기타를 치며 시간을 보내기도 하고, 가끔 원데이 클래스를 들으며 가죽공예나 도자기 같은 새로운 취미를 배우는 것을 즐겨요. 집을 예쁘게 꾸미고 그 안에서 여유로운 시간을 보내는 것도 좋아합니다. ",
        "주말에는 주로 반려동물과 함께 애견 카페를 가거나 강아지와 산책을 하며 시간을 보냅니다. 동물을 워낙 좋아해서 주말에 유기견 봉사활동을 가기도 해요. 평일 저녁에는 홈트레이닝을 하며 건강을 챙기고 있습니다. ",
        "요리에 관심이 많아서 새로운 레시피를 찾아 요리하고 플레이팅해서 사진 찍는 것을 좋아해요. 친구들을 집에 초대해 직접 만든 음식을 대접하는 것에 큰 기쁨을 느낍니다. 또 베이킹 클래스에 가서 예쁜 디저트를 만드는 것도 즐깁니다. ",
        "캠핑의 매력에 푹 빠져서 주말이면 차에 짐을 싣고 자연으로 떠나곤 합니다. 텐트를 치고 불멍을 하며 시원한 맥주 한 잔을 마실 때가 가장 행복해요. 활동적인 아웃도어 활동을 좋아해서 서핑이나 웨이크보드도 가끔 즐깁니다. ",
        "사진 찍는 것을 좋아해서 필름 카메라를 들고 출사를 자주 나갑니다. 풍경 사진이나 예쁜 카페 사진을 찍는 것을 좋아하고, 최근에는 동영상 편집도 배우기 시작했어요. 아름다운 순간을 기록하는 것을 무척 좋아합니다. ",
        "저는 전국 곳곳에 유명한 디저트 카페를 찾아다니는 것이 제 소소한 즐거움이에요. 커피와 달콤한 빵을 먹으며 다이어리에 일기를 쓰는 시간이 저만의 힐링 타임입니다. ",
        "집에서 식물 키우는 것을 좋아해서 베란다를 작은 정원으로 꾸며놓았어요. 식물이 자라는 모습을 보면 마음이 평온해집니다. 가끔은 가구 배치나 인테리어를 바꾸면서 기분 전환을 하기도 하고, 집에서 빔프로젝터로 영화를 보는 것을 즐겨요. ",
        "자전거 타기를 좋아해서 주말마다 한강을 따라 길게 라이딩을 다녀옵니다. 바람을 맞으며 달리면 복잡했던 머릿속이 맑아지는 기분이에요. 겨울에는 스노보드를 즐겨 타며 계절마다 다양한 스포츠를 즐기는 편입니다. ",
        "외국어 공부하는 것을 좋아해서 퇴근 후에는 랭귀지 익스체인지 모임이나 스터디에 참여하곤 합니다. 다양한 나라의 사람들과 소통하는 것을 좋아하고, 혼자 공부하는 시간도 즐겨요. ",
        "재테크와 경제 뉴스에 관심이 많아서 평소에 경제 신문을 읽거나 관련 채널을 자주 봅니다. 주말에는 부동산 임장을 다니거나 스터디 모임에 참석하며 건설적인 미래를 준비하는 것에 보람을 느낍니다. ",
        "뮤지컬이나 연극 보는 것을 너무 좋아해서 대학로나 대극장에 자주 출몰합니다. 좋아하는 배우가 나오는 공연은 여러 번 반복해서 볼 정도로 열정적이에요. 감동적인 공연을 보고 나면 삶의 에너지가 충전되는 느낌을 받습니다. ",
        "손으로 무언가 만드는 것을 좋아해서 레고 조립이나 프라모델, 명화 그리기 같은 것을 자주 합니다. 하나에 집중해서 무언가를 완성했을 때의 성취감이 정말 좋아요. 아날로그 취미를 깊이 즐깁니다. ",
        "와인을 즐겨 마셔서 와인 클래스를 듣거나 시음회에 가는 것을 좋아합니다. 좋은 사람들과 와인 한 잔을 기울이며 깊은 대화를 나누는 시간이 참 소중해요. 어울리는 치즈나 안주를 직접 준비하는 것도 좋아합니다. ",
        "볼링이나 당구, 스크린 골프 등 실내 스포츠를 즐기는 편입니다. 친구들과 팀을 짜서 내기하는 것도 좋아하고, 실력이 조금씩 늘어가는 재미를 느끼고 있어요. 동호회 활동도 활발하게 하며 사람들과 어울리는 것을 좋아합니다. ",
        "평소에는 명상이나 요가를 하며 차분하게 심신을 단련하고 있습니다. 몸과 마음의 균형을 중요하게 생각해서 담백한 식단을 선호해요. 다도에도 관심이 있어 조용히 차를 마시는 시간을 사랑합니다. ",
        "프로야구나 축구 등 스포츠 경기 관람하는 것을 아주 좋아합니다. 응원하는 팀의 경기가 있는 날이면 직관을 가거나 펍에 모여 응원하며 스트레스를 풀어요. 에너제틱한 분위기를 무척 즐깁니다. "
    };

    private static final String[] INTRO_IDEAL_TYPES = {
        "제가 가장 중요하게 생각하는 건 '가치관'과 '대화의 티키타카'입니다. 외모보다는 대화가 잘 통하고 서로를 존중해 줄 수 있는 사람이 제 이상형이에요. 저와 비슷한 취미를 공유하며 주말에 소소한 데이트를 함께 즐길 수 있는 다정하고 따뜻한 분을 만나고 싶습니다. 서로에게 좋은 에너지를 주고받을 수 있으면 좋겠어요!",
        "저는 자신의 일에 열정을 가지고 열심히 사는 사람에게 큰 매력을 느낍니다. 자기 관리를 잘하고 배울 점이 많은 분이라면 좋겠어요. 또한, 긍정적이고 유머 감각이 있어서 함께 있을 때 많이 웃을 수 있는 분을 찾고 있습니다. 사소한 것에도 감사할 줄 알고 예의 바른 분이라면 더할 나위 없이 좋을 것 같습니다.",
        "외적인 부분보다는 내면이 단단하고 듬직한 사람에게 끌립니다. 감정 기복이 크지 않고, 서로 다툼이 생겼을 때 현명하고 부드럽게 대화로 풀어나갈 수 있는 성숙한 분을 선호해요. 맛있는 것을 먹을 때나 예쁜 풍경을 볼 때 가장 먼저 생각나는, 편안한 친구 같으면서도 설렘을 줄 수 있는 연인을 만나 예쁜 사랑을 키워가고 싶습니다.",
        "저를 있는 그대로 사랑해 주고 아껴주는 다정한 사람을 만나고 싶습니다. 화려한 데이트보다는 퇴근 후 동네에서 가볍게 맥주 한잔을 기울이거나, 주말에 편안한 차림으로 한강을 산책하는 등 소박한 일상 속에서 행복을 함께 나눌 수 있는 분이었으면 좋겠어요. 긍정적인 에너지를 가지신 분을 기다립니다.",
        "저는 책임감이 강하고 가정적인 사람에게 호감을 느낍니다. 서로의 단점을 보듬어주고 함께 성장해 나갈 수 있는 든든한 버팀목 같은 사람을 찾고 있어요. 함께 있을 때 가장 나다워질 수 있는 편안한 분과 예쁜 인연을 만들어가고 싶습니다. 앞으로 즐거운 일상을 함께 나누고 싶어요!",
        "저는 연락을 잘해주고 애정 표현을 솔직하게 해주는 사람을 좋아합니다. 서로 밀당하기보다는 듬뿍 사랑을 주고받을 수 있는 분이었으면 좋겠어요. 맑은 미소를 가졌고 저와 유머 코드가 잘 맞는 밝은 분과 함께라면 하루하루가 행복할 것 같습니다.",
        "활동적인 데이트를 좋아해서 저와 함께 캠핑이나 여행을 즐겁게 다닐 수 있는 에너제틱한 분을 만나고 싶습니다. 계획적이지 않더라도 즉흥적으로 떠나는 것을 즐기고, 긍정적으로 대처할 수 있는 마음을 가진 분이면 좋겠습니다.",
        "서로의 개인 시간과 사생활을 존중해 줄 수 있는 분을 선호합니다. 너무 구속하기보다는 각자의 삶에 충실하면서도 만났을 때는 온전히 서로에게 집중할 수 있는 건강한 연애를 지향해요. 어른스럽고 배려심 넘치는 분을 찾습니다.",
        "동물을 사랑하고 따뜻한 마음씨를 가진 분이 제 이상형입니다. 길가에 피어난 작은 꽃이나 귀여운 동물을 보며 함께 미소 지을 수 있는 순수한 분이면 좋겠어요. 정이 많고 주변 사람들을 잘 챙기는 다정다감한 성격이라면 더 좋겠습니다.",
        "저는 배려가 몸에 밴 예의 바른 사람에게 호감을 느낍니다. 타인을 대하는 태도에서 그 사람의 인성이 보인다고 생각해요. 올바른 가치관을 가지고 있고, 약속을 꼭 지키려고 노력하는 신뢰할 수 있는 분을 만나고 싶습니다.",
        "함께 맛있는 것을 먹으러 다니는 것을 좋아해서 맛집 탐방 코드가 잘 맞는 분을 찾고 있습니다. 입맛이 비슷하고, 맛있는 음식을 먹을 때 진심으로 행복해하는 리액션이 좋은 분이면 좋겠어요. 즐거운 데이트를 함께하고 싶습니다.",
        "저는 대화의 결이 맞는 사람을 중요하게 생각합니다. 단순히 말이 많은 것보다는, 깊이 있는 대화를 나눌 수 있고 서로의 생각을 존중하며 들어줄 수 있는 분을 원해요. 세상에 호기심이 많은 분이라면 정말 반가울 것 같습니다.",
        "경제 관념이 뚜렷하고 미래에 대한 확실한 계획이 있는 분을 선호합니다. 함께 건설적인 미래를 그리고 이야기 나눌 수 있는 성숙한 파트너를 만나고 싶어요. 서로에게 좋은 자극이 되어 긍정적인 방향으로 함께 발전해 나갔으면 좋겠습니다.",
        "무엇보다 유머 코드가 잘 맞는 것이 중요하다고 생각합니다. 티키타카가 잘 되고, 눈만 마주쳐도 빵 터질 수 있는 재미있는 연애를 꿈꿔요. 조금 장난기가 있더라도 미워할 수 없는 유쾌한 분과 함께라면 평생 지루하지 않을 것 같습니다.",
        "저는 제가 기댈 수 있는 어른스럽고 리더십 있는 분을 만나고 싶습니다. 힘들 때 조언을 구할 수 있는 듬직한 사람이라면 마음이 편안해질 것 같아요. 제가 많이 의지하고 존경할 수 있는 든든한 분을 찾습니다.",
        "반대로 저는 제가 챙겨주고 보듬어줄 수 있는 다정하고 따뜻한 스타일에게 끌립니다. 제가 해주는 배려에 크게 감동하고 고마워할 줄 아는 사랑스러운 연인과 서로 챙겨주며 알콩달콩 연애하고 싶습니다.",
        "예술이나 문화 쪽으로 관심사가 비슷한 분을 만나고 싶습니다. 함께 전시회를 보거나 공연을 보러 가고 감상을 나눌 수 있는 감수성이 풍부한 분이었으면 좋겠어요. 각자의 취향을 존중하는 열린 마음을 가진 분을 기다립니다.",
        "저는 깔끔하고 댄디한 스타일을 선호합니다. 자기 관리를 철저히 하고 단정한 사람에게 매력을 느껴요. 외적인 깔끔함뿐만 아니라 생활 습관도 잘 정돈되어 성실하게 살아가는 분이면 좋겠습니다.",
        "평소에 스트레스를 덜 받고 무던한 성격을 가진 분이 이상형입니다. 제가 조금 예민할 때도 넓은 마음으로 감싸주고 부드럽게 넘어가 줄 수 있는 듬직한 분을 만나고 싶어요. 뒤끝 없이 건강한 관계를 원합니다.",
        "가족을 소중하게 생각하고 화목하게 자란 다정한 분을 찾습니다. 사랑받고 자라 사랑을 베풀 줄 아는 따뜻한 마음씨를 가진 분이면 좋겠어요. 훗날 함께 웃음이 끊이지 않는 예쁜 가정을 꾸려나갈 수 있는 좋은 짝을 만나고 싶습니다."
    };
    
    
    private static final String[] TRAITS_LOOKS = {"아나운서상", "단아한", "세련된", "도시적인", "귀여운", "강아지상", "고양이상", "청순한", "섹시한", "호감형인상", "동안외모", "이목구비뚜렷한", "쌍꺼풀있는", "무쌍매력", "피부가하얀", "피부가좋은", "큰키", "아담한키", "비율이좋은", "슬림한체형", "마른체형", "통통한체형", "근육질/탄탄한", "어깨가넓은", "글래머러스한", "패션감각좋은", "수수한스타일", "화려한스타일", "안경잘어울리는", "미소가예쁜"};
    private static final String[] TRAITS_JOB_ECONOMY = {"전문직(의료)", "전문직(법조)", "대기업", "공기업/공무원", "금융권", "IT/개발자", "교사/교육직", "사업가", "프리랜서", "예술/체육계", "고연봉", "안정적인수입", "자가소유", "부모님노후대비", "금수저(부유한본가)", "경제관념철저한", "재테크관심많은", "소비가큰", "검소한", "근로소득외수익", "차량소유(고급차)", "학벌이좋은", "유학파", "해외근무가능", "워라밸좋은직장", "바쁘지만성공한", "정년보장", "투잡/N잡러", "스타트업대표", "가업승계"};
    private static final String[] TRAITS_LIFESTYLE = {"반려동물키우는", "아웃도어/캠핑즐기는", "비건/채식주의", "외국어/어학능통", "미식가/파인다이닝", "골프즐기는", "테니스/스쿼시", "헬스/바디프로필", "러닝/마라톤", "필라테스/요가", "자전거/라이딩", "서핑/수상스포츠", "등산/트레킹", "호캉스즐기는", "해외여행자주가는", "맛집탐방", "카페투어/디저트", "미술관/전시관람", "뮤지컬/공연관람", "독서/자기계발", "영화/드라마감상", "집순이/집돌이", "방탈출/보드게임", "PC/콘솔게임즐기는", "애니메이션/서브컬처", "요리하기좋아하는", "베이킹/디저트만들기", "사진찍기좋아하는", "와인/위스키즐기는", "가벼운맥주선호", "비음주자(술안마시는)", "익스트림스포츠", "SNS활발한(인스타)", "SNS안하는(프라이빗)", "쇼핑/패션관심많은", "자연친화적인", "악기연주/음악활동", "음악감상(클래식/재즈)", "봉사활동하는", "댄스/안무즐기는", "재테크/투자(주식/코인)", "명상/마음챙김", "공방/원데이클래스", "스포츠경기직관", "클럽/페스티벌즐기는", "인테리어/집꾸미기", "수영/프리다이빙", "자격증공부하는", "낚시즐기는", "드로잉/그림그리기"};
    private static final String[] TRAITS_VALUES = {"딩크족(자녀X)", "자녀계획있는", "맞벌이선호", "외벌이선호", "가정적인(육아동참)", "개인시간존중", "연락자주하는", "연락에자유로운", "기독교", "천주교", "불교", "무교", "종교상관없는", "비흡연자", "흡연자", "주말마다데이트", "한달에1~2번데이트", "결혼준비완료된", "장거리연애가능", "동거후결혼선호", "전통적인결혼관", "개방적인가치관", "동물보호/환경관심", "정치성향비슷한", "싸워도대화로푸는", "혼자만의시간필요한", "양가부모님께잘하는", "독립적인성향", "워커홀릭", "일보다가족우선"};
    private static final String[] TRAITS_PERSONALITY = {"현실적인(S형)", "창의적인(N형)", "외향적인(E형)", "내향적인(I형)", "논리적인(T형)", "공감잘하는(F형)", "계획적인(J형)", "즉흥적인(P형)", "유머러스한", "차분한", "긍정적인", "리더십있는", "다정한", "애교많은", "시크한", "털털한", "섬세한", "진중한", "호기심많은", "감수성풍부한", "도전적인", "자극/도파민추구형", "안정추구형", "눈치빠른", "직설적인", "말을예쁘게하는", "경청잘하는", "자기주장확실한", "타협잘하는", "정이많은", "사교적인", "완벽주의자", "솔직한"}; 
    private static final String[] TRAITS_ROMANCE = {"스킨십을중요시하는", "애정표현적극적인", "낮져밤이스타일", "낮이밤져스타일", "리드하는연애선호", "리드당하는연애선호", "밀당없는직진형", "로맨틱한이벤트선호", "플러팅잘하는", "소소한일상공유", "프라이버시존중", "연락은무조건자주", "질투심이조금있는", "자유방임형연애", "헌신적인해바라기", "친구같은편안함", "뜨겁고열정적인", "잔잔하고스며드는", "말보다행동으로보여주는", "다정하고세심한"};

    private static final String[] MEMBER_IDEAL_TYPES = {
        "대화가 잘 통하고 다정한 사람",
        "자기 관리를 잘하고 배울 점이 많은 사람",
        "유머 감각이 있고 긍정적인 사람",
        "내면이 단단하고 듬직한 사람",
        "취미를 함께 공유할 수 있는 활동적인 사람",
        "책임감이 강하고 가정적인 사람",
        "예의 바르고 배려심이 깊은 사람",
        "소박한 일상을 함께 즐길 수 있는 편안한 사람",
        "동물을 사랑하는 따뜻한 사람",
        "맛집 탐방을 함께할 수 있는 사람",
        "경제 관념이 뚜렷한 사람",
        "어른스럽고 리더십 있는 사람"
    };

    @PostMapping("/generate")
    @Transactional
    public ResponseEntity<String> generateDummyData() {
        // Clear existing data to prevent duplication and accumulation
        approvalRequestRepository.deleteAllInBatch();
        memberTraitRepository.deleteAllInBatch();
        memberRepository.deleteAllInBatch();
        traitRefRepository.deleteAllInBatch();
        managerRepository.deleteAllInBatch();

        Random random = new Random();
        List<Manager> managers = new ArrayList<>();

        // Generate 20 Managers (2 Admins)
        for (int i = 1; i <= 20; i++) {
            boolean isAdmin = (i <= 2);
            String empNo = String.format("M%07d", i);
            String username = "manager" + i;
            String rawPassword = "1111";
            String name = "매니저" + (char) ('A' + (i - 1));
            
            Manager manager = Manager.builder()
                    .name(name)
                    .username(username)
                    .password(SecurityUtil.hashPassword(rawPassword))
                    .empNo(empNo)
                    .birthDate(LocalDate.of(1980 + random.nextInt(20), 1 + random.nextInt(12), 1 + random.nextInt(28)))
                    .introduction("안녕하세요, 매니저 " + i + "입니다. 정성을 다해 좋은 인연을 찾아드리겠습니다.")
                    .isAdmin(isAdmin)
                    .build();
            managers.add(manager);
        }
        managerRepository.saveAll(managers);

        // Generate 3000 Members
        List<Member> members = new ArrayList<>();
        
        for (int i = 1; i <= 3000; i++) {
            Manager assignedManager = managers.get(random.nextInt(managers.size()));
            boolean isMale = random.nextBoolean();
            String gender = isMale ? "M" : "F";
            int age = 20 + random.nextInt(25); // 20 ~ 44
            int height = isMale ? 165 + random.nextInt(25) : 155 + random.nextInt(20);
            
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String firstName = isMale ? FIRST_NAMES_M[random.nextInt(FIRST_NAMES_M.length)] : FIRST_NAMES_F[random.nextInt(FIRST_NAMES_F.length)];
            String name = lastName + firstName;
            
            String greeting = INTRO_GREETINGS[random.nextInt(INTRO_GREETINGS.length)];
            String hobbyIntro = INTRO_HOBBIES[random.nextInt(INTRO_HOBBIES.length)];
            String idealIntro = INTRO_IDEAL_TYPES[random.nextInt(INTRO_IDEAL_TYPES.length)];
            String introduction = greeting + hobbyIntro + idealIntro;
            
            String shortIdealType = MEMBER_IDEAL_TYPES[random.nextInt(MEMBER_IDEAL_TYPES.length)];

            Member member = Member.builder()
                    .name(name)
                    .gender(gender)
                    .age(age)
                    .height(height)
                    .job(JOBS[random.nextInt(JOBS.length)])
                    .salary(3000 + random.nextInt(7000))
                    .phoneNumber("01011111111")
                    .hobbies(HOBBIES[random.nextInt(HOBBIES.length)] + ", " + HOBBIES[random.nextInt(HOBBIES.length)])
                    .idealType(shortIdealType)
                    .introduction(introduction)
                    .remarks("특이사항 없음")
                    .status(Member.MemberStatus.ACTIVE)
                    .manager(assignedManager)
                    .build();
            
            members.add(member);
            
            // To prevent OOM and optimize batch insert
            if (i % 500 == 0) {
                memberRepository.saveAll(members);
                memberRepository.flush();
                members.clear();
            }
        }
        
        if (!members.isEmpty()) {
            memberRepository.saveAll(members);
        }

        return ResponseEntity.ok("Dummy data generated successfully: 20 managers (2 admins) and 3000 members with rich random combinations.");
    }

    @PostMapping("/generate-members")
    @Transactional
    public ResponseEntity<String> generateMembersOnly() {
        approvalRequestRepository.deleteAllInBatch();
        memberTraitRepository.deleteAllInBatch();
        memberRepository.deleteAllInBatch();
        traitRefRepository.deleteAllInBatch();
        
        // Insert 150 Reference Traits
        List<MatchingTraitReference> refs = new ArrayList<>();
        for (String k : TRAITS_LOOKS) refs.add(MatchingTraitReference.builder().category("LOOKS").keyword(k).build());
        for (String k : TRAITS_JOB_ECONOMY) refs.add(MatchingTraitReference.builder().category("JOB_ECONOMY").keyword(k).build());
        for (String k : TRAITS_LIFESTYLE) refs.add(MatchingTraitReference.builder().category("LIFESTYLE").keyword(k).build());
        for (String k : TRAITS_VALUES) refs.add(MatchingTraitReference.builder().category("VALUES").keyword(k).build());
        for (String k : TRAITS_PERSONALITY) refs.add(MatchingTraitReference.builder().category("PERSONALITY").keyword(k).build()); 
        for (String k : TRAITS_ROMANCE) refs.add(MatchingTraitReference.builder().category("ROMANCE_STYLE").keyword(k).build());
        traitRefRepository.saveAll(refs);

        List<Manager> managers = managerRepository.findAll();
        if (managers.isEmpty()) {
            return ResponseEntity.badRequest().body("No managers found. Please generate managers first.");
        }

        Random random = new Random();
        List<Member> members = new ArrayList<>();
        List<MemberTrait> memberTraitsToSave = new ArrayList<>();
        
        for (int i = 1; i <= 3000; i++) {
            Manager assignedManager = managers.get(random.nextInt(managers.size()));
            boolean isMale = random.nextBoolean();
            String gender = isMale ? "M" : "F";
            int age = 20 + random.nextInt(25);
            int height = isMale ? 165 + random.nextInt(25) : 155 + random.nextInt(20);
            
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String firstName = isMale ? FIRST_NAMES_M[random.nextInt(FIRST_NAMES_M.length)] : FIRST_NAMES_F[random.nextInt(FIRST_NAMES_F.length)];
            String name = lastName + firstName;
            
            String greeting = INTRO_GREETINGS[random.nextInt(INTRO_GREETINGS.length)];
            String hobbyIntro = INTRO_HOBBIES[random.nextInt(INTRO_HOBBIES.length)];
            String idealIntro = INTRO_IDEAL_TYPES[random.nextInt(INTRO_IDEAL_TYPES.length)];
            String introduction = greeting + hobbyIntro + idealIntro;
            
            String shortIdealType = MEMBER_IDEAL_TYPES[random.nextInt(MEMBER_IDEAL_TYPES.length)];

            Member member = Member.builder()
                    .name(name)
                    .gender(gender)
                    .age(age)
                    .height(height)
                    .job(JOBS[random.nextInt(JOBS.length)])
                    .salary(3000 + random.nextInt(7000))
                    .phoneNumber("01011111111")
                    .hobbies(HOBBIES[random.nextInt(HOBBIES.length)] + ", " + HOBBIES[random.nextInt(HOBBIES.length)])
                    .idealType(shortIdealType)
                    .introduction(introduction)
                    .remarks("특이사항 없음")
                    .status(Member.MemberStatus.ACTIVE)
                    .manager(assignedManager)
                    .build();
            
            members.add(member);
            
            MemberTrait memberTrait = new MemberTrait();
            memberTrait.setMember(member);
            Map<String, Integer> traitsMap = new HashMap<>();
            
            // Randomly pick 15 traits from all categories and assign scores 0-100
            for(int j=0; j<5; j++) {
                traitsMap.put(TRAITS_LOOKS[random.nextInt(TRAITS_LOOKS.length)], random.nextInt(101));
                traitsMap.put(TRAITS_JOB_ECONOMY[random.nextInt(TRAITS_JOB_ECONOMY.length)], random.nextInt(101));
                traitsMap.put(TRAITS_LIFESTYLE[random.nextInt(TRAITS_LIFESTYLE.length)], random.nextInt(101));
                traitsMap.put(TRAITS_VALUES[random.nextInt(TRAITS_VALUES.length)], random.nextInt(101));
                traitsMap.put(TRAITS_PERSONALITY[random.nextInt(TRAITS_PERSONALITY.length)], random.nextInt(101)); 
                traitsMap.put(TRAITS_ROMANCE[random.nextInt(TRAITS_ROMANCE.length)], random.nextInt(101));
                traitsMap.put(TRAITS_PERSONALITY[random.nextInt(TRAITS_PERSONALITY.length)], random.nextInt(101));
                
            }
            memberTrait.setTraits(traitsMap);
            memberTraitsToSave.add(memberTrait);

            
            if (i % 500 == 0) {
                memberRepository.saveAll(members);
                memberTraitRepository.saveAll(memberTraitsToSave);
                memberRepository.flush();
                memberTraitRepository.flush();
                members.clear();
                memberTraitsToSave.clear();
            }
        }
        
        if (!members.isEmpty()) {
            memberRepository.saveAll(members);
            memberTraitRepository.saveAll(memberTraitsToSave);
        }

        return ResponseEntity.ok("Dummy data generated successfully: 3000 members and traits regenerated.");
    }
}
