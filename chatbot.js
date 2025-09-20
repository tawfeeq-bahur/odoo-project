const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // Replace with your OpenAI API key

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';

    const response = await getGPTResponse(message);
    appendMessage('bot', response);
}

function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function getGPTResponse(message) {
    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Powerful, cost-effective
                messages: [{ role: "user", content: message }],
                temperature: 0.7
            })
        });

        const data = await res.json();
        return data.choices[0].message.content.trim();
    } catch (err) {
        console.error(err);
        return "Oops! Something went wrong. Try again.";
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});
