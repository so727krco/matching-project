const axios = require('axios');
async function run() {
    for (let i = 1; i <= 25; i++) {
        try {
            const res = await axios.post('http://localhost:8080/api/members', {
                name: `Test ${i}`, gender: "M", age: 30, height: 175, job: "Test",
                salary: 5000, phoneNumber: `010-0000-${i.toString().padStart(4, '0')}`,
                hobbies: "Coding", idealType: "Smart", introduction: "Hello",
                managerId: 82, remarks: "None"
            });
            console.log(`[${i}] Success: ${res.status}`);
        } catch (e) {
            console.log(`[${i}] Failed: ${e.response ? e.response.status : e.message} ${e.response ? e.response.data : ''}`);
        }
    }
}
run();
