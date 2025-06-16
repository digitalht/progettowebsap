

// 🔍 FUNZIONI SAP - RECUPERO DATI E RENDERING
// ===============sap.js============================

function getSingleOrder(orderId) {
    sapResults.innerHTML = "🔄 Caricamento ordine...";
    const url = `${urlPage}/sap/PurchaseOrderSet`;

    fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"),
            "Accept": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.d && data.d.results && data.d.results.length > 0) {
            const order = data.d.results.find(item => item.OrderNr === orderId);
            if (order) {
                renderOrderDetails(order);
            } else {
                sapResults.innerHTML = `❌ Ordine ${orderId} non trovato.`;
            }
        } else {
            sapResults.innerHTML = "❌ Nessun dato ricevuto da SAP.";
        }
    })
    .catch(error => {
        console.error("Errore SAP:", error);
        sapResults.innerHTML = `❌ Errore durante il recupero ordine: ${error.message}`;
    });
}

// function getSAPEntityData(entity, filterOrder = null, dateFilter = null, vendorName = null) {
//     sapResults.innerHTML = "🔄 Caricamento dati...";
//     const url = `${urlPage}/sap/${entity}`;

//     fetch(url, {
//         method: "GET",
//         headers: {
//             "Authorization": "Basic " + btoa("rcarini:Velcome24"),
//             "Accept": "application/json"
//         }
//     })
//     .then(async response => {
//         const contentType = response.headers.get("content-type");
//         if (!response.ok) throw new Error(await response.text());
//         if (contentType.includes("application/json")) return response.json();
//         throw new Error("Risposta non in formato JSON");
//     })
//     .then(data => {
//         let results = data?.d?.results || [];

//         // Applicazione filtri...
//         if (filterOrder) {
//             const ordine = results.find(o => o.OrderNr === filterOrder);
//             if (ordine) renderOrderDetails(ordine);
//             else sapResults.innerHTML = `❌ Nessun ordine trovato con numero ${filterOrder}`;
//             return;
//         }

//         if (dateFilter) {
//             const { operator, date, start, end } = dateFilter;
//             results = results.filter(o => {
//                 const sapDate = new Date(parseInt(o.MinDelivDate.match(/\d+/)?.[0] || "0"));
//                 if (start && end) return sapDate >= start && sapDate <= end;
//                 if (operator && date) return operator === "<" ? sapDate < date : sapDate > date;
//                 return true;
//             });
//         }

//         if (vendorName) {
//             results = results.filter(o => o.VendorName?.toLowerCase().includes(vendorName.toLowerCase()));
//         }

//         if (results.length === 0) {
//             sapResults.innerHTML = "⚠️ Nessun ordine trovato con questi criteri.";
//             return;
//         }

//         renderSAPData(entity, results);
//     })
//     .catch(error => {
//         console.error("Errore SAP:", error);
//         sapResults.innerHTML = `❌ Errore durante il recupero dati da SAP: ${error.message}`;
//     });
// }

function getSAPEntityData(entity, filterOrder = null, dateFilter = null, vendorName = null, releaseFilter = null) {
    sapResults.innerHTML = "🔄 Caricamento dati...";
    const url = `${urlPage}/sap/${entity}`;

    fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"),
            "Accept": "application/json"
        }
    })
    .then(async response => {
        const contentType = response.headers.get("content-type");
        if (!response.ok) throw new Error(await response.text());
        if (contentType.includes("application/json")) return response.json();
        throw new Error("Risposta non in formato JSON");
    })
    .then(data => {
        let results = data?.d?.results || [];

        // Applicazione filtri esistenti...
        if (filterOrder) {
            const ordine = results.find(o => o.OrderNr === filterOrder);
            if (ordine) renderOrderDetails(ordine);
            else sapResults.innerHTML = `❌ Nessun ordine trovato con numero ${filterOrder}`;
            return;
        }

        if (dateFilter) {
            const { operator, date, start, end } = dateFilter;
            results = results.filter(o => {
                const sapDate = new Date(parseInt(o.MinDelivDate.match(/\d+/)?.[0] || "0"));
                if (start && end) return sapDate >= start && sapDate <= end;
                if (operator && date) return operator === "<" ? sapDate < date : sapDate > date;
                return true;
            });
        }

        if (vendorName) {
            results = results.filter(o => o.VendorName?.toLowerCase().includes(vendorName.toLowerCase()));
        }

        // NUOVO FILTRO PER STATO RILASCIO
        if (releaseFilter !== null) {
            results = results.filter(o => o.IsReleased === releaseFilter.released);
        }

        if (results.length === 0) {
            const filterText = releaseFilter?.released === true ? "rilasciati" : 
                              releaseFilter?.released === false ? "non rilasciati" : "";
            sapResults.innerHTML = `⚠️ Nessun ordine ${filterText} trovato con questi criteri.`;
            return;
        }

        renderSAPData(entity, results, releaseFilter);
    })
    .catch(error => {
        console.error("Errore SAP:", error);
        sapResults.innerHTML = `❌ Errore durante il recupero dati da SAP: ${error.message}`;
    });
}

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
//                  <div style="
//                     display: inline-flex;
//                     align-items: center;
//                     gap: 8px;
//                     font-weight: 600; 
//                     font-size: 16px; 
//                     padding: 12px 18px;
//                     margin-bottom: 8px; 
//                     cursor: pointer; 
//                     color: #1e293b;
//                     background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//                     border: 2px solid #e2e8f0;
//                     border-radius: 10px;
//                     text-decoration: none;
//                     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//                     box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//                     " 
//                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(59, 130, 246, 0.3)'; this.style.background='linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; this.style.color='white'; this.style.borderColor='#2563eb';"
//                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.background='linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'; this.style.color='#1e293b'; this.style.borderColor='#e2e8f0';"
//                     onclick="getSingleOrder('${item.OrderNr}')">
//                         <span style="font-size: 18px;">📄</span>
//                         <span>Ordine #${item.OrderNr}</span>
//                     </div>
//                      <!-- 📅 Informazioni principali dell'ordine -->
//                      <div><strong>Data:</strong> ${formatSAPDate(item.MinDelivDate)}</div>
//                      <div><strong>Fornitore:</strong> ${item.VendorName}</div>
//                      <!-- 🔐 Pulsante per rilasciare l'ordine -->
                    
