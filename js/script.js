//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// *****************************************************************
//   CODICE NODE
// *****************************************************************
// // 🎯 CONFIGURAZIONE INIZIALE E VARIABILI GLOBALI
// // ===================================================

// // 📦 Recupera gli elementi HTML principali dell'interfaccia utente
// const chatBox = document.getElementById("chat-box");           // 💬 Contenitore dei messaggi di chat
// const userInput = document.getElementById("user-input");       // ✏️ Campo di input per l'utente
// const sendBtn = document.getElementById("send-btn");           // 📤 Pulsante per inviare messaggi
// const sapResults = document.getElementById("sap-results");     // 📊 Area per mostrare i risultati SAP

// // 📋 Coda per gestire i messaggi di sintesi vocale
// const messageQueue = [];

// // 🔐 Chiave API per OpenAI (⚠️ IMPORTANTE: In produzione usa variabili d'ambiente!)
// const apiKey = "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";

// // 🗨️ GESTIONE MESSAGGI CHAT
// // ===========================

// /**
//  * 💬 Aggiunge un nuovo messaggio nella chat (utente o bot)
//  * @param {string} text - Il testo del messaggio
//  * @param {string} className - La classe CSS per lo stile (user-message o bot-message)
//  */
// function appendMessage(text, className) {
//     // 🏗️ Crea un nuovo elemento div per il messaggio
//     const messageDiv = document.createElement("div");
//     messageDiv.className = className;
//     messageDiv.textContent = text;

//     // ➕ Aggiunge il messaggio alla chat
//     chatBox.appendChild(messageDiv);

//     // 📜 Fa scorrere automaticamente la chat verso il basso
//     chatBox.scrollTop = chatBox.scrollHeight;

//     // 💾 Salva il messaggio nella cronologia locale
//     saveChatMessage(text, className);
// }

// /**
//  * 💾 Salva un messaggio nella cronologia del browser (localStorage)
//  * @param {string} text - Il testo del messaggio
//  * @param {string} className - La classe CSS del messaggio
//  */
// function saveChatMessage(text, className) {
//     // 📚 Recupera la cronologia esistente o crea un array vuoto
//     const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");

//     // ➕ Aggiunge il nuovo messaggio alla cronologia
//     history.push({ text, className });

//     // 💾 Salva la cronologia aggiornata
//     localStorage.setItem("chatHistory", JSON.stringify(history));
// }

// // 🚀 INVIO E GESTIONE MESSAGGI
// // =============================

// /**
//  * 📤 Gestisce l'invio di un messaggio dell'utente
//  */
// function sendMessage() {
//     // ✂️ Rimuove spazi inutili dal messaggio
//     const message = userInput.value.trim();

//     // 🚫 Se il messaggio è vuoto, non fare nulla
//     if (message === "") return;

//     // 💬 Mostra il messaggio dell'utente nella chat
//     appendMessage(message, "user-message");

//     // 🧹 Pulisce il campo di input
//     userInput.value = "";

//     // ⚡ Prima prova con pattern veloci per richieste comuni
//     if (tryQuickPatterns(message)) {
//         return; // 🎯 Se trova un pattern veloce, esce dalla funzione
//     }

//     // 🤖 Se non trova pattern veloci, usa l'AI per interpretare il messaggio
//     callOpenAIWithFunctions(message);
// }

// // 🏃‍♂️ PATTERN VELOCI PER RICHIESTE COMUNI
// // ==========================================

// /**
//  * ⚡ Prova pattern veloci per richieste precise e comuni
//  * @param {string} message - Il messaggio dell'utente
//  * @returns {boolean} - True se ha trovato e gestito un pattern veloce
//  */
// function tryQuickPatterns(message) {
//     // 🎯 Array di pattern predefiniti con regex e azioni corrispondenti
//     const patterns = [
//         {
//             // 📋 Pattern per "tutti gli ordini" 
//             regex: /^tutti.*ordini$/i,
//             action: () => {
//                 appendMessage("🔍 Recupero tutti gli ordini...", "bot-message");
//                 getSAPEntityData("PurchaseOrderSet");
//             }
//         },
//         {
//             // 🔢 Pattern per ordine specifico (es: "ordine 4500000869")
//             regex: /^ordine\s+(\d{10})$/i,
//             action: (match) => {
//                 const orderId = match[1]; // 🎯 Estrae il numero ordine
//                 appendMessage(`🔍 Recupero l'ordine ${orderId}...`, "bot-message");
//                 getSingleOrder(orderId);
//             }
//         }
//     ];

//     // 🔍 Cerca un pattern che corrisponda al messaggio
//     for (const pattern of patterns) {
//         const match = message.match(pattern.regex);
//         if (match) {
//             pattern.action(match); // 🎬 Esegue l'azione corrispondente
//             return true; // ✅ Trovato e gestito
//         }
//     }
//     return false; // ❌ Nessun pattern trovato
// }

// // 🤖 INTEGRAZIONE CON OPENAI
// // ===========================

// /**
//  * 🤖 Chiama OpenAI per interpretare il messaggio e determinare l'azione
//  * @param {string} message - Il messaggio dell'utente da interpretare
//  */
// function callOpenAIWithFunctions(message) {
//     // 🔄 Mostra messaggio di elaborazione
//     appendMessage("🤖 Sto elaborando la tua richiesta...", "bot-message");

//     // 📋 Prompt di sistema per istruire l'AI su come comportarsi
//     const systemPrompt = `Sei un assistente SAP intelligente. Analizza la richiesta dell'utente e determina quale azione eseguire.

// FUNZIONI DISPONIBILI:
// 1. "show_all_orders" - mostra tutti gli ordini
// 2. "show_specific_order" - mostra un ordine specifico (serve il numero ordine)
// 3. "show_orders_by_vendor" - mostra ordini di un fornitore specifico
// 4. "show_orders_by_date_range" - mostra ordini tra due date specifiche
// 5. "show_orders_by_date_filter" - mostra ordini prima/dopo una data
// 6. "show_orders_by_year_range" - mostra ordini tra due anni
// 7. "list_vendors" - elenca tutti i fornitori
// 8. "show_orders_by_year" - mostra ordini di un anno specifico

// ESEMPI DI RICHIESTE CHE DEVI RICONOSCERE:
// - "tutti gli ordini", "mostra ordini", "visualizza tutti gli ordini" → show_all_orders
// - "ordine 4500000869", "mostra ordine numero 123", "dettagli ordine" → show_specific_order
// - "ordini SAP ITALIA", "ordini fornitore Mario Rossi" → show_orders_by_vendor
// - "fornitori disponibili", "che fornitori ci sono" → list_vendors
// - "ordini 2024", "ordini del 2023" → show_orders_by_year
// - "ordini tra il 01/03/2022 e il 01/06/2022", "ordini dal 15/01/2023 al 20/12/2023" → show_orders_by_date_range
// - "ordini dopo il 2023", "ordini prima del 2022", "ordini dopo il 15/05/2023" → show_orders_by_date_filter  
// - "ordini tra il 2020 e il 2022", "ordini dal 2019 al 2023" → show_orders_by_year_range

// Rispondi SEMPRE in questo formato JSON:
// {
//   "action": "nome_funzione",
//   "parameters": {
//     "orderId": "numero_ordine_se_necessario",
//     "vendorName": "nome_fornitore_se_necessario",
//     "year": "anno_se_necessario",
//     "startDate": "data_inizio_se_necessario_formato_dd/mm/yyyy",
//     "endDate": "data_fine_se_necessario_formato_dd/mm/yyyy",
//     "dateOperator": "before_o_after_se_necessario",
//     "filterDate": "data_filtro_se_necessario_formato_dd/mm/yyyy_o_yyyy",
//     "startYear": "anno_inizio_se_necessario",
//     "endYear": "anno_fine_se_necessario"
//   },
//   "response": "messaggio_per_utente"
// }

// Se non capisci la richiesta, usa "action": "chat" per una risposta normale.`;

//     // 🌐 Chiamata API a OpenAI
//     fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${apiKey}` // 🔐 Autorizzazione con API key
//         },
//         body: JSON.stringify({
//             model: "gpt-3.5-turbo",              // 🤖 Modello AI da utilizzare
//             messages: [
//                 { role: "system", content: systemPrompt }, // 📋 Istruzioni per l'AI
//                 { role: "user", content: message }         // 💬 Messaggio dell'utente
//             ],
//             temperature: 0.1 // 🌡️ Bassa creatività per risposte precise
//         })
//     })
//         .then(res => res.json()) // 📥 Converte la risposta in JSON
//         .then(data => {
//             // 📥 Estrae la risposta dell'AI
//             const reply = data.choices?.[0]?.message?.content || "🤖 Nessuna risposta.";

//             try {
//                 // 🧹 Pulisce la risposta da eventuali formattazioni markdown
//                 let jsonContent = reply.trim();

//                 // 🔧 Rimuove i backticks del markdown se presenti
//                 if (jsonContent.startsWith('```json')) {
//                     jsonContent = jsonContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
//                 } else if (jsonContent.startsWith('```')) {
//                     jsonContent = jsonContent.replace(/```\s*/, '').replace(/```\s*$/, '');
//                 }


//                 // 📖 Prova a parsare come JSON
//                 const aiResponse = JSON.parse(jsonContent);

//                 // ✅ Verifica che sia un oggetto valido con action
//                 if (aiResponse && typeof aiResponse === 'object' && aiResponse.action) {
//                     executeAIAction(aiResponse); // 🎬 Esegue l'azione determinata dall'AI
//                 } else {
//                     // 💬 Se non ha la struttura corretta, mostra come messaggio normale
//                     appendMessage(reply, "bot-message");
//                 }
//             } catch (e) {
//                 // 🐛 Gestisce errori di parsing JSON
//                 console.log("Errore parsing JSON:", e);
//                 console.log("Contenuto ricevuto:", reply);

//                 // 🔄 Fallback: prova a estrarre informazioni dal testo
//                 if (parseAndExecuteFromText(reply)) {
//                     return;
//                 }

//                 // 💬 Se tutto fallisce, mostra come messaggio normale
//                 appendMessage(reply, "bot-message");
//             }
//         })
//         .catch(err => {
//             // ❌ Gestisce errori della chiamata API
//             console.error("Errore AI:", err);
//             appendMessage("❌ Errore con l'AI. Riprova.", "bot-message");
//         });
// }

