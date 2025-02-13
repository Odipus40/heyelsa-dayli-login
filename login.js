const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post("https://app.heyelsa.ai/login", {});
        console.log(response.data);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

testLogin();
