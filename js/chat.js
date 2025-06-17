// 🗨️ GESTIONE MESSAGGI CHAT E AI
// ============chat.js===================

/**
 * AGGIUNTA MESSAGGI ALLA CHAT CON GESTIONE COMPLETA
 * Crea e visualizza un nuovo messaggio nella chat box con funzionalità avanzate
 * @param {string} message - Il testo del messaggio da visualizzare
 * @param {string} className - La classe CSS per lo stile del messaggio
 * @param {boolean} returnId - Se true, ritorna l'ID del messaggio creato
 * @returns {string|null} L'ID del messaggio o null se errore
 */
function appendMessage(message, className, returnId = false) {
    // Verifica che l'elemento chatBox esista nel DOM
    if (!chatBox) {
        console.error('chatBox element not found');
        return null;
    }

    // Crea un nuovo elemento div per il messaggio
    const messageDiv = document.createElement("div");
    // Genera un ID univoco combinando timestamp e stringa random
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Imposta ID, classe CSS e contenuto HTML del messaggio
    messageDiv.id = messageId;
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;

    // Aggiunge il messaggio alla chat e scrolla in basso
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 🚫 Escludi messaggi temporanei dal salvataggio
    // Salva solo messaggi permanenti (non quelli di elaborazione)
    if (!message.includes("Sto elaborando")) {
        if (typeof saveChatMessage === 'function') {
            saveChatMessage(message, className);
        }
    }

    // Gestione messaggi temporanei: rimuove automaticamente dopo 2 secondi
    if (message.includes("Sto elaborando")) {
        setTimeout(() => {
            const el = document.getElementById(messageId);
            if (el) el.remove();
        }, 2000);
        return messageId;
    }

    // 🔊 Sintesi vocale (solo per messaggi del bot, escludendo alcuni tipi)
    if (className === "bot-message" && isVoiceModeActive) {
        if (!message.includes("Sto ascoltando") && !message.includes("Sto elaborando")) {
            speakText(message);
        }
    }

    return returnId ? messageId : messageId;
}

/**
 * SALVATAGGIO PERSISTENTE DELLA CRONOLOGIA CHAT
 * Memorizza i messaggi nel sessionStorage per mantenere la cronologia
 * @param {string} text - Il testo del messaggio da salvare
 * @param {string} className - La classe CSS del messaggio (user/bot)
 */
function saveChatMessage(text, className) {
    // Recupera la cronologia esistente dal sessionStorage o inizializza array vuoto
    const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");

    // Aggiunge il nuovo messaggio alla cronologia
    history.push({ text, className });

    // Salva la cronologia aggiornata nel sessionStorage
    sessionStorage.setItem("chatHistory", JSON.stringify(history));


    // console.log("📦 sessionStorage attuale:", JSON.parse(sessionStorage.getItem("chatHistory")));
}

/**
 * INVIO MESSAGGIO UTENTE CON GESTIONE COMPLETA
 * Gestisce l'invio di un messaggio dall'utente, inclusa validazione e routing
 */
function sendMessage() {
    // Ottiene e pulisce il messaggio dall'input utente
    const message = userInput.value.trim();

    // Esce se il messaggio è vuoto
    if (message === "") return;

    // Visualizza il messaggio dell'utente nella chat
    appendMessage(message, "user-message");

    // Pulisce il campo di input
    userInput.value = "";

    // Prova prima con pattern di risposta rapida (scorciatoie)
    if (tryQuickPatterns(message)) {
        return; // Se trova un pattern rapido, esce senza chiamare l'AI
    }

    // Se non ci sono pattern rapidi, invia il messaggio all'AI
    callOpenAIWithFunctions(message);
}

