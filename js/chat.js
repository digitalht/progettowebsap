// 🗨️ GESTIONE MESSAGGI CHAT E AI
// ============chat.js===================

function appendMessage(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.textContent = text;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    console.log("ciao")


    saveChatMessage(text, className);

    if (className === "bot-message" && isVoiceModeActive) {
        speakText(text);
    }
}

function saveChatMessage(text, className) {
    const history = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
    history.push({ text, className });
    sessionStorage.setItem("chatHistory", JSON.stringify(history));
    console.log("💾 Chat salvata in sessionStorage:", history);
    console.log("✅ Messaggio salvato:", { text, className });
    console.log("📦 sessionStorage attuale:", JSON.parse(sessionStorage.getItem("chatHistory")));
}


function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    appendMessage(message, "user-message");
    userInput.value = "";

    if (tryQuickPatterns(message)) {
        return;
    }

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

Rispondi SEMPRE in questo formato JSON:
{
  "action": "nome_funzione",
  "parameters": {
    "orderId": "numero_ordine_se_necessario",
    "vendorName": "nome_fornitore_se_necessario",
    "year": "anno_se_necessario",
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

        case "chat":
        default:
            // 💬 Risposta conversazionale normale
            if (!response) {
                appendMessage("🤖 Non ho capito la richiesta. Puoi essere più specifico?", "bot-message");
            }
            break;

        // case "release_order":

        //     // 🔐 Rilascia un ordine specifico
        //     if (parameters.orderId) {
        //         appendMessage(`🔐 Rilascio ordine ${parameters.orderId}...`, "bot-message");
        //         releaseOrder(parameters.orderId);
        //     } else {
        //         appendMessage("❌ Numero ordine non specificato per il rilascio", "bot-message");
        //     }
        //     break;
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
    }
}