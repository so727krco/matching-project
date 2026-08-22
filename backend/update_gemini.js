const fs = require('fs');
let content = fs.readFileSync('backmgr/src/main/java/com/matching/backmgr/service/impl/GeminiMatchingAiServiceImpl.java', 'utf8');

const oldMethod = `    @Override
    public AiProfileResult profileMemberTraits(String memberProfileText) {
        String profilePrompt = "당신은 결혼정보회사의 전문 프로파일러입니다.\\n"
                + "제공된 회원의 프로필 텍스트를 분석하여, 다음 두 가지를 JSON 형식으로 반환하세요:\\n"
                + "1. traits: 회원에게 가장 적합하고 두드러지는 특성(Trait) 10개~20개를 [추출 가능 기준 단어 리스트] 안에서만 골라, 특성명(키)과 가중치(0~100)(값)의 객체로 구성하세요.\\n"
                + "2. analysisRemarks: 자기소개서 내용 중 모순되는 부분이 있는지, 어떤 회원을 매칭해주면 성공률이 높은지, 매칭 시 특별히 신경써야하거나 주의해야할 부분 등을 문자열로 상세하게 작성하세요.\\n"
                + "응답은 반드시 아래 JSON 구조만을 가져야 하며, 다른 설명은 포함하지 마세요:\\n"
                + "{\\n"
                + "  \\"traits\\": {\\"단어1\\": 80, \\"단어2\\": 90},\\n"
                + "  \\"analysisRemarks\\": \\"분석 내용...\\"\\n"
                + "}";
                
        List<String> allTraits = traitRefRepository.findAll().stream()
                .map(MatchingTraitReference::getKeyword)
                .collect(Collectors.toList());

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + apiKey;

        String fullPrompt = profilePrompt + "\\n\\n"
                + "[분석할 내용]: " + memberProfileText + "\\n\\n"
                + "[추출 가능 기준 단어 리스트]:\\n" + String.join(", ", allTraits);`;

const newMethod = `    @Override
    public AiProfileResult profileMemberTraits(String memberProfileText) {
        List<String> allTraits = traitRefRepository.findAll().stream()
                .map(MatchingTraitReference::getKeyword)
                .collect(Collectors.toList());

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + apiKey;

        String fullPrompt = systemPrompt + "\\n\\n"
                + "[분석할 내용]: " + memberProfileText + "\\n\\n"
                + "[추출 가능 기준 단어 리스트]:\\n" + String.join(", ", allTraits);`;

content = content.replace(oldMethod, newMethod);
fs.writeFileSync('backmgr/src/main/java/com/matching/backmgr/service/impl/GeminiMatchingAiServiceImpl.java', content, 'utf8');
console.log('Updated GeminiMatchingAiServiceImpl');
