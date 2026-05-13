import axios from 'axios';

const TEST_PAYLOAD = {
    location: "Cusco, Valle Sagrado",
    lat: -13.1631,
    lon: -72.5450,
    crop: "Maíz Amiláceo"
};

const runTest = async () => {
    console.log('🧪 Testing RAG Endpoint with payload:', TEST_PAYLOAD);
    try {
        const res = await axios.post('http://localhost:3002/api/recommendation', TEST_PAYLOAD);

        if (res.data.success) {
            console.log('✅ Success! Recommendation received:');
            console.log('------------------------------------------------');
            console.log(res.data.data.recommendation);
            console.log('------------------------------------------------');
            console.log('📊 Weather Data Used:', res.data.data.weather);
        } else {
            console.error('❌ API returned failure:', res.data);
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ Server Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
};

runTest();