//                     <button 
//                         onclick="releaseOrder('${item.OrderNr}')" 
//                         style="
//                             background-color: #007BFF;
//                             color: white;
//                             border: none;
//                             padding: 11px 14px 13px 14px;
//                             margin-top: 20px;
//                             border-radius: 8px;
//                             cursor: pointer;
//                             font-weight: 500;
//                             font-size: 16px;
//                             box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
//                             transition: background-color 0.3s ease, transform 0.2s ease;
//                         "
//                         onmouseover="this.style.backgroundColor='#0056b3'; this.style.transform='scale(1.05)'"
//                         onmouseout="this.style.backgroundColor='#007BFF'; this.style.transform='scale(1)'"
//                     >               
//                          🔐 Rilascia ordine
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
//     sessionStorage.setItem("sapResultsCache", JSON.stringify({ entity, records }));
//     saveCurrentViewState();
// }
function renderSAPData(entity, records, releaseFilter = null) {
    const count = records.length;
    
    // Determina il titolo in base al filtro
    let titleSuffix = "";
    if (releaseFilter?.released === true) {
        titleSuffix = " - Solo Rilasciati ✅";
    } else if (releaseFilter?.released === false) {
        titleSuffix = " - Solo Non Rilasciati ❌";
    }

    // 🏗️ Genera HTML per ogni record
    const html = records.map(item => {
        if (entity === "PurchaseOrderSet") {
            // 📦 Template per ordini di acquisto con indicatore stato rilascio più evidente
            const releaseStatus = item.IsReleased ? 
                `<span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">✅ RILASCIATO</span>` :
                `<span style="background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">❌ NON RILASCIATO</span>`;
            
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
                        ${releaseStatus}
                    </div>
                     <!-- 📅 Informazioni principali dell'ordine -->
                     <div><strong>Data:</strong> ${formatSAPDate(item.MinDelivDate)}</div>
                     <div><strong>Fornitore:</strong> ${item.VendorName}</div>
                     <div><strong>Valore Totale:</strong> ${item.TotValue} ${item.CurrencyId}</div>
                     <div><strong>Stato:</strong> ${item.IsReleased ? "✅ Rilasciato" : "❌ Non rilasciato"}</div>
                     <!-- 🔐 Pulsante per rilasciare l'ordine (solo se non rilasciato) -->
                    ${!item.IsReleased ? `
                    <button 
                        onclick="releaseOrder('${item.OrderNr}')" 
                        style="
                            background-color: #007BFF;
                            color: white;
                            border: none;
                            padding: 11px 14px 13px 14px;
                            margin-top: 20px;
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
                    ` : `
                    <div style="margin-top: 20px; padding: 10px; background: #d4edda; color: #155724; border-radius: 8px; text-align: center;">
                        ✅ Ordine già rilasciato
                    </div>
                    `}
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
        <h3 style="font-size:20px; font-weight:600; color:#333;">📄 Risultati da ${entity}${titleSuffix}</h3>
        <p style="color:#155724; font-weight:500;">✅ Risultati trovati: ${count}</p>
        ${html}
    `;

    // 💾 Salva i risultati nella cache e nello stato
    sessionStorage.setItem("sapResultsCache", JSON.stringify({ entity, records, releaseFilter }));
    saveCurrentViewState();
}

function renderOrderDetails(order) {
    const orderId = order.OrderNr;
    
    const rilascioButtonHtml = order.IsReleased
        ? `<p style="color:green;">✅ Ordine già rilasciato</p>`
        : `<button onclick="releaseOrder('${orderId}')" style="
                            background-color: #28a745;
                            color: white;
                            border: none;
                            padding: 11px 14px 13px 14px;
                            margin-top: 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            font-size: 16px;
                            box-shadow: 0 4px 10px rgba(0, 255, 8, 0.3);
                            transition: background-color 0.3s ease, transform 0.2s ease;
                        "
                        onmouseover=" this.style.transform='scale(1.05)'"
                        onmouseout=" this.style.transform='scale(1)'">
            🔐 Rilascia ordine
        </button>`;

    const html = `
        <div style="position:relative; border:1px solid #28a745; padding:20px; border-radius:10px; background:#f9fff9;">
            <button onclick="goBackToResults()" style="
                position:absolute; 
                top:10px; 
                left:10px; 
                background:#6c757d; 
                color:white; 
                border:none; 
                padding:6px 12px; 
                border-radius:6px; 
                font-size:12px;
                cursor:pointer;
                display:flex;
                align-items:center;
                gap:4px;
            " title="Torna all'elenco">
                ← Indietro
            </button>
            
            <h4 style="margin-top:30px;">📦 Dettaglio Ordine ${order.OrderNr}</h4>
            <div><strong>Fornitore:</strong> ${order.VendorName} (${order.VendorId})</div>
            <div><strong>Totale:</strong> ${order.TotValue} ${order.CurrencyId}</div>
            <div><strong>Dipartimento:</strong> ${order.PurDepartName}</div>
            <div><strong>Data Consegna:</strong> ${formatSAPDate(order.MinDelivDate)}</div>
            <div><strong>Rilasciato:</strong> ${order.IsReleased ? "✅ Sì" : "❌ No"}</div>
            ${rilascioButtonHtml}
            <div id="order-items" style="margin-top:16px;">🔄 Caricamento righe ordine...</div>
        </div>
    `;

    sapResults.innerHTML = html;
    saveCurrentViewState();
    sessionStorage.setItem("currentOrderId", orderId);

    // Carica righe ordine
    fetch(`${urlPage}/sap/order-items/${orderId}`)
        .then(res => res.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const itemsHtml = data.items.map(item => `
                    <div style="border-top:1px dashed #ccc; margin-top:12px; padding-top:12px;">
                        <div><strong>Posizione:</strong> ${item.OrderPos}</div>
                        <div><strong>Prodotto:</strong> ${item.ProductId}</div>
                        <div><strong>Descrizione:</strong> ${item.ShortText}</div>
                        <div><strong>Prezzo:</strong> ${item.Price}</div>
                    </div>
                `).join("");
                
                document.getElementById("order-items").innerHTML = itemsHtml;
                saveCurrentViewState();
            } else {
                document.getElementById("order-items").innerHTML = "⚠️ Nessuna riga trovata.";
            }
        })
        .catch(err => {
            document.getElementById("order-items").innerHTML = "❌ Errore nel recupero delle righe ordine.";
        });
}

// 🔙 FUNZIONE PER TORNARE AI RISULTATI PRECEDENTI
// ================================================

function goBackToResults() {
    // Recupera i risultati precedenti dalla cache
    const cachedResults = sessionStorage.getItem("sapResultsCache");
    
    if (cachedResults) {
        try {
            const { entity, records } = JSON.parse(cachedResults);
            renderSAPData(entity, records);
        } catch (error) {
            console.error("Errore nel recupero cache:", error);
            // Se non riesce a recuperare dalla cache, ricarica tutti gli ordini
            getSAPEntityData("PurchaseOrderSet");
        }
    } else {
        // Se non c'è cache, ricarica tutti gli ordini
        getSAPEntityData("PurchaseOrderSet");
    }
    
    // Rimuove l'ordine corrente dal sessionStorage
    sessionStorage.removeItem("currentOrderId");
}

function releaseOrder(orderId) {
    if (!confirm(`🔐 Vuoi rilasciare l'ordine ${orderId}?`)) return;

    appendMessage(`🔄 Rilascio in corso per ordine ${orderId}...`, "bot-message");

    fetch(`${urlPage}/sap/release/${orderId}`, {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"),
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            appendMessage(`✅ Ordine ${orderId} rilasciato con successo.`, "bot-message");
            getSingleOrder(orderId);
        } else {
            appendMessage(`❌ Errore nel rilascio dell'ordine ${orderId}`, "bot-message");
        }
    })
    .catch(err => {
        console.error("Errore rilascio:", err);
        appendMessage(`❌ Errore nel rilascio dell'ordine ${orderId}`, "bot-message");
    });
}

function listVendors() {
    fetch(`${urlPage}/sap/PurchaseOrderSet`, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + btoa("rcarini:Velcome24"),
            "Accept": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        const results = data?.d?.results || [];
        const vendors = [...new Set(results.map(r => r.VendorName).filter(Boolean))].sort();

        if (vendors.length === 0) {
            sapResults.innerHTML = "⚠️ Nessun fornitore trovato.";
        } else {
            sapResults.innerHTML = `
                <h4>🏢 Fornitori disponibili</h4>
                <ul>${vendors.map(v => `<li>${v}</li>`).join("")}</ul>
            `;
        }
    })
    .catch(err => {
        console.error("Errore elenco fornitori:", err);
        sapResults.innerHTML = "❌ Errore durante il recupero fornitori.";
    });
}