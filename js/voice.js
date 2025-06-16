// // 🎤 GESTIONE RICONOSCIMENTO VOCALE
// // ==================================

// function initSpeechRecognition() {
//     if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
//         appendMessage("❌ Il tuo browser non supporta il riconoscimento vocale", "bot-message");
//         return false;
//     }

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     recognition = new SpeechRecognition();

//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = 'it-IT';

//     recognition.onstart = function () {
//         voiceToggleBtn.textContent = "🔴 Ascoltando...";
//         voiceToggleBtn.style.backgroundColor = "#dc3545";
//         appendMessage("🎤 Sto ascoltando...", "bot-message");
//     };

//     recognition.onresult = function (event) {
//         const transcript = event.results[0][0].transcript;
//         appendMessage(transcript, "user-message");
//         processVoiceCommand(transcript);
//     };

//     recognition.onerror = function (event) {
//         console.error('Errore riconoscimento vocale:', event.error);
//         appendMessage("❌ Errore nel riconoscimento vocale", "bot-message");
//         resetVoiceButton();
//     };

//     recognition.onend = function () {
//         resetVoiceButton();
//         if (isVoiceModeActive) {
//             setTimeout(() => {
//                 if (isVoiceModeActive) {
//                     startListening();
//                 }
//             }, 2000);
//         }
//     };

//     return true;
// }

// function startListening() {
//     if (recognition) {
//         try {
//             recognition.start();
//         } catch (error) {
//             console.error('Errore avvio riconoscimento:', error);
//         }
//     }
// }

// function stopListening() {
//     if (recognition) {
//         recognition.stop();
//     }
//     resetVoiceButton();
// }

// function resetVoiceButton() {
//     voiceToggleBtn.textContent = isVoiceModeActive ? "🎤 Modalità vocale ON" : "🎤 Modalità vocale";
//     voiceToggleBtn.style.backgroundColor = isVoiceModeActive ? "#28a745" : "#007BFF";
// }

// function processVoiceCommand(transcript) {
//     if (tryQuickPatterns(transcript)) {
//         return;
//     }
//     callOpenAIWithFunctions(transcript);
// }

// function speakText(text) {
//     const cleanText = text.replace(/[🎯📋💬🔍✅❌🔄🎤🔊📤📥🏢📅🔐💾🎨📦📡🚀⚡]/g, '');

//     if (speechSynthesis && cleanText.trim()) {
//         speechSynthesis.cancel();
//         const utterance = new SpeechSynthesisUtterance(cleanText);
//         utterance.lang = 'it-IT';
//         utterance.rate = 0.9;
//         utterance.pitch = 1;
//         speechSynthesis.speak(utterance);
//     }
// }

// 🎤 GESTIONE RICONOSCIMENTO VOCALE MIGLIORATO
// ===============================================

let silenceTimer = null;
let listeningMessageId = null;
let isCurrentlyListening = false;

function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        appendMessage("❌ Il tuo browser non supporta il riconoscimento vocale", "bot-message");
        return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    // Configurazione per rilevamento continuo del silenzio
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'it-IT';

    recognition.onstart = function () {
        isCurrentlyListening = true;
        voiceToggleBtn.textContent = "🔴 Ascoltando...";
        voiceToggleBtn.style.backgroundColor = "#dc3545";
        
        // Aggiunge il messaggio "Sto ascoltando..." e salva l'ID
        listeningMessageId = appendMessage("🎤 Sto ascoltando...", "bot-message");
        
        // Avvia il timer per il silenzio
        resetSilenceTimer();
    };

    recognition.onresult = function (event) {
        let finalTranscript = '';
        let interimTranscript = '';

        // Processa tutti i risultati
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Se c'è del parlato (finale o interim), resetta il timer del silenzio
        if (finalTranscript.trim() || interimTranscript.trim()) {
            resetSilenceTimer();
        }

        // Se abbiamo un risultato finale, lo processa
        if (finalTranscript.trim()) {
            // Rimuove il messaggio "Sto ascoltando..."
            removeListeningMessage();
            
            // Aggiunge il messaggio dell'utente
            appendMessage(finalTranscript, "user-message");
            
            // Processa il comando vocale
            processVoiceCommand(finalTranscript);
            
            // Ferma il riconoscimento per processare la risposta
            stopCurrentRecognition();
        }
    };

    recognition.onerror = function (event) {
        console.error('Errore riconoscimento vocale:', event.error);
        
        // Gestisce diversi tipi di errore
        if (event.error !== 'aborted') {
            removeListeningMessage();
            appendMessage("❌ Errore nel riconoscimento vocale", "bot-message");
        }
        
        resetVoiceButton();
        clearSilenceTimer();
    };

    recognition.onend = function () {
        isCurrentlyListening = false;
        clearSilenceTimer();
        
        // Se la modalità vocale è ancora attiva, riavvia dopo una pausa
        if (isVoiceModeActive) {
            setTimeout(() => {
                if (isVoiceModeActive && !isCurrentlyListening) {
                    startListening();
                }
            }, 1500);
        } else {
            resetVoiceButton();
        }
    };

    return true;
}