// 🏃‍♂️ PATTERN VELOCI PER RICHIESTE COMUNI
function tryQuickPatterns(message) {
    const patterns = [
        {
            regex: /^tutti.*ordini$/i,
            action: () => {
                appendMessage("🔍 Recupero tutti gli ordini...", "bot-message");
                getSAPEntityData("PurchaseOrderSet");
            }
        },
        {
            regex: /^ordine\s+(\d{10})$/i,
            action: (match) => {
                const orderId = match[1];
                appendMessage(`🔍 Recupero l'ordine ${orderId}...`, "bot-message");
                getSingleOrder(orderId);
            }
        },
        {
            regex: /^rilascia\s+ordine\s+(\d{10})$/i,
            action: (match) => {
                const orderId = match[1];
                appendMessage(`🔐 Rilascio ordine ${orderId}...`, "bot-message");
                releaseOrder(orderId);
            }
        }
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern.regex);
        if (match) {
            pattern.action(match);
            return true;
        }
    }
    return false;
}

// 🤖 INTEGRAZIONE CON OPENAI
function callOpenAIWithFunctions(message) {
    appendMessage("🤖 Sto elaborando la tua richiesta...", "bot-message");

    const systemPrompt = `Sei un assistente SAP intelligente. Analizza la richiesta dell'utente e determina quale azione eseguire.

FUNZIONI DISPONIBILI:
1. "show_all_orders" - mostra tutti gli ordini
2. "show_specific_order" - mostra un ordine specifico (serve il numero ordine)
3. "show_orders_by_vendor" - mostra ordini di un fornitore specifico
4. "show_orders_by_date_range" - mostra ordini tra due date specifiche
5. "show_orders_by_date_filter" - mostra ordini prima/dopo una data
6. "show_orders_by_year_range" - mostra ordini tra due anni
7. "list_vendors" - elenca tutti i fornitori
8. "show_orders_by_year" - mostra ordini di un anno specifico
9. "release_order" - rilascia un ordine specifico (serve il numero ordine)
10. "show_orders_by_vendor_and_year" - mostra ordini di un fornitore specifico per un anno specifico
11. "show_released_orders" - mostra solo gli ordini rilasciati
12. "show_unreleased_orders" - mostra solo gli ordini non rilasciati
13. "show_orders_by_month_year" - mostra ordini di un mese specifico di un anno
14. "show_orders_by_day" - mostra ordini di un giorno specifico
15. "show_orders_by_month" - mostra ordini di un mese specifico (tutti gli anni)

CONTESTO ATTUALE:
- Se l'utente ha visualizzato un ordine, puoi assumere che "rilascialo" o "rilascia questo" si riferisca all'ordine in questione.

ESEMPI DI RICHIESTE CHE DEVI RICONOSCERE:
- "tutti gli ordini", "mostra ordini", "visualizza tutti gli ordini" → show_all_orders
- "ordine 4500000869", "mostra ordine numero 123", "dettagli ordine" → show_specific_order
- "ordini SAP ITALIA", "ordini fornitore Mario Rossi" → show_orders_by_vendor
- "fornitori disponibili", "che fornitori ci sono" → list_vendors
- "ordini 2024", "ordini del 2023" → show_orders_by_year
- "ordini tra il 01/03/2022 e il 01/06/2022", "ordini dal 15/01/2023 al 20/12/2023" → show_orders_by_date_range
- "ordini dopo il 2023", "ordini prima del 2022", "ordini dopo il 15/05/2023" → show_orders_by_date_filter  
- "ordini tra il 2020 e il 2022", "ordini dal 2019 al 2023" → show_orders_by_year_range
- "rilascia ordine 4500000869", "rilascia l'ordine numero 123" → release_order
- "rilascia", "rilascialo", "rilascia questo ordine" → release_order (usa l'ordine nel contesto se disponibile)
- "ordini del fornitore Cantina Fina del 2023", "fammi vedere gli ordini del 2024 per Rossi Spa" → show_orders_by_vendor_and_year
- "ordini rilasciati", "fammi vedere gli ordini rilasciati", "mostra ordini rilasciati" → show_released_orders
- "ordini non rilasciati", "fammi vedere gli ordini non rilasciati", "mostra ordini non rilasciati" → show_unreleased_orders
- "ordini di gennaio 2024", "ordini del marzo 2023", "ordini febbraio 2024" → show_orders_by_month_year
- "ordini di gennaio", "ordini del marzo", "ordini di dicembre" → show_orders_by_month
- "ordini del 15/03/2024", "ordini di oggi", "ordini del giorno 12/01/2023" → show_orders_by_day
- "ordini del 3/2024", "ordini del mese 05/2023" → show_orders_by_month_year

Rispondi SEMPRE in questo formato JSON:
{
  "action": "nome_funzione",
  "parameters": {
    "orderId": "numero_ordine_se_necessario",
    "vendorName": "nome_fornitore_se_necessario",
    "year": "anno_se_necessario",
    "month": "mese_se_necessario_numero_1-12",
    "monthName": "nome_mese_se_necessario",
    "day": "giorno_se_necessario",
    "specificDate": "data_specifica_se_necessaria_formato_dd/mm/yyyy",
    "startDate": "data_inizio_se_necessario_formato_dd/mm/yyyy",
    "endDate": "data_fine_se_necessario_formato_dd/mm/yyyy",
    "dateOperator": "before_o_after_se_necessario",
    "filterDate": "data_filtro_se_necessario_formato_dd/mm/yyyy_o_yyyy",
    "startYear": "anno_inizio_se_necessario",
    "endYear": "anno_fine_se_necessario"
  },
  "response": "messaggio_per_utente"
}

Se non capisci la richiesta, usa "action": "chat" per una risposta normale.`;

    fetch(`${urlPage}/openai/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message,
            systemPrompt: systemPrompt
        })
    })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                appendMessage(`❌ Errore: ${data.error}`, "bot-message");
                return;
            }

            const reply = data.choices?.[0]?.message?.content || "🤖 Nessuna risposta.";

            try {
                let jsonContent = reply.trim();
                if (jsonContent.startsWith('```json')) {
                    jsonContent = jsonContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
                } else if (jsonContent.startsWith('```')) {
                    jsonContent = jsonContent.replace(/```\s*/, '').replace(/```\s*$/, '');
                }

                const aiResponse = JSON.parse(jsonContent);
                if (aiResponse && typeof aiResponse === 'object' && aiResponse.action) {
                    executeAIAction(aiResponse);
                } else {
                    appendMessage(reply, "bot-message");
                }
            } catch (e) {
                if (parseAndExecuteFromText(reply)) {
                    return;
                }
                appendMessage(reply, "bot-message");
            }
        })
        .catch(err => {
            console.error("Errore completo:", err);
            appendMessage("🔄 Backend non disponibile, uso pattern locali...", "bot-message");

            if (tryAdvancedPatterns(message)) {
                return;
            }

            appendMessage("❌ Servizio AI temporaneamente non disponibile.", "bot-message");
        });
}