// // 🔧 PARSING FALLBACK PER TESTI NON-JSON
// // ========================================

// /**
//  * 🔧 Fallback per estrarre informazioni da testo quando il JSON non funziona
//  * @param {string} text - Il testo da analizzare
//  * @returns {boolean} - True se è riuscito a estrarre e eseguire un'azione
//  */
// function parseAndExecuteFromText(text) {
//     try {
//         // 🔍 Cerca pattern JSON nascosto nel testo
//         const jsonMatch = text.match(/\{[^}]*"action"[^}]*\}/);
//         if (jsonMatch) {
//             const aiResponse = JSON.parse(jsonMatch[0]);
//             executeAIAction(aiResponse);
//             return true; // ✅ Trovato e gestito JSON
//         }

//         // 🔤 Converte in minuscolo per pattern matching
//         const textLower = text.toLowerCase();

//         // 📅 Pattern per range di date (es: "01/03/2022 e 01/06/2022")
//         const dateRangeMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}).*?(\d{1,2}\/\d{1,2}\/\d{4})/);
//         if (dateRangeMatch && (textLower.includes('tra') || textLower.includes('dal') || textLower.includes('between'))) {
//             executeAIAction({
//                 action: "show_orders_by_date_range",
//                 parameters: {
//                     startDate: dateRangeMatch[1],
//                     endDate: dateRangeMatch[2]
//                 },
//                 response: `Cerco ordini tra il ${dateRangeMatch[1]} e il ${dateRangeMatch[2]}`
//             });
//             return true; // ✅ Gestito range date
//         }

//         // 📅 Pattern per range di anni (es: "2020 e 2022")
//         const yearRangeMatch = text.match(/(\d{4}).*?(\d{4})/);
//         if (yearRangeMatch && (textLower.includes('tra') || textLower.includes('dal') || textLower.includes('between'))) {
//             executeAIAction({
//                 action: "show_orders_by_year_range",
//                 parameters: {
//                     startYear: yearRangeMatch[1],
//                     endYear: yearRangeMatch[2]
//                 },
//                 response: `Cerco ordini dal ${yearRangeMatch[1]} al ${yearRangeMatch[2]}`
//             });
//             return true; // ✅ Gestito range anni
//         }

//         // 📅 Pattern "dopo" una data/anno
//         const afterMatch = text.match(/dopo.*?(\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
//         if (afterMatch) {
//             executeAIAction({
//                 action: "show_orders_by_date_filter",
//                 parameters: {
//                     filterDate: afterMatch[1],
//                     dateOperator: "after"
//                 },
//                 response: `Cerco ordini dopo il ${afterMatch[1]}`
//             });
//             return true; // ✅ Gestito filtro "dopo"
//         }

//         // 📅 Pattern "prima" di una data/anno
//         const beforeMatch = text.match(/prima.*?(\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
//         if (beforeMatch) {
//             executeAIAction({
//                 action: "show_orders_by_date_filter",
//                 parameters: {
//                     filterDate: beforeMatch[1],
//                     dateOperator: "before"
//                 },
//                 response: `Cerco ordini prima del ${beforeMatch[1]}`
//             });
//             return true; // ✅ Gestito filtro "prima"
//         }

//     } catch (e) {
//         // 🐛 Errore nel parsing fallback
//         console.log("Errore parsing fallback:", e);
//     }

//     return false; // ❌ Nessun pattern riconosciuto
// }

// // 🎯 ESECUZIONE AZIONI AI
// // ========================

// /**
//  * 🎯 Esegue l'azione determinata dall'AI
//  * @param {Object} aiResponse - Oggetto con action, parameters e response dall'AI
//  */
// function executeAIAction(aiResponse) {
//     const { action, parameters, response } = aiResponse;

//     // 💬 Mostra il messaggio di risposta dell'AI se presente
//     if (response) {
//         appendMessage(response, "bot-message");
//     }

//     // 🔀 Switch per eseguire l'azione appropriata
//     switch (action) {
//         case "show_all_orders":
//             // 📋 Mostra tutti gli ordini
//             appendMessage("🔍 Recupero tutti gli ordini...", "bot-message");
//             getSAPEntityData("PurchaseOrderSet");
//             break;

//         case "show_specific_order":
//             // 🔢 Mostra un ordine specifico
//             if (parameters.orderId) {
//                 appendMessage(`🔍 Recupero l'ordine ${parameters.orderId}...`, "bot-message");
//                 getSingleOrder(parameters.orderId);
//             } else {
//                 appendMessage("❌ Numero ordine non specificato", "bot-message");
//             }
//             break;

//         case "show_orders_by_vendor":
//             // 🏢 Mostra ordini di un fornitore specifico
//             if (parameters.vendorName) {
//                 appendMessage(`🔍 Cerco ordini del fornitore "${parameters.vendorName}"...`, "bot-message");
//                 getSAPEntityData("PurchaseOrderSet", null, null, parameters.vendorName);
//             } else {
//                 appendMessage("❌ Nome fornitore non specificato", "bot-message");
//             }
//             break;

//         case "show_orders_by_date_range":
//             // 📅 Mostra ordini in un range di date
//             if (parameters.startDate && parameters.endDate) {
//                 const startDate = parseDate(parameters.startDate);
//                 const endDate = parseDate(parameters.endDate);
//                 appendMessage(`🔍 Cerco ordini tra il ${parameters.startDate} e il ${parameters.endDate}...`, "bot-message");
//                 getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
//             } else {
//                 appendMessage("❌ Date di inizio e fine non specificate", "bot-message");
//             }
//             break;

//         case "show_orders_by_date_filter":
//             // 📅 Mostra ordini prima/dopo una data specifica
//             if (parameters.filterDate && parameters.dateOperator) {
//                 const filterDate = parseDate(parameters.filterDate);
//                 const operator = parameters.dateOperator === "before" ? "<" : ">";
//                 const operatorText = parameters.dateOperator === "before" ? "prima del" : "dopo il";
//                 appendMessage(`🔍 Cerco ordini ${operatorText} ${parameters.filterDate}...`, "bot-message");
//                 getSAPEntityData("PurchaseOrderSet", null, { operator, date: filterDate });
//             } else {
//                 appendMessage("❌ Data e operatore non specificati", "bot-message");
//             }
//             break;

//         case "show_orders_by_year_range":
//             // 📅 Mostra ordini in un range di anni
//             if (parameters.startYear && parameters.endYear) {
//                 const startDate = new Date(`${parameters.startYear}-01-01`);
//                 const endDate = new Date(`${parameters.endYear}-12-31`);
//                 appendMessage(`🔍 Cerco ordini dal ${parameters.startYear} al ${parameters.endYear}...`, "bot-message");
//                 getSAPEntityData("PurchaseOrderSet", null, { start: startDate, end: endDate });
//             } else {
//                 appendMessage("❌ Anni di inizio e fine non specificati", "bot-message");
//             }
//             break;

//         case "list_vendors":
//             // 🏢 Lista tutti i fornitori
//             appendMessage("🔍 Recupero elenco fornitori...", "bot-message");
//             listVendors();
//             break;

//         case "show_orders_by_year":
//             // 📅 Mostra ordini di un anno specifico
//             if (parameters.year) {
//                 const year = parseInt(parameters.year);
//                 const start = new Date(`${year}-01-01`);
//                 const end = new Date(`${year}-12-31`);
//                 appendMessage(`🔍 Cerco ordini del ${year}...`, "bot-message");
//                 getSAPEntityData("PurchaseOrderSet", null, { start, end });
//             } else {
//                 appendMessage("❌ Anno non specificato", "bot-message");
//             }
//             break;

//         case "chat":
//         default:
//             // 💬 Risposta conversazionale normale
//             if (!response) {
//                 appendMessage("🤖 Non ho capito la richiesta. Puoi essere più specifico?", "bot-message");
//             }
//             break;
//     }
// }

// // 📅 UTILITÀ PER GESTIONE DATE
// // =============================

// /**
//  * 📅 Funzione per parsare le date in vari formati
//  * @param {string} dateStr - Stringa della data da parsare
//  * @returns {Date|null} - Oggetto Date o null se parsing fallisce
//  */
// function parseDate(dateStr) {
//     if (!dateStr) return null;

//     // 📅 Se è solo un anno (es. "2023")
//     if (/^\d{4}$/.test(dateStr)) {
//         return new Date(`${dateStr}-01-01`);
//     }

//     // 📅 Se è formato italiano dd/mm/yyyy
//     if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
//         const [day, month, year] = dateStr.split('/');
//         return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
//     }

//     // 📅 Se è formato mm/yyyy
//     if (/^\d{1,2}\/\d{4}$/.test(dateStr)) {
//         const [month, year] = dateStr.split('/');
//         return new Date(`${year}-${month.padStart(2, '0')}-01`);
//     }

//     // 🔄 Fallback: prova a parsare direttamente
//     return new Date(dateStr);
// }

// // 🔍 FUNZIONI SAP - RECUPERO DATI
// // ================================

// /**
//  * 🔍 Recupera un ordine specifico da SAP
//  * @param {string} orderId - ID dell'ordine da recuperare
//  */
// function getSingleOrder(orderId) {
//     // 🔄 Mostra messaggio di caricamento
//     sapResults.innerHTML = "🔄 Caricamento ordine...";

//     // 🌐 URL per la chiamata SAP
//     const url = `http://localhost:3000/sap/PurchaseOrderSet`;

//     // 📡 Chiamata HTTP a SAP
//     fetch(url, {
//         method: "GET",
//         headers: {
//             "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione basic
//             "Accept": "application/json" // 📥 Richiede risposta JSON
//         }
//     })
//         .then(response => response.json()) // 📥 Converte risposta in JSON
//         .then(data => {
//             // ✅ Verifica che ci siano dati
//             if (data.d && data.d.results && data.d.results.length > 0) {
//                 // 🔍 Cerca l'ordine specifico nell'array
//                 const order = data.d.results.find(item => item.OrderNr === orderId);
//                 if (order) {
//                     renderOrderDetails(order); // 🎨 Renderizza i dettagli dell'ordine
//                 } else {
//                     sapResults.innerHTML = `❌ Ordine ${orderId} non trovato.`;
//                 }
//             } else {
//                 sapResults.innerHTML = "❌ Nessun dato ricevuto da SAP.";
//             }
//         })
//         .catch(error => {
//             // ❌ Gestisce errori di rete o SAP
//             console.error("Errore SAP:", error);
//             sapResults.innerHTML = `❌ Errore durante il recupero ordine: ${error.message}`;
//         });
// }