function startListening() {
    if (recognition && !isCurrentlyListening) {
        try {
            recognition.start();
        } catch (error) {
            console.error('Errore avvio riconoscimento:', error);
            // Se il riconoscimento è già in corso, lo ferma e riavvia
            if (error.name === 'InvalidStateError') {
                recognition.stop();
                setTimeout(() => startListening(), 500);
            }
        }
    }
}

function stopListening() {
    isVoiceModeActive = false;
    stopCurrentRecognition();
    resetVoiceButton();
    removeListeningMessage();
    clearSilenceTimer();
}

function stopCurrentRecognition() {
    if (recognition && isCurrentlyListening) {
        recognition.stop();
    }
}

function resetVoiceButton() {
    voiceToggleBtn.textContent = isVoiceModeActive ? "🎤 Modalità vocale ON" : "🎤 Modalità vocale";
    voiceToggleBtn.style.backgroundColor = isVoiceModeActive ? "#28a745" : "#007BFF";
}

// Gestione del timer per il silenzio
function resetSilenceTimer() {
    clearSilenceTimer();
    
    // Avvia un nuovo timer di 3 secondi
    silenceTimer = setTimeout(() => {
        if (isCurrentlyListening && isVoiceModeActive) {
            // Se rileva silenzio per 3 secondi, ferma il riconoscimento e processa
            handleSilenceDetected();
        }
    }, 3000);
}

function clearSilenceTimer() {
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }
}

function handleSilenceDetected() {
    console.log('Silenzio rilevato per 3 secondi');
    
    // Rimuove il messaggio "Sto ascoltando..."
    removeListeningMessage();
    
    // Ferma il riconoscimento corrente
    stopCurrentRecognition();
    
    // Se non c'era contenuto da processare, riavvia l'ascolto
    if (isVoiceModeActive) {
        setTimeout(() => {
            if (isVoiceModeActive && !isCurrentlyListening) {
                startListening();
            }
        }, 1000);
    }
}

// Gestione dei messaggi "Sto ascoltando..."
function removeListeningMessage() {
    if (listeningMessageId) {
        const messageElement = document.getElementById(listeningMessageId);
        if (messageElement) {
            messageElement.remove();
        }
        listeningMessageId = null;
    }
}

// Modifica della funzione appendMessage per supportare ID univoci e sintesi vocale automatica

// function appendMessage(message, className, returnId = false) {
//     if (!chatBox) {
//         console.error('chatBox element not found');
//         return null;
//     }

//     const messageDiv = document.createElement('div');
//     const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

//     messageDiv.id = messageId;
//     messageDiv.className = `message ${className}`;
//     messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
//     chatBox.appendChild(messageDiv);
//     chatBox.scrollTop = chatBox.scrollHeight;

//     // Messaggio temporaneo: mostra e poi rimuove dopo 2 secondi
//     if (message.includes("Sto elaborando")) {
//         setTimeout(() => {
//             const el = document.getElementById(messageId);
//             if (el) el.remove();
//         }, 2000);
//         return messageId;
//     }

//     // 🔊 Sintesi vocale solo per messaggi del bot (escludi alcuni)
//     if (className === 'bot-message' && isVoiceModeActive) {
//         // NON leggere i messaggi "Sto ascoltando" o "Sto elaborando"
//         if (!message.includes("Sto ascoltando") && !message.includes("Sto elaborando")) {
//             speakText(message);
//         }
//     }

//     if (returnId) {
//         return messageId;
//     }

//     return messageId;
// }

function processVoiceCommand(transcript) {
    // Rimuove eventuali messaggi "Sto ascoltando..." rimasti
    removeListeningMessage();
    
    if (tryQuickPatterns(transcript)) {
        return;
    }
    callOpenAIWithFunctions(transcript);
}

// function speakText(text) {
//     // Se la modalità vocale non è attiva, non parlare
//     if (!isVoiceModeActive) {
//         return;
//     }
    
//     const cleanText = text.replace(/[🎯📋💬🔍✅❌🔄🎤🔊📤📥🏢📅🔐💾🎨📦📡🚀⚡]/g, '');

//     if (speechSynthesis && cleanText.trim()) {
//         speechSynthesis.cancel();
        
//         // Aspetta che le voci siano caricate
//         const speak = () => {
//             const utterance = new SpeechSynthesisUtterance(cleanText);
//             utterance.lang = 'it-IT';
//             utterance.rate = 0.9;
//             utterance.pitch = 1;
            
//             // Prova a impostare una voce italiana se disponibile, altrimenti usa la prima disponibile
//             const voices = speechSynthesis.getVoices();
//             let selectedVoice = voices.find(voice => 
//                 voice.lang.includes('it') || voice.lang.includes('IT')
//             );
            
//             // Se non trova una voce italiana, usa la prima voce disponibile
//             if (!selectedVoice && voices.length > 0) {
//                 selectedVoice = voices[0];
//             }
            
