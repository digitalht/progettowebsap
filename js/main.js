// 🚀 INIZIALIZZAZIONE APPLICAZIONE
// ============main.js=====================

document.addEventListener("DOMContentLoaded", function () {


    // Inizializza riconoscimento vocale
    initSpeechRecognition();

    // Ripristino cronologia chat
    // const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
    // history.forEach(({ text, className }) => {
    //     const div = document.createElement("div");
    //     div.className = className;
    //     div.textContent = text;
    //     chatBox.appendChild(div);
    // });
    const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
    history.forEach(({ text, className }) => {
        const div = document.createElement("div");
        div.className = className;
        div.textContent = text;
        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
    restoreViewState();

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);

    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    // Gestione modalità vocale
    voiceToggleBtn.addEventListener("click", function () {
        if (!recognition && !initSpeechRecognition()) {
            return;
        }

        isVoiceModeActive = !isVoiceModeActive;

        if (isVoiceModeActive) {
            appendMessage("🎤 Modalità vocale attivata. Parla per interagire!", "bot-message");
            startListening();
        } else {
            appendMessage("🎤 Modalità vocale disattivata", "bot-message");
            stopListening();
        }

        resetVoiceButton();
    });

    // Gestione toggle chat
    const toggleBtn = document.getElementById("toggle-chat");
    const chatContainer = document.querySelector(".chat-container");
    const binButton = document.getElementById("bin");

    if (binButton) {
        binButton.addEventListener("click", clearChatHistory);
    }

    if (toggleBtn && chatContainer) {
        toggleBtn.addEventListener("click", function () {
            const isMinimized = chatContainer.classList.toggle("minimized");
            toggleBtn.textContent = isMinimized ? "+" : "−";
        });
    }

    // Inizializza avatar 3D se disponibile
    if (typeof window.init === "function") {
        window.init();
    }
});