// /**
//  * 🔄 Recupera dati da entità SAP generica con filtri opzionali
//  * @param {string} entity - Nome dell'entità SAP (es: "PurchaseOrderSet")
//  * @param {string|null} filterOrder - ID ordine specifico da filtrare
//  * @param {Object|null} dateFilter - Filtro per date (start/end o operator/date)
//  * @param {string|null} vendorName - Nome fornitore per filtrare
//  */
// function getSAPEntityData(entity, filterOrder = null, dateFilter = null, vendorName = null) {
//     // 🔄 Mostra messaggio di caricamento
//     sapResults.innerHTML = "🔄 Caricamento dati...";
//     const url = `http://localhost:3000/sap/${entity}`;

//     // 📡 Chiamata HTTP a SAP
//     fetch(url, {
//         method: "GET",
//         headers: {
//             "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione
//             "Accept": "application/json" // 📥 Richiede JSON
//         }
//     })
//         .then(async response => {
//             // 📋 Verifica il tipo di contenuto della risposta
//             const contentType = response.headers.get("content-type");
//             if (!response.ok) throw new Error(await response.text());
//             if (contentType.includes("application/json")) return response.json();
//             throw new Error("Risposta non in formato JSON");
//         })
//         .then(data => {
//             // 📊 Estrae i risultati dall'oggetto SAP
//             let results = data?.d?.results || [];

//             // 🔍 Filtro per ordine specifico
//             if (filterOrder) {
//                 const ordine = results.find(o => o.OrderNr === filterOrder);
//                 if (ordine) renderOrderDetails(ordine);
//                 else sapResults.innerHTML = `❌ Nessun ordine trovato con numero ${filterOrder}`;
//                 return;
//             }

//             // 📅 Filtro per date
//             if (dateFilter) {
//                 const { operator, date, start, end } = dateFilter;
//                 results = results.filter(o => {
//                     // 🔄 Converte la data SAP in formato JavaScript
//                     const sapDate = new Date(parseInt(o.MinDelivDate.match(/\d+/)?.[0] || "0"));

//                     // 📅 Applica filtri di range o operatore
//                     if (start && end) return sapDate >= start && sapDate <= end;
//                     if (operator && date) return operator === "<" ? sapDate < date : sapDate > date;

//                     return true;
//                 });
//             }

//             // 🏢 Filtro per nome fornitore
//             if (vendorName) {
//                 results = results.filter(o => o.VendorName?.toLowerCase().includes(vendorName.toLowerCase()));
//             }

//             // ⚠️ Verifica se ci sono risultati
//             if (results.length === 0) {
//                 sapResults.innerHTML = "⚠️ Nessun ordine trovato con questi criteri.";
//                 return;
//             }

//             // 🎨 Renderizza i risultati
//             renderSAPData(entity, results);
//         })
//         .catch(error => {
//             // ❌ Gestisce errori
//             console.error("Errore SAP:", error);
//             sapResults.innerHTML = `❌ Errore durante il recupero dati da SAP: ${error.message}`;
//         });
// }

// // 💾 GESTIONE STATO INTERFACCIA
// // ==============================

// /**
//  * 💾 Salva lo stato attuale dell'interfaccia nel localStorage
//  */
// function saveCurrentViewState() {
//     if (sapResults.innerHTML.trim() !== "") {
//         // 💾 Salva i risultati SAP correnti
//         localStorage.setItem("lastSapResults", sapResults.innerHTML);
//         localStorage.setItem("viewState", "results");
//     } else {
//         // 🧹 Rimuove lo stato se non ci sono risultati
//         localStorage.removeItem("lastSapResults");
//         localStorage.removeItem("viewState");
//     }
// }

// /**
//  * 🔄 Ripristina lo stato precedente dall'localStorage
//  */
// function restoreViewState() {
//     const viewState = localStorage.getItem("viewState");

//     if (viewState === "results") {
//         const savedResults = localStorage.getItem("lastSapResults");
//         if (savedResults) {
//             // 🔄 Ripristina i risultati SAP
//             sapResults.innerHTML = savedResults;

//             // 🔧 Ripristina i gestori di eventi per i pulsanti di rilascio
//             document.querySelectorAll("[onclick^='releaseOrder']").forEach(button => {
//                 const orderId = button.getAttribute("onclick").match(/'([^']+)'/)[1];
//                 button.onclick = () => releaseOrder(orderId);
//             });
//         }
//     }
// }

// // 🎨 RENDERING DATI SAP
// // =====================

// /**
//  * 🎨 Renderizza i dati SAP in formato HTML
//  * @param {string} entity - Nome dell'entità SAP
//  * @param {Array} records - Array di record da renderizzare
//  */
// function renderSAPData(entity, records) {
//     const count = records.length;

//     // 🏗️ Genera HTML per ogni record
//     const html = records.map(item => {
//         if (entity === "PurchaseOrderSet") {
//             // 📦 Template per ordini di acquisto
//             return `
//                 <div style="border:1px solid #ddd; padding:16px; margin:12px 0; border-radius:8px; background:#fafafa; box-shadow:0 2px 4px rgba(0,0,0,0.05); transition:box-shadow 0.2s;" 
//                  onmouseover="this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'" 
//                  onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
//                   <!-- 📄 Header cliccabile dell'ordine -->
//                   <div style="font-weight:600; font-size:16px; margin-bottom:8px; cursor:pointer; color:#007BFF; text-decoration:underline;" 
//                      onclick="getSingleOrder('${item.OrderNr}')">📄 Ordine #${item.OrderNr}</div>
//                      <!-- 📅 Informazioni principali dell'ordine -->
//                      <div><strong>Data:</strong> ${formatSAPDate(item.MinDelivDate)}</div>
//                      <div><strong>Fornitore:</strong> ${item.VendorName}</div>
//                      <!-- 🔐 Pulsante per rilasciare l'ordine -->
//                      <button 
//                         onclick="releaseOrder('${item.OrderNr}')" 
//                         style="margin-top:12px; background-color:#007BFF; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:500;">
//                         🔐 Rilascia ordine
//                     </button>
//                 </div>
//             `;
//         } else {
//             // 📋 Template generico per altre entità SAP
//             return `
//                 <div style="border:1px solid #ddd; padding:16px; margin:12px 0; border-radius:8px; background:#fff;">
//                     <!-- 📊 Visualizzazione dati in formato JSON -->
//                     <pre style="margin:0; font-size:14px;">${JSON.stringify(item, null, 2)}</pre>
//                 </div>
//             `;
//         }
//     }).join("");

//     // 🎨 Genera HTML finale con header e statistiche
//     sapResults.innerHTML = `
//         <h3 style="font-size:20px; font-weight:600; color:#333;">📄 Risultati da ${entity}</h3>
//         <p style="color:#155724; font-weight:500;">✅ Risultati trovati: ${count}</p>
//         ${html}
//     `;

//     // 💾 Salva i risultati nella cache e nello stato
//     localStorage.setItem("sapResultsCache", JSON.stringify({ entity, records }));
//     saveCurrentViewState();
// }

// // 🏢 GESTIONE FORNITORI
// // ======================

// /**
//  * 🏢 Recupera e mostra l'elenco di tutti i fornitori
//  */
// function listVendors() {
//     // 📡 Chiamata per recuperare gli ordini (da cui estrarre i fornitori)
//     fetch(`http://localhost:3000/sap/PurchaseOrderSet`, {
//         method: "GET",
//         headers: {
//             "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione
//             "Accept": "application/json" // 📥 Richiede JSON
//         }
//     })
//         .then(res => res.json()) // 📥 Converte in JSON
//         .then(data => {
//             const results = data?.d?.results || [];

//             // 🔍 Estrae nomi fornitori unici e li ordina alfabeticamente
//             const vendors = [...new Set(results.map(r => r.VendorName).filter(Boolean))].sort();

//             if (vendors.length === 0) {
//                 sapResults.innerHTML = "⚠️ Nessun fornitore trovato.";
//             } else {
//                 // 🎨 Genera HTML con lista fornitori
//                 sapResults.innerHTML = `
//                 <h4>🏢 Fornitori disponibili</h4>
//                 <ul style="padding-left:20px;">
//                     ${vendors.map(v => `<li>${v}</li>`).join("")}
//                 </ul>
//             `;
//             }
//         })
//         .catch(err => {
//             // ❌ Gestisce errori
//             console.error("Errore elenco fornitori:", err);
//             sapResults.innerHTML = "❌ Errore durante il recupero fornitori.";
//         });
// }

// // 📦 DETTAGLI ORDINE SPECIFICO
// // =============================

// /**
//  * 📦 Renderizza i dettagli completi di un ordine specifico
//  * @param {Object} order - Oggetto ordine con tutti i dettagli
//  */
// function renderOrderDetails(order) {
//     const orderId = order.OrderNr;

//     // 🔐 Genera HTML per pulsante rilascio (diverso se ordine già rilasciato)
//     const rilascioButtonHtml = order.IsReleased
//         ? `<p style="margin-top:16px; color:green; font-weight:600;">✅ Ordine già rilasciato</p>`
//         : `<button 
//         id="release-btn-${orderId}"
//         onclick="releaseOrder('${orderId}')"
//         style="margin-top:16px; background-color:#28a745; color:white; border:none; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:500;">
//         🔐 Rilascia ordine
//     </button>`;

//     // 🎨 Genera HTML completo con tutti i dettagli dell'ordine
//     const html = `
//         <div style="border:1px solid #28a745; padding:20px; border-radius:10px; margin-top:16px; margin-inline: 20px; background:#f9fff9; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
//             <!-- 📦 Header dell'ordine -->
//             <h4 style="margin-top:0; font-size:18px; color:#155724;">📦 Dettaglio Ordine <span style="color:#000;">${order.OrderNr}</span></h4>

//             <!-- 📋 Informazioni principali -->
//             <div style="margin-bottom:8px;"><strong>Fornitore:</strong> ${order.VendorName} <small>(${order.VendorId})</small></div>
//             <div><strong>Totale:</strong> ${order.TotValue} ${order.CurrencyId}</div>
//             <div><strong>Dipartimento:</strong> ${order.PurDepartName} (${order.PurDepartId})</div>
//             <div><strong>Tipo Documento:</strong> ${order.DocType}</div>
//             <div><strong>Cond. Pagamento:</strong> ${order.PaymCondId}</div>
//             <div><strong>Creato da:</strong> ${order.CreatName} il ${formatSAPDate(order.CreatDate)}</div>
//             <div><strong>Data Consegna:</strong> ${formatSAPDate(order.MinDelivDate)}</div>
//             <div><strong>Rilasciato:</strong> ${order.IsReleased ? "✅ Sì" : "❌ No"}</div>

