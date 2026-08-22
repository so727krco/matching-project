const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('http://localhost:8080/api/members', {
            name: "테스트", gender: "M", age: 30, height: 175, job: "개발자",
            salary: 5000, phoneNumber: "010-1234-5678", hobbies: "코딩",
            idealType: "착한사람", introduction: "안녕하세요", managerId: 82,
            remarks: "테스트"
        });
        console.log("SUCCESS:", res.status);
    } catch(err) {
        console.log("FAILED:", err.response ? err.response.status : err.message);
        console.log("DATA:", err.response ? err.response.data : '');
    }
}
test();
