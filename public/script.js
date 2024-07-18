let lastResponseMessageID = null;

async function handleCommand(args) {
    const userInput = args.join(" ").trim();
    const userInputLower = userInput.toLowerCase();

    if (!userInputLower.startsWith("ai")) {
        displayMessage("Please start your command with 'ai'.", 'user');
        return;
    }

    const question = userInput.slice(3).trim();

    if (!question) {
        displayMessage("Please provide a question to get an answer.", 'user');
        return;
    }

    try {
        const { response } = await getAIResponse(question);
        displayMessage(`🤖 ${response}`, 'bot');
    } catch (error) {
        console.error("Error in handleCommand:", error.message);
        displayMessage("An error occurred while processing your request.", 'user');
    }
}

async function getAnswerFromAI(question) {
    try {
        const services = [
            { url: 'https://markdevs-last-api.onrender.com/gpt4', params: { prompt: question, uid: 'your-uid-here' } },
            { url: 'http://markdevs-last-api.onrender.com/api/v2/gpt4', params: { query: question } },
            { url: 'https://markdevs-last-api.onrender.com/api/v3/gpt4', params: { ask: question } }
        ];

        for (const service of services) {
            const data = await fetchFromAI(service.url, service.params);
            if (data) return data;
        }

        throw new Error("No valid response from any AI service");
    } catch (error) {
        console.error("Error in getAnswerFromAI:", error.message);
        throw new Error("Failed to get AI response");
    }
}

async function fetchFromAI(url, params) {
    try {
        const { data } = await axios.get(url, { params });
        if (data && (data.gpt4 || data.reply || data.response || data.answer || data.message)) {
            const response = data.gpt4 || data.reply || data.response || data.answer || data.message;
            console.log("AI Response:", response);
            return response;
        } else {
            throw new Error("No valid response from AI");
        }
    } catch (error) {
        console.error("Network Error:", error.message);
        return null;
    }
}

async function getAIResponse(input) {
    const query = input.trim() || "hi";
    try {
        const response = await getAnswerFromAI(query);
        return { response };
    } catch (error) {
        console.error("Error in getAIResponse:", error.message);
        throw error;
    }
}

function displayMessage(message, sender = 'user') {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (sender === 'user') {
        messageElement.classList.add('user-message');
    } else {
        messageElement.classList.add('bot-message');
    }

    messageElement.textContent = message;
    chatbox.appendChild(messageElement);

    // Automatically scroll to the bottom of the chatbox
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Event listener for the Send button
document.getElementById('sendButton').addEventListener('click', async function() {
    const userInput = document.getElementById('userInput').value.trim();
    const args = userInput.split(" ");
    await handleCommand(args);
    document.getElementById('userInput').value = '';
});

// Capture Enter key press in the input field
document.getElementById('userInput').addEventListener('keyup', async function(event) {
    if (event.key === 'Enter') {
        const userInput = document.getElementById('userInput').value.trim();
        const args = userInput.split(" ");
        await handleCommand(args);
        document.getElementById('userInput').value = '';
    }
});