//             ${rilascioButtonHtml}

//             <!-- 📋 Sezione per le righe dell'ordine -->
//             <div id="order-items" style="margin-top:16px; font-style:italic; color:#666;">🔄 Caricamento righe ordine...</div>
//         </div>
//     `;

//     // 🎨 Mostra l'HTML generato
//     sapResults.innerHTML = html;
//     saveCurrentViewState();

//     // 💾 Salva l'ID ordine corrente per il ripristino
//     localStorage.setItem("currentOrderId", orderId);

//     // 📋 Carica le righe dell'ordine in modo asincrono
//     fetch(`http://localhost:3000/sap/order-items/${orderId}`)
//         .then(res => res.json()) // 📥 Converte in JSON
//         .then(data => {
//             if (data.items && data.items.length > 0) {
//                 // 🎨 Genera HTML per ogni riga dell'ordine
//                 const itemsHtml = data.items.map(item => `
//                     <div style="border-top:1px dashed #ccc; margin-top:12px; padding-top:12px;">
//                         <div><strong>Posizione:</strong> ${item.OrderPos}</div>
//                         <div><strong>Prodotto:</strong> ${item.ProductId}</div>
//                         <div><strong>Descrizione:</strong> ${item.ShortText}</div>
//                         <div><strong>Prezzo:</strong> ${item.Price}</div>
//                     </div>
//                 `).join("");

//                 // 🔄 Aggiorna la sezione delle righe ordine
//                 document.getElementById("order-items").innerHTML = `${itemsHtml}`;

//                 // 💾 Salva le righe nella cache
//                 localStorage.setItem("currentOrderItems", JSON.stringify(data.items));
//                 saveCurrentViewState();
//             } else {
//                 document.getElementById("order-items").innerHTML = "⚠️ Nessuna riga trovata per questo ordine.";
//                 saveCurrentViewState();
//             }
//         })
//         .catch(err => {
//             // ❌ Gestisce errori nel caricamento righe
//             console.error("Errore righe ordine:", err);
//             document.getElementById("order-items").innerHTML = "❌ Errore nel recupero delle righe ordine.";
//             saveCurrentViewState();
//         });
// }

// // 🔐 RILASCIO ORDINI
// // ===================

// /**
//  * 🔐 Gestisce il rilascio di un ordine SAP
//  * @param {string} orderId - ID dell'ordine da rilasciare
//  */
// function releaseOrder(orderId) {
//     // ❓ Chiede conferma all'utente
//     if (!confirm(`🔐 Vuoi rilasciare l'ordine ${orderId}?`)) return;

//     // 💬 Notifica inizio operazione
//     appendMessage(`🔄 Rilascio in corso per ordine ${orderId}...`, "bot-message");

//     // 📡 Chiamata POST per rilasciare l'ordine
//     fetch(`http://localhost:3000/sap/release/${orderId}`, {
//         method: "POST",
//         headers: {
//             "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione
//             "Content-Type": "application/json" // 📤 Tipo contenuto JSON
//         }
//     })
//         .then(res => res.json()) // 📥 Converte risposta in JSON
//         .then(data => {
//             if (data.success) {
//                 // ✅ Rilascio riuscito
//                 appendMessage(`✅ Ordine ${orderId} rilasciato con successo.`, "bot-message");
//                 getSingleOrder(orderId); // 🔄 Ricarica i dettagli dell'ordine
//             } else {
//                 // ❌ Rilascio fallito
//                 appendMessage(`❌ Errore nel rilascio dell'ordine ${orderId}`, "bot-message");
//             }
//         })
//         .catch(err => {
//             // ❌ Errore di rete o server
//             console.error("Errore rilascio:", err);
//             appendMessage(`❌ Errore nel rilascio dell'ordine ${orderId}`, "bot-message");
//         });
// }

// // 📅 UTILITÀ FORMATTAZIONE DATE
// // ==============================

// /**
//  * 📅 Formatta una data SAP in formato leggibile italiano
//  * @param {string} sapDateStr - Stringa data SAP (formato timestamp)
//  * @returns {string} - Data formattata in italiano (dd/mm/yyyy)
//  */
// function formatSAPDate(sapDateStr) {
//     if (!sapDateStr) return "";

//     // 🔍 Estrae il timestamp dalla stringa SAP
//     const timestamp = parseInt(sapDateStr.match(/\d+/)?.[0] || "0", 10);

//     // 📅 Crea oggetto Date e formatta in italiano
//     const date = new Date(timestamp);
//     return date.toLocaleDateString("it-IT");
// }

// // 🔊 GESTIONE SINTESI VOCALE (se implementata)
// // =============================================

// /**
//  * 🔊 Gestisce la coda dei messaggi per la sintesi vocale
//  * Questa funzione elabora i messaggi in coda per farli "pronunciare" dall'avatar
//  */
// function processSpeechQueue() {
//     // ⏳ Aspetta che il modello vocale sia caricato
//     if (!window.modelLoaded) {
//         setTimeout(processSpeechQueue, 500); // 🔄 Riprova dopo 500ms
//         return;
//     }

//     // 🔊 Se ci sono messaggi in coda, elabora il primo
//     if (messageQueue.length > 0) {
//         const text = messageQueue.shift(); // 📤 Prendi il primo messaggio
//         window.makeAvatarSpeak(text); // 🔊 Fai parlare l'avatar

//         // ⏳ Aspetta 3 secondi prima di processare il prossimo messaggio
//         setTimeout(() => {
//             if (messageQueue.length > 0) {
//                 processSpeechQueue(); // 🔄 Continua con il prossimo
//             }
//         }, 3000);
//     }
// }

// // 🎧 GESTORI EVENTI INTERFACCIA
// // ==============================

// // 📤 Event listener per il pulsante di invio
// sendBtn.addEventListener("click", sendMessage);

// // ⌨️ Event listener per il tasto Enter nel campo di input
// userInput.addEventListener("keydown", function (event) {
//     if (event.key === "Enter") {
//         event.preventDefault(); // 🚫 Previene il comportamento default
//         sendMessage(); // 📤 Invia il messaggio
//     }
// });

// // 🚀 INIZIALIZZAZIONE APPLICAZIONE
// // =================================

// /**
//  * 🚀 Inizializza l'applicazione quando il DOM è caricato
//  */
// document.addEventListener("DOMContentLoaded", function () {
//     // 📚 Ripristino cronologia chat dal localStorage
//     const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
//     history.forEach(({ text, className }) => {
//         // 🏗️ Ricrea ogni messaggio nella chat
//         const div = document.createElement("div");
//         div.className = className;
//         div.textContent = text;
//         chatBox.appendChild(div);
//     });

//     // 📜 Scrolla la chat fino in fondo
//     chatBox.scrollTop = chatBox.scrollHeight;

//     // 🔄 Ripristina lo stato precedente dell'interfaccia
//     restoreViewState();

//     // 📦 Controlla se c'era un ordine specifico visualizzato
//     const currentOrderId = localStorage.getItem("currentOrderId");
//     if (currentOrderId && localStorage.getItem("viewState") === "results") {
//         // ✅ Ripristino completato (il codice necessario è già in restoreViewState)
//     }

//     // 🎬 Inizializza componenti aggiuntivi se esistono (es: avatar 3D)
//     if (typeof window.init === "function") {
//         window.init();
//     }
// });

// // 🔄 CONTROLLI INTERFACCIA CHATBOT
// // =================================

// /**
//  * 🔄 Gestisce la minimizzazione/espansione del chatbot
//  */
// document.addEventListener("DOMContentLoaded", function () {
//     // 🔍 Cerca i componenti per il toggle della chat
//     const toggleBtn = document.getElementById("toggle-chat");
//     const chatContainer = document.querySelector(".chat-container");

//     // ✅ Se esistono entrambi i componenti, aggiungi il comportamento
//     if (toggleBtn && chatContainer) {
//         toggleBtn.addEventListener("click", function () {
//             // 🔄 Toggle della classe 'minimized' sul container
//             const isMinimized = chatContainer.classList.toggle("minimized");

//             // 🔄 Cambia il testo del pulsante in base allo stato
//             toggleBtn.textContent = isMinimized ? "+" : "−";
//         });
//     }
// });

// // 🎯 RIEPILOGO FUNZIONALITÀ PRINCIPALI:
// // =====================================

// /* 
// 🚀 FUNZIONALITÀ PRINCIPALI DEL CHATBOT SAP:

// 1. 💬 CHAT INTELLIGENTE:
//    - Interpreta richieste in linguaggio naturale usando OpenAI
//    - Pattern veloci per richieste comuni
//    - Cronologia messaggi persistente

// 2. 🔍 INTERROGAZIONI SAP:
//    - Recupero tutti gli ordini
//    - Ricerca ordini specifici per numero
//    - Filtri per fornitore, date, anni
//    - Lista fornitori disponibili

// 3. 📦 GESTIONE ORDINI:
//    - Visualizzazione dettagli completi
//    - Rilascio ordini con conferma
//    - Caricamento righe ordine

// 4. 💾 PERSISTENZA DATI:
//    - Salvataggio stato interfaccia
//    - Cache risultati SAP
//    - Ripristino sessione precedente

// 5. 🎨 INTERFACCIA UTENTE:
//    - Rendering HTML dinamico
//    - Hover effects sui card
//    - Messaggi di stato colorati
//    - Toggle minimizza/espandi

// 6. 🔊 INTEGRAZIONE VOCALE:
//    - Coda messaggi per sintesi vocale
//    - Supporto avatar 3D (se implementato)

// 7. 🛡️ GESTIONE ERRORI:
//    - Fallback per parsing AI
//    - Gestione errori rete/SAP
//    - Messaggi informativi per l'utente
// */

// *****************************************************************
//   CODICE NODE
// *****************************************************************
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Test codice con ai
// 🎯 CONFIGURAZIONE INIZIALE E VARIABILI GLOBALI
// ===================================================