//             if (selectedVoice) {
//                 utterance.voice = selectedVoice;
//                 console.log('Usando voce:', selectedVoice.name, selectedVoice.lang);
//             }
            
//             utterance.onstart = function() {
//                 console.log('🔊 Inizio lettura:', cleanText.substring(0, 50) + '...');
//                 // NON fermare il riconoscimento quando inizia a parlare
//                 // Mantieni l'ascolto attivo in background
//             };
            
//             utterance.onend = function() {
//                 console.log('✅ Sintesi vocale completata');
//                 // Dopo che ha finito di parlare, assicurati che l'ascolto sia attivo
//                 if (isVoiceModeActive && !isCurrentlyListening) {
//                     setTimeout(() => {
//                         startListening();
//                     }, 500);
//                 }
//             };
            
//             utterance.onerror = function(event) {
//                 console.error('❌ Errore sintesi vocale:', event.error);
//                 // Riavvia l'ascolto anche in caso di errore
//                 if (isVoiceModeActive && !isCurrentlyListening) {
//                     setTimeout(() => {
//                         startListening();
//                     }, 500);
//                 }
//             };
            
//             speechSynthesis.speak(utterance);
//         };
        
//         // Se le voci non sono ancora caricate, aspetta
//         if (speechSynthesis.getVoices().length === 0) {
//             speechSynthesis.onvoiceschanged = () => {
//                 speak();
//                 speechSynthesis.onvoiceschanged = null;
//             };
//         } else {
//             speak();
//         }
//     } else {
//         console.log('⚠️ Sintesi vocale non disponibile o testo vuoto');
//         // Riavvia l'ascolto comunque
//         if (isVoiceModeActive && !isCurrentlyListening) {
//             setTimeout(() => {
//                 startListening();
//             }, 500);
//         }
//     }
// }

// Funzione per testare la sintesi vocale
function speakText(text) {
    // Se la modalità vocale non è attiva, non parlare
    if (!isVoiceModeActive) {
        return;
    }

    const cleanText = text.replace(/[🎯📋💬🔍✅❌🔄🎤🔊📤📥🏢📅🔐💾🎨📦📡🚀⚡]/g, '');

    if (speechSynthesis && cleanText.trim()) {
        speechSynthesis.cancel();

        const speak = () => {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'it-IT';
            utterance.rate = 0.9;
            utterance.pitch = 1;

            const voices = speechSynthesis.getVoices();

            // Prova a selezionare una voce femminile italiana specifica
            const preferredVoices = [
                'Google italiano',           // Chrome (desktop)
                'Google Italiano Femminile', // Chrome (desktop, alternativa)
                'Alice',                     // macOS
                'Federica',                  // Windows
                'Lucia'                      // Altra voce italiana possibile
            ];

            let selectedVoice = voices.find(voice =>
                preferredVoices.some(name => voice.name.toLowerCase().includes(name.toLowerCase()))
            );

            // Se non trova una voce preferita, prova qualsiasi voce italiana femminile
            if (!selectedVoice) {
                selectedVoice = voices.find(voice =>
                    voice.lang.startsWith('it') && voice.name.toLowerCase().includes('female')
                );
            }

            // Se ancora nulla, ripiega sulla prima voce italiana trovata
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang.startsWith('it'));
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log('🎙️ Voce selezionata:', selectedVoice.name, `(${selectedVoice.lang})`);
            } else {
                console.warn('⚠️ Nessuna voce italiana trovata. Usando voce predefinita.');
            }

            utterance.onstart = function () {
                console.log('🔊 Inizio lettura:', cleanText.substring(0, 50) + '...');
            };

            utterance.onend = function () {
                console.log('✅ Sintesi vocale completata');
                if (isVoiceModeActive && !isCurrentlyListening) {
                    setTimeout(() => {
                        startListening();
                    }, 500);
                }
            };

            utterance.onerror = function (event) {
                console.error('❌ Errore sintesi vocale:', event.error);
                if (isVoiceModeActive && !isCurrentlyListening) {
                    setTimeout(() => {
                        startListening();
                    }, 500);
                }
            };

            speechSynthesis.speak(utterance);
        };

        // Se le voci non sono ancora caricate, aspetta che lo siano
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = () => {
                speak();
                speechSynthesis.onvoiceschanged = null;
            };
        } else {
            speak();
        }
    } else {
        console.log('⚠️ Sintesi vocale non disponibile o testo vuoto');
        if (isVoiceModeActive && !isCurrentlyListening) {
            setTimeout(() => {
                startListening();
            }, 500);
        }
    }
}

function testSpeech() {
    console.log('🧪 Test sintesi vocale...');
    console.log('📢 Voci disponibili:', speechSynthesis.getVoices().length);
    speechSynthesis.getVoices().forEach((voice, index) => {
        console.log(`${index}: ${voice.name} (${voice.lang})`);
    });
    
    isVoiceModeActive = true; // Forza la modalità vocale per il test
    speakText("Test di sintesi vocale funzionante. La modalità vocale è ora attiva.");
}