// Funzione di fallback con pattern avanzati
function tryAdvancedPatterns(message) {
    const msgLower = message.toLowerCase();

    // Pattern più complessi per quando l'AI non è disponibile
    const advancedPatterns = [
        {
            regex: /ordini?\s+del?\s+(\d{4})/i,
            action: (match) => {
                const year = match[1];
                appendMessage(`🔍 Cerco ordini del ${year}...`, "bot-message");
                const start = new Date(`${year}-01-01`);
                const end = new Date(`${year}-12-31`);
                getSAPEntityData("PurchaseOrderSet", null, { start, end });
            }
        },
        {
            regex: /ordini?\s+(?:del\s+)?fornitore?\s+(.+)/i,
            action: (match) => {
                const vendor = match[1].trim();
                appendMessage(`🔍 Cerco ordini del fornitore "${vendor}"...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, null, vendor);
            }
        },
        {
            regex: /(?:lista|elenco)\s+(?:dei\s+)?fornitori/i,
            action: () => {
                appendMessage("🔍 Recupero elenco fornitori...", "bot-message");
                listVendors();
            }
        },
        {
            regex: /ordini?\s+(?:del\s+)?fornitore?\s+(.+?)\s+(?:dell'|del|per l')?\s*(\d{4})/i,
            action: (match) => {
                const vendor = match[1].trim();
                const year = match[2];
                appendMessage(`🔍 Cerco ordini del fornitore "${vendor}" per l'anno ${year}...`, "bot-message");
                const start = new Date(`${year}-01-01`);
                const end = new Date(`${year}-12-31`);
                getSAPEntityData("PurchaseOrderSet", null, { start, end }, vendor);
            }
        },
        {
            regex: /ordini?\s+(?:dell'|del|per l')?\s*(\d{4})\s+(?:del\s+)?fornitore?\s+(.+)/i,
            action: (match) => {
                const year = match[1];
                const vendor = match[2].trim();
                appendMessage(`🔍 Cerco ordini del fornitore "${vendor}" per l'anno ${year}...`, "bot-message");
                const start = new Date(`${year}-01-01`);
                const end = new Date(`${year}-12-31`);
                getSAPEntityData("PurchaseOrderSet", null, { start, end }, vendor);
            }
        },
        {
            regex: /ordini?\s+(?:di|del|del mese di|del mese)\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|\d{1,2})\s+(\d{4})/i,
            action: (match) => {
                const monthInput = match[1];
                const year = match[2];
                const month = getMonthNumber(monthInput);

                if (month < 1 || month > 12) {
                    appendMessage("❌ Mese non valido", "bot-message");
                    return;
                }

                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                const monthName = new Date(year, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' });

                appendMessage(`🔍 Cerco ordini di ${monthName} ${year}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
            }
        },
        {
            regex: /ordini?\s+(?:di|del|del mese di|del mese)\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|\d{1,2})(?!\s+\d{4})/i,
            action: (match) => {
                const monthInput = match[1];
                const month = getMonthNumber(monthInput);

                if (month < 1 || month > 12) {
                    appendMessage("❌ Mese non valido", "bot-message");
                    return;
                }

                const monthName = new Date(2024, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' });
                appendMessage(`🔍 Cerco tutti gli ordini di ${monthName} (tutti gli anni)...`, "bot-message");
                getSAPEntityData_withMonthFilter("PurchaseOrderSet", month);
            }
        },
        {
            regex: /ordini?\s+(?:del|di oggi|del giorno)\s*(\d{1,2}\/\d{1,2}\/\d{4})?/i,
            action: (match) => {
                let dateStr = match[1];

                if (!dateStr) {
                    // Se non è specificata una data, usa oggi
                    const today = new Date();
                    dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
                }

                const targetDate = parseDate(dateStr);
                const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

                appendMessage(`🔍 Cerco ordini del ${dateStr}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
            }
        },
        {
            regex: /ordini?\s+del\s+(\d{1,2})\/(\d{4})/i,
            action: (match) => {
                const month = parseInt(match[1]);
                const year = match[2];

                if (month < 1 || month > 12) {
                    appendMessage("❌ Mese non valido", "bot-message");
                    return;
                }

                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                const monthName = new Date(year, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' });

                appendMessage(`🔍 Cerco ordini di ${monthName} ${year}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
            }
        }
    ];

    for (const pattern of advancedPatterns) {
        const match = message.match(pattern.regex);
        if (match) {
            pattern.action(match);
            return true;
        }
    }

    return false;
}

/**
 * 🔧 Fallback per estrarre informazioni da testo quando il JSON non funziona
 * @param {string} text - Il testo da analizzare
 * @returns {boolean} - True se è riuscito a estrarre e eseguire un'azione
 */
function parseAndExecuteFromText(text) {
    try {
        // 🔍 Cerca pattern JSON nascosto nel testo
        const jsonMatch = text.match(/\{[^}]*"action"[^}]*\}/);
        if (jsonMatch) {
            const aiResponse = JSON.parse(jsonMatch[0]);
            executeAIAction(aiResponse);
            return true; // ✅ Trovato e gestito JSON
        }

        // 🔤 Converte in minuscolo per pattern matching
        const textLower = text.toLowerCase();

        // 📅 Pattern per range di date (es: "01/03/2022 e 01/06/2022")
        const dateRangeMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}).*?(\d{1,2}\/\d{1,2}\/\d{4})/);
        if (dateRangeMatch && (textLower.includes('tra') || textLower.includes('dal') || textLower.includes('between'))) {
            executeAIAction({
                action: "show_orders_by_date_range",
                parameters: {
                    startDate: dateRangeMatch[1],
                    endDate: dateRangeMatch[2]
                },
                response: `Cerco ordini tra il ${dateRangeMatch[1]} e il ${dateRangeMatch[2]}`
            });
            return true; // ✅ Gestito range date
        }

        // 📅 Pattern per range di anni (es: "2020 e 2022")
        const yearRangeMatch = text.match(/(\d{4}).*?(\d{4})/);
        if (yearRangeMatch && (textLower.includes('tra') || textLower.includes('dal') || textLower.includes('between'))) {
            executeAIAction({
                action: "show_orders_by_year_range",
                parameters: {
                    startYear: yearRangeMatch[1],
                    endYear: yearRangeMatch[2]
                },
                response: `Cerco ordini dal ${yearRangeMatch[1]} al ${yearRangeMatch[2]}`
            });
            return true; // ✅ Gestito range anni
        }

        // 📅 Pattern "dopo" una data/anno
        const afterMatch = text.match(/dopo.*?(\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
        if (afterMatch) {
            executeAIAction({
                action: "show_orders_by_date_filter",
                parameters: {
                    filterDate: afterMatch[1],
                    dateOperator: "after"
                },
                response: `Cerco ordini dopo il ${afterMatch[1]}`
            });
            return true; // ✅ Gestito filtro "dopo"
        }

        // 📅 Pattern "prima" di una data/anno
        const beforeMatch = text.match(/prima.*?(\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
        if (beforeMatch) {
            executeAIAction({
                action: "show_orders_by_date_filter",
                parameters: {
                    filterDate: beforeMatch[1],
                    dateOperator: "before"
                },
                response: `Cerco ordini prima del ${beforeMatch[1]}`
            });
            return true; // ✅ Gestito filtro "prima"
        }

        // 🔐 Pattern per rilascio ordine
        const releaseMatch = text.match(/rilascia(.*?ordine)?.*?(\d{10})?/i); // Aggiunto '?' per rendere l'ID opzionale
        if (releaseMatch) {
            let orderId = releaseMatch[2]; // Prende il gruppo catturato per l'ID (se presente)

            if (!orderId) {
                // Se non c'è un ID nel messaggio, prova a prenderlo dal contesto
                const currentOrderId = sessionStorage.getItem("currentOrderId");
                if (currentOrderId) {
                    orderId = currentOrderId;
                    appendMessage(`🤖 Rilascio l'ordine attualmente visualizzato (${orderId})...`, "bot-message");
                }
            }

            if (orderId) {
                executeAIAction({
                    action: "release_order",
                    parameters: {
                        orderId: orderId
                    },
                    response: `Rilascio ordine ${orderId}`
                });
                return true;
            } else {
                appendMessage("❌ Non è stato specificato alcun numero d'ordine per il rilascio.", "bot-message");
                return false;
            }
        }

    } catch (e) {
        // 🐛 Errore nel parsing fallback
        console.log("Errore parsing fallback:", e);
    }

    return false; // ❌ Nessun pattern riconosciuto
}

/**
 * 🎯 Esegue l'azione determinata dall'AI
 * @param {Object} aiResponse - Oggetto con action, parameters e response dall'AI
 */
function executeAIAction(aiResponse) {
    const { action, parameters, response } = aiResponse;

    // 💬 Mostra il messaggio di risposta dell'AI se presente
    if (response) {
        appendMessage(response, "bot-message");
    }

    // 🔀 Switch per eseguire l'azione appropriata
    switch (action) {
        case "show_all_orders":
            // 📋 Mostra tutti gli ordini
            appendMessage("🔍 Recupero tutti gli ordini...", "bot-message");
            getSAPEntityData("PurchaseOrderSet");
            break;

        case "show_specific_order":
            // 🔢 Mostra un ordine specifico
            if (parameters.orderId) {
                appendMessage(`🔍 Recupero l'ordine ${parameters.orderId}...`, "bot-message");
                getSingleOrder(parameters.orderId);
            } else {
                appendMessage("❌ Numero ordine non specificato", "bot-message");
            }
            break;

        case "show_orders_by_vendor":
            // 🏢 Mostra ordini di un fornitore specifico
            if (parameters.vendorName) {
                appendMessage(`🔍 Cerco ordini del fornitore "${parameters.vendorName}"...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, null, parameters.vendorName);
            } else {
                appendMessage("❌ Nome fornitore non specificato", "bot-message");
            }
            break;

        case "show_orders_by_date_range":
            // 📅 Mostra ordini in un range di date
            if (parameters.startDate && parameters.endDate) {
                const startDate = parseDate(parameters.startDate);
                const endDate = parseDate(parameters.endDate);
                appendMessage(`🔍 Cerco ordini tra il ${parameters.startDate} e il ${parameters.endDate}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
            } else {
                appendMessage("❌ Date di inizio e fine non specificate", "bot-message");
            }
            break;

        case "show_orders_by_date_filter":
            // 📅 Mostra ordini prima/dopo una data specifica
            if (parameters.filterDate && parameters.dateOperator) {
                const filterDate = parseDate(parameters.filterDate);
                const operator = parameters.dateOperator === "before" ? "<" : ">";
                const operatorText = parameters.dateOperator === "before" ? "prima del" : "dopo il";
                appendMessage(`🔍 Cerco ordini ${operatorText} ${parameters.filterDate}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { operator, date: filterDate });
            } else {
                appendMessage("❌ Data e operatore non specificati", "bot-message");
            }
            break;

        case "show_orders_by_year_range":
            // 📅 Mostra ordini in un range di anni
            if (parameters.startYear && parameters.endYear) {
                const startDate = new Date(`${parameters.startYear}-01-01`);
                const endDate = new Date(`${parameters.endYear}-12-31`);
                appendMessage(`🔍 Cerco ordini dal ${parameters.startYear} al ${parameters.endYear}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
            } else {
                appendMessage("❌ Anni di inizio e fine non specificati", "bot-message");
            }
            break;

        case "list_vendors":
            // 🏢 Lista tutti i fornitori
            appendMessage("🔍 Recupero elenco fornitori...", "bot-message");
            listVendors();
            break;

        case "show_orders_by_year":
            // 📅 Mostra ordini di un anno specifico
            if (parameters.year) {
                const year = parseInt(parameters.year);
                const start = new Date(`${year}-01-01`);
                const end = new Date(`${year}-12-31`);
                appendMessage(`🔍 Cerco ordini del ${year}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start, end });
            } else {
                appendMessage("❌ Anno non specificato", "bot-message");
            }
            break;
        case "show_orders_by_vendor_and_year":
            // 🏢📅 Mostra ordini di un fornitore specifico per un anno specifico
            if (parameters.vendorName && parameters.year) {
                const year = parseInt(parameters.year);
                const startDate = new Date(`${year}-01-01`);
                const endDate = new Date(`${year}-12-31`);
                appendMessage(`🔍 Cerco ordini del fornitore "${parameters.vendorName}" per l'anno ${year}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate }, parameters.vendorName);
            } else {
                appendMessage("❌ Nome fornitore e/o anno non specificati per la ricerca combinata.", "bot-message");
            }
            break;

        case "chat":
        default:
            // 💬 Risposta conversazionale normale
            if (!response) {
                appendMessage("🤖 Non ho capito la richiesta. Puoi essere più specifico?", "bot-message");
            }
            break;

        // NUOVI CASI PER ORDINI RILASCIATI/NON RILASCIATI
        case "show_released_orders":
            // ✅ Mostra solo ordini rilasciati
            appendMessage("🔍 Recupero tutti gli ordini rilasciati...", "bot-message");
            getSAPEntityData("PurchaseOrderSet", null, null, null, { released: true });
            break;

        case "show_unreleased_orders":
            // ❌ Mostra solo ordini non rilasciati
            appendMessage("🔍 Recupero tutti gli ordini non rilasciati...", "bot-message");
            getSAPEntityData("PurchaseOrderSet", null, null, null, { released: false });
            break;
        case "release_order":
            // 🔐 Rilascia un ordine specifico
            let orderToRelease = parameters.orderId;

            if (!orderToRelease) {
                // Se l'AI non ha fornito un orderId, controlla se c'è un ordine in contesto
                const currentOrderId = sessionStorage.getItem("currentOrderId");
                if (currentOrderId) {
                    orderToRelease = currentOrderId;
                    appendMessage(`🤖 Ho rilevato che vuoi rilasciare l'ordine attualmente visualizzato (${orderToRelease})...`, "bot-message");
                }
            }

            if (orderToRelease) {
                appendMessage(`🔐 Rilascio ordine ${orderToRelease}...`, "bot-message");
                releaseOrder(orderToRelease);
            } else {
                appendMessage("❌ Non è stato specificato alcun numero d'ordine da rilasciare e nessun ordine è attualmente visualizzato.", "bot-message");
            }
            break;

        case "show_orders_by_month_year":
            // 📅 Mostra ordini di un mese specifico di un anno
            if ((parameters.month || parameters.monthName) && parameters.year) {
                const month = parameters.month || getMonthNumber(parameters.monthName);
                const year = parseInt(parameters.year);

                if (month < 1 || month > 12) {
                    appendMessage("❌ Mese non valido", "bot-message");
                    break;
                }

                const startDate = new Date(year, month - 1, 1); // month-1 perché Date usa 0=gennaio
                const endDate = new Date(year, month, 0); // Ultimo giorno del mese

                const monthName = new Date(year, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' });
                appendMessage(`🔍 Cerco ordini di ${monthName} ${year}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
            } else {
                appendMessage("❌ Mese e anno non specificati", "bot-message");
            }
            break;

        case "show_orders_by_day":
            // 📅 Mostra ordini di un giorno specifico
            if (parameters.specificDate) {
                const targetDate = parseDate(parameters.specificDate);
                const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

                appendMessage(`🔍 Cerco ordini del ${parameters.specificDate}...`, "bot-message");
                getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
            } else {
                appendMessage("❌ Data non specificata", "bot-message");
            }
            break;

        case "show_orders_by_month":
            // 📅 Mostra ordini di un mese specifico (tutti gli anni)
            if (parameters.month || parameters.monthName) {
                const month = parameters.month || getMonthNumber(parameters.monthName);

                if (month < 1 || month > 12) {
                    appendMessage("❌ Mese non valido", "bot-message");
                    break;
                }

                const monthName = new Date(2024, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' });
                appendMessage(`🔍 Cerco tutti gli ordini di ${monthName} (tutti gli anni)...`, "bot-message");

                // Per questo caso, dobbiamo modificare la funzione getSAPEntityData per supportare il filtro solo per mese
                getSAPEntityData_withMonthFilter("PurchaseOrderSet", month);
            } else {
                appendMessage("❌ Mese non specificato", "bot-message");
            }
            break;
    }
}