// 📦 Recupera gli elementi HTML principali dell'interfaccia utente
const chatBox = document.getElementById("chat-box");           // 💬 Contenitore dei messaggi di chat
const userInput = document.getElementById("user-input");       // ✏️ Campo di input per l'utente
const sendBtn = document.getElementById("send-btn");           // 📤 Pulsante per inviare messaggi
const sapResults = document.getElementById("sap-results");     // 📊 Area per mostrare i risultati SAP

// 🎤 Variabili per riconoscimento vocale
let recognition = null;
let isVoiceModeActive = false;
let speechSynthesis = window.speechSynthesis;
const voiceToggleBtn = document.getElementById("voice-toggle");

// const urlPage = `http://localhost:3000`
// const urlPage = `https://progettowebsap-git-main-innovationteams-projects.vercel.app`
const urlPage = `https://40ea3209-885a-4a8d-98ec-bc5e8f53e063-00-5529wmky4j3q.janeway.replit.dev`



// 🗨️ GESTIONE MESSAGGI CHAT

// ===========================


/**
 * 💬 Aggiunge un nuovo messaggio nella chat (utente o bot)
 * @param {string} text - Il testo del messaggio
 * @param {string} className - La classe CSS per lo stile (user-message o bot-message)
 */

function appendMessage(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.textContent = text;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    saveChatMessage(text, className);

    // 🔊 Se è un messaggio del bot e modalità vocale attiva, fallo parlare
    if (className === "bot-message" && isVoiceModeActive) {
        speakText(text);
    }
}

/**
 * 💾 Salva un messaggio nella cronologia del browser (localStorage)
 * @param {string} text - Il testo del messaggio
 * @param {string} className - La classe CSS del messaggio
 */
function saveChatMessage(text, className) {
    // 📚 Recupera la cronologia esistente o crea un array vuoto
    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");

    // ➕ Aggiunge il nuovo messaggio alla cronologia
    history.push({ text, className });

    // 💾 Salva la cronologia aggiornata
    localStorage.setItem("chatHistory", JSON.stringify(history));
}

// 🚀 INVIO E GESTIONE MESSAGGI
// =============================

/**
 * 📤 Gestisce l'invio di un messaggio dell'utente
 */
function sendMessage() {
    // ✂️ Rimuove spazi inutili dal messaggio
    const message = userInput.value.trim();

    // 🚫 Se il messaggio è vuoto, non fare nulla
    if (message === "") return;

    // 💬 Mostra il messaggio dell'utente nella chat
    appendMessage(message, "user-message");

    // 🧹 Pulisce il campo di input
    userInput.value = "";

    // ⚡ Prima prova con pattern veloci per richieste comuni
    if (tryQuickPatterns(message)) {
        return; // 🎯 Se trova un pattern veloce, esce dalla funzione
    }

    // 🤖 Se non trova pattern veloci, usa l'AI per interpretare il messaggio
    callOpenAIWithFunctions(message);
}

// 🏃‍♂️ PATTERN VELOCI PER RICHIESTE COMUNI
// ==========================================

/**
 * ⚡ Prova pattern veloci per richieste precise e comuni
 * @param {string} message - Il messaggio dell'utente
 * @returns {boolean} - True se ha trovato e gestito un pattern veloce
 */
function tryQuickPatterns(message) {
    // 🎯 Array di pattern predefiniti con regex e azioni corrispondenti
    const patterns = [
        {
            // 📋 Pattern per "tutti gli ordini" 
            regex: /^tutti.*ordini$/i,
            action: () => {
                appendMessage("🔍 Recupero tutti gli ordini...", "bot-message");
                getSAPEntityData("PurchaseOrderSet");
            }
        },
        {
            // 🔢 Pattern per ordine specifico (es: "ordine 4500000869")
            regex: /^ordine\s+(\d{10})$/i,
            action: (match) => {
                const orderId = match[1]; // 🎯 Estrae il numero ordine
                appendMessage(`🔍 Recupero l'ordine ${orderId}...`, "bot-message");
                getSingleOrder(orderId);
            }
        },
        {
            // Pattern per rilasciare un ordine specifico
            regex: /^rilascia\s+ordine\s+(\d{10})$/i,
            action: (match) => {
                const orderId = match[1];
                appendMessage(`🔐 Rilascio ordine ${orderId}...`, "bot-message");
                releaseOrder(orderId);
            }
        }
    ];

    // 🔍 Cerca un pattern che corrisponda al messaggio
    for (const pattern of patterns) {
        const match = message.match(pattern.regex);
        if (match) {
            pattern.action(match); // 🎬 Esegue l'azione corrispondente
            return true; // ✅ Trovato e gestito
        }
    }
    return false; // ❌ Nessun pattern trovato
}

// 🤖 INTEGRAZIONE CON OPENAI
// ===========================

/**
 * 🤖 Chiama OpenAI per interpretare il messaggio e determinare l'azione
 * @param {string} message - Il messaggio dell'utente da interpretare
 */
// function callOpenAIWithFunctions(message) {
//     // 🔄 Mostra messaggio di elaborazione
//     appendMessage("🤖 Sto elaborando la tua richiesta...", "bot-message");

//     // 📋 Prompt di sistema per istruire l'AI su come comportarsi
//     const systemPrompt = `Sei un assistente SAP intelligente. Analizza la richiesta dell'utente e determina quale azione eseguire.

// FUNZIONI DISPONIBILI:
// 1. "show_all_orders" - mostra tutti gli ordini
// 2. "show_specific_order" - mostra un ordine specifico (serve il numero ordine)
// 3. "show_orders_by_vendor" - mostra ordini di un fornitore specifico
// 4. "show_orders_by_date_range" - mostra ordini tra due date specifiche
// 5. "show_orders_by_date_filter" - mostra ordini prima/dopo una data
// 6. "show_orders_by_year_range" - mostra ordini tra due anni
// 7. "list_vendors" - elenca tutti i fornitori
// 8. "show_orders_by_year" - mostra ordini di un anno specifico
// 9. "release_order" - rilascia un ordine specifico (serve il numero ordine)

// ESEMPI DI RICHIESTE CHE DEVI RICONOSCERE:
// - "tutti gli ordini", "mostra ordini", "visualizza tutti gli ordini" → show_all_orders
// - "ordine 4500000869", "mostra ordine numero 123", "dettagli ordine" → show_specific_order
// - "ordini SAP ITALIA", "ordini fornitore Mario Rossi" → show_orders_by_vendor
// - "fornitori disponibili", "che fornitori ci sono" → list_vendors
// - "ordini 2024", "ordini del 2023" → show_orders_by_year
// - "ordini tra il 01/03/2022 e il 01/06/2022", "ordini dal 15/01/2023 al 20/12/2023" → show_orders_by_date_range
// - "ordini dopo il 2023", "ordini prima del 2022", "ordini dopo il 15/05/2023" → show_orders_by_date_filter  
// - "ordini tra il 2020 e il 2022", "ordini dal 2019 al 2023" → show_orders_by_year_range
// - "rilascia ordine 4500000869", "rilascia l'ordine numero 123" → release_order

// Rispondi SEMPRE in questo formato JSON:
// {
//   "action": "nome_funzione",
//   "parameters": {
//     "orderId": "numero_ordine_se_necessario",
//     "vendorName": "nome_fornitore_se_necessario",
//     "year": "anno_se_necessario",
//     "startDate": "data_inizio_se_necessario_formato_dd/mm/yyyy",
//     "endDate": "data_fine_se_necessario_formato_dd/mm/yyyy",
//     "dateOperator": "before_o_after_se_necessario",
//     "filterDate": "data_filtro_se_necessario_formato_dd/mm/yyyy_o_yyyy",
//     "startYear": "anno_inizio_se_necessario",
//     "endYear": "anno_fine_se_necessario"
//   },
//   "response": "messaggio_per_utente"
// }

// Se non capisci la richiesta, usa "action": "chat" per una risposta normale.`;

//     // 🌐 Chiamata API a OpenAI
//     fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${apiKey}` // 🔐 Autorizzazione con API key
//         },
//         body: JSON.stringify({
//             model: "gpt-3.5-turbo",              // 🤖 Modello AI da utilizzare
//             messages: [
//                 { role: "system", content: systemPrompt }, // 📋 Istruzioni per l'AI
//                 { role: "user", content: message }         // 💬 Messaggio dell'utente
//             ],
//             temperature: 0.1 // 🌡️ Bassa creatività per risposte precise
//         })
//     })
//         .then(res => res.json()) // 📥 Converte la risposta in JSON
//         .then(data => {
//             // 📥 Estrae la risposta dell'AI
//             const reply = data.choices?.[0]?.message?.content || "🤖 Nessuna risposta.";

//             try {
//                 // 🧹 Pulisce la risposta da eventuali formattazioni markdown
//                 let jsonContent = reply.trim();

//                 // 🔧 Rimuove i backticks del markdown se presenti
//                 if (jsonContent.startsWith('```json')) {
//                     jsonContent = jsonContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
//                 } else if (jsonContent.startsWith('```')) {
//                     jsonContent = jsonContent.replace(/```\s*/, '').replace(/```\s*$/, '');
//                 }


//                 // 📖 Prova a parsare come JSON
//                 const aiResponse = JSON.parse(jsonContent);

//                 // ✅ Verifica che sia un oggetto valido con action
//                 if (aiResponse && typeof aiResponse === 'object' && aiResponse.action) {
//                     executeAIAction(aiResponse); // 🎬 Esegue l'azione determinata dall'AI
//                 } else {
//                     // 💬 Se non ha la struttura corretta, mostra come messaggio normale
//                     appendMessage(reply, "bot-message");
//                 }
//             } catch (e) {
//                 // 🐛 Gestisce errori di parsing JSON
//                 console.log("Errore parsing JSON:", e);
//                 console.log("Contenuto ricevuto:", reply);

//                 // 🔄 Fallback: prova a estrarre informazioni dal testo
//                 if (parseAndExecuteFromText(reply)) {
//                     return;
//                 }

//                 // 💬 Se tutto fallisce, mostra come messaggio normale
//                 appendMessage(reply, "bot-message");
//             }
//         })
//         .catch(err => {
//             // ❌ Gestisce errori della chiamata API
//             console.error("Errore AI:", err);
//             appendMessage("❌ Errore con l'AI. Riprova.", "bot-message");
//         });
// }


