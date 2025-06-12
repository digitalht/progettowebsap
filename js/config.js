// 🎯 CONFIGURAZIONE INIZIALE E VARIABILI GLOBALI
// ===============config.js====================================

// 📦 Recupera gli elementi HTML principali dell'interfaccia utente
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const sapResults = document.getElementById("sap-results");

// 🎤 Variabili per riconoscimento vocale
let recognition = null;
let isVoiceModeActive = false;
let speechSynthesis = window.speechSynthesis;
const voiceToggleBtn = document.getElementById("voice-toggle");

// URL del backend
const urlPage = `https://40ea3209-885a-4a8d-98ec-bc5e8f53e063-00-5529wmky4j3q.janeway.replit.dev`;

// 📅 UTILITÀ PER GESTIONE DATE
// =============================

/**
 * 📅 Funzione per parsare le date in vari formati
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    if (/^\d{4}$/.test(dateStr)) {
        return new Date(`${dateStr}-01-01`);
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }

    if (/^\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [month, year] = dateStr.split('/');
        return new Date(`${year}-${month.padStart(2, '0')}-01`);
    }

    return new Date(dateStr);
}

/**
 * 📅 Formatta una data SAP in formato leggibile italiano
 */
function formatSAPDate(sapDateStr) {
    if (!sapDateStr) return "";
    const timestamp = parseInt(sapDateStr.match(/\d+/)?.[0] || "0", 10);
    const date = new Date(timestamp);
    return date.toLocaleDateString("it-IT");
}

// 💾 GESTIONE STATO INTERFACCIA
// ==============================

/**
 * 💾 Salva lo stato attuale della vista SAP nei dati locali (localStorage)
 * 
 * Se ci sono risultati SAP visibili nell'interfaccia (sapResults non è vuoto),
 * li salva nel localStorage per poterli ripristinare successivamente.
 * In caso contrario, rimuove qualsiasi stato salvato.
 */
function saveCurrentViewState() {
    if (sapResults.innerHTML.trim() !== "") {
        // Salva i risultati SAP e lo stato "results" nel localStorage
        sessionStorage.setItem("lastSapResults", sapResults.innerHTML);
        sessionStorage.setItem("viewState", "results");
    } else {
        // Se non ci sono risultati, rimuove le informazioni salvate
        sessionStorage.removeItem("lastSapResults");
        sessionStorage.removeItem("viewState");
    }
}


/**
 * 🔄 Ripristina lo stato della vista SAP dalla sessione precedente
 * 
 * Se esiste uno stato salvato in localStorage che indica la presenza di risultati,
 * li reinserisce nell'interfaccia utente e ristabilisce il comportamento dei pulsanti.
 */
function restoreViewState() {
    const viewState = sessionStorage.getItem("viewState");
    
    if (viewState === "results") {
        const savedResults = sessionStorage.getItem("lastSapResults");

        if (savedResults) {
            // Ripristina l'HTML dei risultati SAP
            sapResults.innerHTML = savedResults;

            // Riassegna correttamente gli eventi onclick ai pulsanti "releaseOrder"
            document.querySelectorAll("[onclick^='releaseOrder']").forEach(button => {
                const orderId = button.getAttribute("onclick").match(/'([^']+)'/)[1];
                button.onclick = () => releaseOrder(orderId);
            });
        }
    }
}


// salva cronologia chat

// function saveChatMessage(text, className) {
//     const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
//     history.push({ text, className });
//     sessionStorage.setItem("chatHistory", JSON.stringify(history)); // ✅ salva correttamente in sessionStorage
// }




/**
 * 🧹 Cancella la cronologia della chat e i risultati SAP
 * 
 * Rimuove la chat salvata e i risultati SAP dal localStorage,
 * ripulisce il contenuto visivo della chat e dei risultati,
 * e mostra un messaggio di conferma all’utente.
 */
function clearChatHistory() {
    // Rimuove la cronologia chat salvata
    // localStorage.removeItem("chatHistory");
    sessionStorage.removeItem("chatHistory");

    // Rimuove anche eventuali risultati SAP salvati
    sessionStorage.removeItem("lastSapResults");
    sessionStorage.removeItem("viewState");

    // Svuota i contenitori visivi
    chatBox.innerHTML = "";
    sapResults.innerHTML = "";

    // Messaggio di conferma dal bot
    appendMessage("Cronologia chat e risultati SAP cancellati.", "bot-message");
}

/**
 * 📌 Funzione per gestire la visibilità dell'interfaccia in base allo stato della chat
 * 
 * Mostra il contenitore principale (.container) solo quando la chat (.dynamic-result) è vuota.
 * Se la chat contiene messaggi, viene mostrata solo la chat e il contenitore viene nascosto.
 */
function aggiornaVisibilitàChat() {
    const dynamicResult = document.querySelector(".dynamic-result"); // Seleziona l'elemento della chat
    const container = document.querySelector(".container"); // Seleziona il contenitore principale

    if (dynamicResult && container) {
        const isChatVuota = dynamicResult.innerHTML.trim() === ""; // Controlla se la chat è vuota (nessun contenuto)

        // Se la chat è vuota, mostra il container e nascondi la chat
        // Altrimenti, mostra la chat e nascondi il container
        container.style.display = isChatVuota ? "block" : "none";
        dynamicResult.style.display = isChatVuota ? "none" : "block";
    }
}

// 🎯 Osserva i cambiamenti nel contenuto della chat per aggiornare la visibilità in tempo reale
const observer = new MutationObserver(aggiornaVisibilitàChat); // Crea l'osservatore che richiama la funzione ogni volta che cambia la chat

const dynamicResultEl = document.querySelector(".dynamic-result"); // Ottiene il riferimento alla chat nel DOM
if (dynamicResultEl) {
    observer.observe(dynamicResultEl, { childList: true, subtree: true }); // Osserva i cambiamenti nei nodi figli
    aggiornaVisibilitàChat(); // Esegue il controllo una prima volta subito all'avvio
}
