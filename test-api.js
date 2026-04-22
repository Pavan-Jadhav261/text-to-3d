const fs = require('fs');
const path = require('path');

async function testDecoration() {
    const prompt = "decorate this wall with some modern shelves and a lamp";
    // Valid 1x1 transparent PNG base64
    const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    console.log("Sending request to /api/generate-3d...");

    try {
        const response = await fetch("http://localhost:3000/api/generate-3d", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: prompt,
                image: imageBase64,
                mimeType: "image/png"
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testDecoration();