// 🔧 PARSING FALLBACK PER TESTI NON-JSON
// ========================================
// function callOpenAIWithFunctions(message) {
//     appendMessage("🤖 Sto elaborando la tua richiesta...", "bot-message");

//     const systemPrompt = `Sei un assistente SAP intelligente. Analizza la richiesta dell'utente e determina quale azione eseguire.

// FUNZIONI DISPONIBILI:
// 1. "show_all_orders" - mostra tutti gli ordini
// 2. "show_specific_order" - mostra un ordine specifico (serve il numero ordine)
// 3. "show_orders_by_vendor" - mostra ordini di un fornitore specifico
// 4. "show_orders_by_date_range" - mostra ordini tra due date specifiche
// 5. "show_orders_by_date_filter" - mostra ordini prima/dopo una data
// 6. "show_orders_by_year_range" - mostra ordini tra due anni
// 7. "list_vendors" - elenca tutti i fornitori
// 8. "show_orders_by_year" - mostra ordini di un anno specifico
// 9. "release_order" - rilascia un ordine specifico (serve il numero ordine)

// ESEMPI DI RICHIESTE CHE DEVI RICONOSCERE:
// - "tutti gli ordini", "mostra ordini", "visualizza tutti gli ordini" → show_all_orders
// - "ordine 4500000869", "mostra ordine numero 123", "dettagli ordine" → show_specific_order
// - "ordini SAP ITALIA", "ordini fornitore Mario Rossi" → show_orders_by_vendor
// - "fornitori disponibili", "che fornitori ci sono" → list_vendors
// - "ordini 2024", "ordini del 2023" → show_orders_by_year
// - "ordini tra il 01/03/2022 e il 01/06/2022", "ordini dal 15/01/2023 al 20/12/2023" → show_orders_by_date_range
// - "ordini dopo il 2023", "ordini prima del 2022", "ordini dopo il 15/05/2023" → show_orders_by_date_filter  
// - "ordini tra il 2020 e il 2022", "ordini dal 2019 al 2023" → show_orders_by_year_range
// - "rilascia ordine 4500000869", "rilascia l'ordine numero 123" → release_order

// Rispondi SEMPRE in questo formato JSON:
// {
//   "action": "nome_funzione",
//   "parameters": {
//     "orderId": "numero_ordine_se_necessario",
//     "vendorName": "nome_fornitore_se_necessario",
//     "year": "anno_se_necessario",
//     "startDate": "data_inizio_se_necessario_formato_dd/mm/yyyy",
//     "endDate": "data_fine_se_necessario_formato_dd/mm/yyyy",
//     "dateOperator": "before_o_after_se_necessario",
//     "filterDate": "data_filtro_se_necessario_formato_dd/mm/yyyy_o_yyyy",
//     "startYear": "anno_inizio_se_necessario",
//     "endYear": "anno_fine_se_necessario"
//   },
//   "response": "messaggio_per_utente"
// }

// Se non capisci la richiesta, usa "action": "chat" per una risposta normale.`;

//     // Cambia la chiamata per usare il tuo backend invece di OpenAI direttamente
//     fetch(`${urlPage}/openai/chat`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             message: message,
//             systemPrompt: systemPrompt
//         })
//     })
//     .then(res => res.json())
//     .then(data => {
//         const reply = data.choices?.[0]?.message?.content || "🤖 Nessuna risposta.";

//         // Il resto del codice rimane uguale...
//         try {
//             let jsonContent = reply.trim();
//             if (jsonContent.startsWith('```json')) {
//                 jsonContent = jsonContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
//             } else if (jsonContent.startsWith('```')) {
//                 jsonContent = jsonContent.replace(/```\s*/, '').replace(/```\s*$/, '');
//             }

//             const aiResponse = JSON.parse(jsonContent);
//             if (aiResponse && typeof aiResponse === 'object' && aiResponse.action) {
//                 executeAIAction(aiResponse);
//             } else {
//                 appendMessage(reply, "bot-message");
//             }
//         } catch (e) {
//             console.log("Errore parsing JSON:", e);
//             console.log("Contenuto ricevuto:", reply);
//             if (parseAndExecuteFromText(reply)) {
//                 return;
//             }
//             appendMessage(reply, "bot-message");
//         }
//     })
//     .catch(err => {
//         console.error("Errore AI:", err);
//         appendMessage("❌ Errore con l'AI. Riprova.", "bot-message");
//     });
// }

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

    // Chiamata corretta per Vercel
    fetch(`${urlPage}/openai/chat`, {
        //fetch(`https://40ea3209-885a-4a8d-98ec-bc5e8f53e063-00-5529wmky4j3q.janeway.replit.dev/openai/chat`, {  
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
            // Debug della risposta
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP ${response.status}:`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Risposta non JSON:', text);
                throw new Error(`Risposta non JSON: ${text.substring(0, 100)}...`);
            }

            return response.json();
        })
        .then(data => {
            console.log('Dati ricevuti:', data);

            // Controlla se c'è un errore nella risposta OpenAI
            if (data.error) {
                console.error('Errore OpenAI:', data.error);
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
                console.log("Errore parsing JSON:", e);
                console.log("Contenuto ricevuto:", reply);
                if (parseAndExecuteFromText(reply)) {
                    return;
                }
                appendMessage(reply, "bot-message");
            }
        })
        .catch(err => {
            console.error("Errore completo:", err);

            // FALLBACK: Prova con pattern locali se il backend non funziona
            appendMessage("🔄 Backend non disponibile, uso pattern locali...", "bot-message");

            if (tryAdvancedPatterns(message)) {
                return;
            }

            appendMessage("❌ Servizio AI temporaneamente non disponibile. Usa comandi specifici come 'tutti gli ordini' o 'ordine 123456'.", "bot-message");
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
        const releaseMatch = text.match(/rilascia.*?ordine.*?(\d{10})/i);
        if (releaseMatch) {
            executeAIAction({
                action: "release_order",
                parameters: {
                    orderId: releaseMatch[1]
                },
                response: `Rilascio ordine ${releaseMatch[1]}`
            });
            return true;
        }

    } catch (e) {
        // 🐛 Errore nel parsing fallback
        console.log("Errore parsing fallback:", e);
    }

    return false; // ❌ Nessun pattern riconosciuto
}

// 🎯 ESECUZIONE AZIONI AI
// ========================

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

        case "release_order":
            // 🔐 Rilascia un ordine specifico
            if (parameters.orderId) {
                appendMessage(`🔐 Rilascio ordine ${parameters.orderId}...`, "bot-message");
                releaseOrder(parameters.orderId);
            } else {
                appendMessage("❌ Numero ordine non specificato per il rilascio", "bot-message");
            }
            break;
    }
}

// 📅 UTILITÀ PER GESTIONE DATE
// =============================

/**
 * 📅 Funzione per parsare le date in vari formati
 * @param {string} dateStr - Stringa della data da parsare
 * @returns {Date|null} - Oggetto Date o null se parsing fallisce
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    // 📅 Se è solo un anno (es. "2023")
    if (/^\d{4}$/.test(dateStr)) {
        return new Date(`${dateStr}-01-01`);
    }

    // 📅 Se è formato italiano dd/mm/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }

    // 📅 Se è formato mm/yyyy
    if (/^\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [month, year] = dateStr.split('/');
        return new Date(`${year}-${month.padStart(2, '0')}-01`);
    }

    // 🔄 Fallback: prova a parsare direttamente
    return new Date(dateStr);
}

// 🔍 FUNZIONI SAP - RECUPERO DATI
// ================================

/**
 * 🔍 Recupera un ordine specifico da SAP
 * @param {string} orderId - ID dell'ordine da recuperare
 */
function getSingleOrder(orderId) {
    // 🔄 Mostra messaggio di caricamento
    sapResults.innerHTML = "🔄 Caricamento ordine...";

    // 🌐 URL per la chiamata SAP
    const url = `${urlPage}/sap/PurchaseOrderSet`;

    // 📡 Chiamata HTTP a SAP
    fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione basic
            "Accept": "application/json" // 📥 Richiede risposta JSON
        }
    })
        .then(response => response.json()) // 📥 Converte risposta in JSON
        .then(data => {
            // ✅ Verifica che ci siano dati
            if (data.d && data.d.results && data.d.results.length > 0) {
                // 🔍 Cerca l'ordine specifico nell'array
                const order = data.d.results.find(item => item.OrderNr === orderId);
                if (order) {
                    renderOrderDetails(order); // 🎨 Renderizza i dettagli dell'ordine
                } else {
                    sapResults.innerHTML = `❌ Ordine ${orderId} non trovato.`;
                }
            } else {
                sapResults.innerHTML = "❌ Nessun dato ricevuto da SAP.";
            }
        })
        .catch(error => {
            // ❌ Gestisce errori di rete o SAP
            console.error("Errore SAP:", error);
            sapResults.innerHTML = `❌ Errore durante il recupero ordine: ${error.message}`;
        });
}

/**
 * 🔄 Recupera dati da entità SAP generica con filtri opzionali
 * @param {string} entity - Nome dell'entità SAP (es: "PurchaseOrderSet")
 * @param {string|null} filterOrder - ID ordine specifico da filtrare
 * @param {Object|null} dateFilter - Filtro per date (start/end o operator/date)
 * @param {string|null} vendorName - Nome fornitore per filtrare
 */
function getSAPEntityData(entity, filterOrder = null, dateFilter = null, vendorName = null) {
    // 🔄 Mostra messaggio di caricamento
    sapResults.innerHTML = "🔄 Caricamento dati...";
    const url = `${urlPage}/sap/${entity}`;

    // 📡 Chiamata HTTP a SAP
    fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione
            "Accept": "application/json" // 📥 Richiede JSON
        }
    })
        .then(async response => {
            // 📋 Verifica il tipo di contenuto della risposta
            const contentType = response.headers.get("content-type");
            if (!response.ok) throw new Error(await response.text());
            if (contentType.includes("application/json")) return response.json();
            throw new Error("Risposta non in formato JSON");
        })
        .then(data => {
            // 📊 Estrae i risultati dall'oggetto SAP
            let results = data?.d?.results || [];

            // 🔍 Filtro per ordine specifico
            if (filterOrder) {
                const ordine = results.find(o => o.OrderNr === filterOrder);
                if (ordine) renderOrderDetails(ordine);
                else sapResults.innerHTML = `❌ Nessun ordine trovato con numero ${filterOrder}`;
                return;
            }

            // 📅 Filtro per date
            if (dateFilter) {
                const { operator, date, start, end } = dateFilter;
                results = results.filter(o => {
                    // 🔄 Converte la data SAP in formato JavaScript
                    const sapDate = new Date(parseInt(o.MinDelivDate.match(/\d+/)?.[0] || "0"));

                    // 📅 Applica filtri di range o operatore
                    if (start && end) return sapDate >= start && sapDate <= end;
                    if (operator && date) return operator === "<" ? sapDate < date : sapDate > date;

                    return true;
                });
            }

            // 🏢 Filtro per nome fornitore
            if (vendorName) {
                results = results.filter(o => o.VendorName?.toLowerCase().includes(vendorName.toLowerCase()));
            }

            // ⚠️ Verifica se ci sono risultati
            if (results.length === 0) {
                sapResults.innerHTML = "⚠️ Nessun ordine trovato con questi criteri.";
                return;
            }

            // 🎨 Renderizza i risultati
            renderSAPData(entity, results);
        })
        .catch(error => {
            // ❌ Gestisce errori
            console.error("Errore SAP:", error);
            sapResults.innerHTML = `❌ Errore durante il recupero dati da SAP: ${error.message}`;
        });
}

// 💾 GESTIONE STATO INTERFACCIA
// ==============================

/**
 * 💾 Salva lo stato attuale dell'interfaccia nel localStorage
 */
function saveCurrentViewState() {
    if (sapResults.innerHTML.trim() !== "") {
        // 💾 Salva i risultati SAP correnti
        localStorage.setItem("lastSapResults", sapResults.innerHTML);
        localStorage.setItem("viewState", "results");
    } else {
        // 🧹 Rimuove lo stato se non ci sono risultati
        localStorage.removeItem("lastSapResults");
        localStorage.removeItem("viewState");
    }
}

/**
 * 🔄 Ripristina lo stato precedente dall'localStorage
 */
function restoreViewState() {
    const viewState = localStorage.getItem("viewState");

    if (viewState === "results") {
        const savedResults = localStorage.getItem("lastSapResults");
        if (savedResults) {
            // 🔄 Ripristina i risultati SAP
            sapResults.innerHTML = savedResults;

            // 🔧 Ripristina i gestori di eventi per i pulsanti di rilascio
            document.querySelectorAll("[onclick^='releaseOrder']").forEach(button => {
                const orderId = button.getAttribute("onclick").match(/'([^']+)'/)[1];
                button.onclick = () => releaseOrder(orderId);
            });
        }
    }
}

// 🎨 RENDERING DATI SAP
// =====================

/**
 * 🎨 Renderizza i dati SAP in formato HTML
 * @param {string} entity - Nome dell'entità SAP
 * @param {Array} records - Array di record da renderizzare
 */
function renderSAPData(entity, records) {
    const count = records.length;

    // 🏗️ Genera HTML per ogni record
    const html = records.map(item => {
        if (entity === "PurchaseOrderSet") {
            // 📦 Template per ordini di acquisto
            return `
                <div style="border:1px solid #ddd; padding:16px; margin:12px 0; border-radius:8px; background:#fafafa; box-shadow:0 2px 4px rgba(0,0,0,0.05); transition:box-shadow 0.2s;" 
                 onmouseover="this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'" 
                 onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">
                  <!-- 📄 Header cliccabile dell'ordine -->
                 <div style="
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600; 
                    font-size: 16px; 
                    padding: 12px 18px;
                    margin-bottom: 8px; 
                    cursor: pointer; 
                    color: #1e293b;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    text-decoration: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    " 
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(59, 130, 246, 0.3)'; this.style.background='linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; this.style.color='white'; this.style.borderColor='#2563eb';"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.background='linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'; this.style.color='#1e293b'; this.style.borderColor='#e2e8f0';"
                    onclick="getSingleOrder('${item.OrderNr}')">
                        <span style="font-size: 18px;">📄</span>
                        <span>Ordine #${item.OrderNr}</span>
                    </div>
                     <!-- 📅 Informazioni principali dell'ordine -->
                     <div><strong>Data:</strong> ${formatSAPDate(item.MinDelivDate)}</div>
                     <div><strong>Fornitore:</strong> ${item.VendorName}</div>
                     <!-- 🔐 Pulsante per rilasciare l'ordine -->
                    
                    <button 
                        onclick="releaseOrder('${item.OrderNr}')" 
                        style="
                            background-color: #007BFF;
                            color: white;
                            border: none;
                            padding: 0px 14px 13px 14px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            font-size: 16px;
                            box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
                            transition: background-color 0.3s ease, transform 0.2s ease;
                        "
                        onmouseover="this.style.backgroundColor='#0056b3'; this.style.transform='scale(1.05)'"
                        onmouseout="this.style.backgroundColor='#007BFF'; this.style.transform='scale(1)'"
                    >               
                         🔐 Rilascia ordine
                    </button>
                </div>
            `;
        } else {
            // 📋 Template generico per altre entità SAP
            return `
                <div style="border:1px solid #ddd; padding:16px; margin:12px 0; border-radius:8px; background:#fff;">
                    <!-- 📊 Visualizzazione dati in formato JSON -->
                    <pre style="margin:0; font-size:14px;">${JSON.stringify(item, null, 2)}</pre>
                </div>
            `;
        }
    }).join("");

    // 🎨 Genera HTML finale con header e statistiche
    sapResults.innerHTML = `
        <h3 style="font-size:20px; font-weight:600; color:#333;">📄 Risultati da ${entity}</h3>
        <p style="color:#155724; font-weight:500;">✅ Risultati trovati: ${count}</p>
        ${html}
    `;

    // 💾 Salva i risultati nella cache e nello stato
    localStorage.setItem("sapResultsCache", JSON.stringify({ entity, records }));
    saveCurrentViewState();
}

// 🏢 GESTIONE FORNITORI
// ======================

/**
 * 🏢 Recupera e mostra l'elenco di tutti i fornitori
 */
function listVendors() {
    // 📡 Chiamata per recuperare gli ordini (da cui estrarre i fornitori)
    fetch(`${urlPage}/sap/PurchaseOrderSet`, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione
            "Accept": "application/json" // 📥 Richiede JSON
        }
    })
        .then(res => res.json()) // 📥 Converte in JSON
        .then(data => {
            const results = data?.d?.results || [];

            // 🔍 Estrae nomi fornitori unici e li ordina alfabeticamente
            const vendors = [...new Set(results.map(r => r.VendorName).filter(Boolean))].sort();

            if (vendors.length === 0) {
                sapResults.innerHTML = "⚠️ Nessun fornitore trovato.";
            } else {
                // 🎨 Genera HTML con lista fornitori
                sapResults.innerHTML = `
                <h4>🏢 Fornitori disponibili</h4>
                <ul style="padding-left:20px;">
                    ${vendors.map(v => `<li>${v}</li>`).join("")}
                </ul>
            `;
            }
        })
        .catch(err => {
            // ❌ Gestisce errori
            console.error("Errore elenco fornitori:", err);
            sapResults.innerHTML = "❌ Errore durante il recupero fornitori.";
        });
}

// 📦 DETTAGLI ORDINE SPECIFICO
// =============================

/**
 * 📦 Renderizza i dettagli completi di un ordine specifico
 * @param {Object} order - Oggetto ordine con tutti i dettagli
 */
function renderOrderDetails(order) {
    const orderId = order.OrderNr;

    // 🔐 Genera HTML per pulsante rilascio (diverso se ordine già rilasciato)
    const rilascioButtonHtml = order.IsReleased
        ? `<p style="margin-top:16px; color:green; font-weight:600;">✅ Ordine già rilasciato</p>`
        : `<button 
        id="release-btn-${orderId}"
        onclick="releaseOrder('${orderId}')"
        
        style="
                            background-color: #28a745;
                            color: white;
                            border: none;
                            padding: 0px 14px 20px 14px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            font-size: 16px;
                            box-shadow: 0 4px 10px rgba(0, 255, 8, 0.3);
                            transition: background-color 0.3s ease, transform 0.2s ease;
                        "
                        onmouseover="this.style.backgroundColor='#0056b3'; this.style.transform='scale(1.05)'"
                        onmouseout="this.style.backgroundColor='#007BFF'; this.style.transform='scale(1)'"
        >
        🔐 Rilascia ordine
    </button>`;

    // 🎨 Genera HTML completo con tutti i dettagli dell'ordine
    const html = `
        <div style="border:1px solid #28a745; padding:20px; border-radius:10px; margin-top:16px; margin-inline: 20px; background:#f9fff9; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
            <!-- 📦 Header dell'ordine -->
            <h4 style="margin-top:0; font-size:18px; color:#155724;">📦 Dettaglio Ordine <span style="color:#000;">${order.OrderNr}</span></h4>
            
            <!-- 📋 Informazioni principali -->
            <div style="margin-bottom:8px;"><strong>Fornitore:</strong> ${order.VendorName} <small>(${order.VendorId})</small></div>
            <div><strong>Totale:</strong> ${order.TotValue} ${order.CurrencyId}</div>
            <div><strong>Dipartimento:</strong> ${order.PurDepartName} (${order.PurDepartId})</div>
            <div><strong>Tipo Documento:</strong> ${order.DocType}</div>
            <div><strong>Cond. Pagamento:</strong> ${order.PaymCondId}</div>
            <div><strong>Creato da:</strong> ${order.CreatName} il ${formatSAPDate(order.CreatDate)}</div>
            <div><strong>Data Consegna:</strong> ${formatSAPDate(order.MinDelivDate)}</div>
            <div><strong>Rilasciato:</strong> ${order.IsReleased ? "✅ Sì" : "❌ No"}</div>

            ${rilascioButtonHtml}

            <!-- 📋 Sezione per le righe dell'ordine -->
            <div id="order-items" style="margin-top:16px; font-style:italic; color:#666;">🔄 Caricamento righe ordine...</div>
        </div>
    `;

    // 🎨 Mostra l'HTML generato
    sapResults.innerHTML = html;
    saveCurrentViewState();

    // 💾 Salva l'ID ordine corrente per il ripristino
    localStorage.setItem("currentOrderId", orderId);

    // 📋 Carica le righe dell'ordine in modo asincrono
    fetch(`${urlPage}/sap/order-items/${orderId}`)
        .then(res => res.json()) // 📥 Converte in JSON
        .then(data => {
            if (data.items && data.items.length > 0) {
                // 🎨 Genera HTML per ogni riga dell'ordine
                const itemsHtml = data.items.map(item => `
                    <div style="border-top:1px dashed #ccc; margin-top:12px; padding-top:12px;">
                        <div><strong>Posizione:</strong> ${item.OrderPos}</div>
                        <div><strong>Prodotto:</strong> ${item.ProductId}</div>
                        <div><strong>Descrizione:</strong> ${item.ShortText}</div>
                        <div><strong>Prezzo:</strong> ${item.Price}</div>
                    </div>
                `).join("");

                // 🔄 Aggiorna la sezione delle righe ordine
                document.getElementById("order-items").innerHTML = `${itemsHtml}`;

                // 💾 Salva le righe nella cache
                localStorage.setItem("currentOrderItems", JSON.stringify(data.items));
                saveCurrentViewState();
            } else {
                document.getElementById("order-items").innerHTML = "⚠️ Nessuna riga trovata per questo ordine.";
                saveCurrentViewState();
            }
        })
        .catch(err => {
            // ❌ Gestisce errori nel caricamento righe
            console.error("Errore righe ordine:", err);
            document.getElementById("order-items").innerHTML = "❌ Errore nel recupero delle righe ordine.";
            saveCurrentViewState();
        });
}

// 🔐 RILASCIO ORDINI
// ===================

/**
 * 🔐 Gestisce il rilascio di un ordine SAP
 * @param {string} orderId - ID dell'ordine da rilasciare
 */
function releaseOrder(orderId) {
    // ❓ Chiede conferma all'utente
    if (!confirm(`🔐 Vuoi rilasciare l'ordine ${orderId}?`)) return;

    // 💬 Notifica inizio operazione
    appendMessage(`🔄 Rilascio in corso per ordine ${orderId}...`, "bot-message");

    // 📡 Chiamata POST per rilasciare l'ordine
    fetch(`${urlPage}/sap/release/${orderId}`, {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"), // 🔐 Autenticazione
            "Content-Type": "application/json" // 📤 Tipo contenuto JSON
        }
    })
        .then(res => res.json()) // 📥 Converte risposta in JSON
        .then(data => {
            if (data.success) {
                // ✅ Rilascio riuscito
                appendMessage(`✅ Ordine ${orderId} rilasciato con successo.`, "bot-message");
                getSingleOrder(orderId); // 🔄 Ricarica i dettagli dell'ordine
            } else {
                // ❌ Rilascio fallito
                appendMessage(`❌ Errore nel rilascio dell'ordine ${orderId}`, "bot-message");
            }
        })
        .catch(err => {
            // ❌ Errore di rete o server
            console.error("Errore rilascio:", err);
            appendMessage(`❌ Errore nel rilascio dell'ordine ${orderId}`, "bot-message");
        });
}

// 📅 UTILITÀ FORMATTAZIONE DATE
// ==============================

/**
 * 📅 Formatta una data SAP in formato leggibile italiano
 * @param {string} sapDateStr - Stringa data SAP (formato timestamp)
 * @returns {string} - Data formattata in italiano (dd/mm/yyyy)
 */
function formatSAPDate(sapDateStr) {
    if (!sapDateStr) return "";

    // 🔍 Estrae il timestamp dalla stringa SAP
    const timestamp = parseInt(sapDateStr.match(/\d+/)?.[0] || "0", 10);

    // 📅 Crea oggetto Date e formatta in italiano
    const date = new Date(timestamp);
    return date.toLocaleDateString("it-IT");
}





// 🎧 GESTORI EVENTI INTERFACCIA
// ==============================

// 📤 Event listener per il pulsante di invio
sendBtn.addEventListener("click", sendMessage);

// ⌨️ Event listener per il tasto Enter nel campo di input
userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // 🚫 Previene il comportamento default
        sendMessage(); // 📤 Invia il messaggio
    }
});

// 🚀 INIZIALIZZAZIONE APPLICAZIONE
// =================================

/**
 * 🚀 Inizializza l'applicazione quando il DOM è caricato
 */
document.addEventListener("DOMContentLoaded", function () {

    // 🎤 Inizializza riconoscimento vocale se supportato
    initSpeechRecognition();
    // 📚 Ripristino cronologia chat dal localStorage
    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    history.forEach(({ text, className }) => {
        // 🏗️ Ricrea ogni messaggio nella chat
        const div = document.createElement("div");
        div.className = className;
        div.textContent = text;
        chatBox.appendChild(div);
    });

    // 📜 Scrolla la chat fino in fondo
    chatBox.scrollTop = chatBox.scrollHeight;

    // 🔄 Ripristina lo stato precedente dell'interfaccia
    restoreViewState();

    // 📦 Controlla se c'era un ordine specifico visualizzato
    const currentOrderId = localStorage.getItem("currentOrderId");
    if (currentOrderId && localStorage.getItem("viewState") === "results") {
        // ✅ Ripristino completato (il codice necessario è già in restoreViewState)
    }

    // 🎬 Inizializza componenti aggiuntivi se esistono (es: avatar 3D)
    if (typeof window.init === "function") {
        window.init();
    }

    // 🎤 Event listener per modalità vocale
    voiceToggleBtn.addEventListener("click", function () {
        if (!recognition && !initSpeechRecognition()) {
            return; // Se non riesce a inizializzare, esce
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
});

// 🔄 CONTROLLI INTERFACCIA CHATBOT
// =================================

/**
 * 🔄 Gestisce la minimizzazione/espansione del chatbot
 */
document.addEventListener("DOMContentLoaded", function () {
    // 🔍 Cerca i componenti per il toggle della chat
    const toggleBtn = document.getElementById("toggle-chat");
    const chatContainer = document.querySelector(".chat-container");

    // ✅ Se esistono entrambi i componenti, aggiungi il comportamento
    if (toggleBtn && chatContainer) {
        toggleBtn.addEventListener("click", function () {
            // 🔄 Toggle della classe 'minimized' sul container
            const isMinimized = chatContainer.classList.toggle("minimized");

            // 🔄 Cambia il testo del pulsante in base allo stato
            toggleBtn.textContent = isMinimized ? "+" : "−";
        });
    }
});

// 🎤 GESTIONE RICONOSCIMENTO VOCALE---------------------------------------------------------------------------
// ==================================

/**
 * 🎤 Inizializza il riconoscimento vocale
 */
function initSpeechRecognition() {
    // Verifica supporto browser
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        appendMessage("❌ Il tuo browser non supporta il riconoscimento vocale", "bot-message");
        return false;
    }

    // Crea istanza riconoscimento vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    // Configurazione
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'it-IT';

    // Event listeners
    recognition.onstart = function () {
        voiceToggleBtn.textContent = "🔴 Ascoltando...";
        voiceToggleBtn.style.backgroundColor = "#dc3545";
        appendMessage("🎤 Sto ascoltando...", "bot-message");
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        appendMessage(transcript, "user-message");

        // Processa il comando vocale
        processVoiceCommand(transcript);
    };

    recognition.onerror = function (event) {
        console.error('Errore riconoscimento vocale:', event.error);
        appendMessage("❌ Errore nel riconoscimento vocale", "bot-message");
        resetVoiceButton();
    };

    recognition.onend = function () {
        resetVoiceButton();
        // Se modalità vocale attiva, riavvia ascolto dopo risposta
        if (isVoiceModeActive) {
            setTimeout(() => {
                if (isVoiceModeActive) {
                    startListening();
                }
            }, 2000);
        }
    };

    return true;
}

/**
 * 🎤 Avvia l'ascolto vocale
 */
function startListening() {
    if (recognition) {
        try {
            recognition.start();
        } catch (error) {
            console.error('Errore avvio riconoscimento:', error);
        }
    }
}

/**
 * 🔴 Ferma l'ascolto vocale
 */
function stopListening() {
    if (recognition) {
        recognition.stop();
    }
    resetVoiceButton();
}

/**
 * 🔄 Resetta il pulsante vocale
 */
function resetVoiceButton() {
    voiceToggleBtn.textContent = isVoiceModeActive ? "🎤 Modalità vocale ON" : "🎤 Modalità vocale";
    voiceToggleBtn.style.backgroundColor = isVoiceModeActive ? "#28a745" : "#007BFF";
}

/**
 * 🎤 Processa un comando vocale
 */
function processVoiceCommand(transcript) {
    // Prima prova con pattern veloci
    if (tryQuickPatterns(transcript)) {
        return;
    }

    // Altrimenti usa l'AI
    callOpenAIWithFunctions(transcript);
}

/**
 * 🔊 Fa parlare il chatbot
 */
function speakText(text) {
    // Rimuove emoji e caratteri speciali per la sintesi vocale
    const cleanText = text.replace(/[🎯📋💬🔍✅❌🔄🎤🔊📤📥🏢📅🔐💾🎨📦📡🚀⚡]/g, '');

    if (speechSynthesis && cleanText.trim()) {
        // Ferma eventuali sintesi in corso
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        speechSynthesis.speak(utterance);
    }
}


// 🎯 RIEPILOGO FUNZIONALITÀ PRINCIPALI:
// =====================================

/* 
🚀 FUNZIONALITÀ PRINCIPALI DEL CHATBOT SAP:

1. 💬 CHAT INTELLIGENTE:
   - Interpreta richieste in linguaggio naturale usando OpenAI
   - Pattern veloci per richieste comuni
   - Cronologia messaggi persistente

2. 🔍 INTERROGAZIONI SAP:
   - Recupero tutti gli ordini
   - Ricerca ordini specifici per numero
   - Filtri per fornitore, date, anni
   - Lista fornitori disponibili

3. 📦 GESTIONE ORDINI:
   - Visualizzazione dettagli completi
   - Rilascio ordini con conferma
   - Caricamento righe ordine

4. 💾 PERSISTENZA DATI:
   - Salvataggio stato interfaccia
   - Cache risultati SAP
   - Ripristino sessione precedente

5. 🎨 INTERFACCIA UTENTE:
   - Rendering HTML dinamico
   - Hover effects sui card
   - Messaggi di stato colorati
   - Toggle minimizza/espandi

6. 🔊 INTEGRAZIONE VOCALE:
   - Coda messaggi per sintesi vocale
   - Supporto avatar 3D (se implementato)

7. 🛡️ GESTIONE ERRORI:
   - Fallback per parsing AI
   - Gestione errori rete/SAP
   - Messaggi informativi per l'utente
*/
