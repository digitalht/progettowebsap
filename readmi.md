<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assistant Order</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <link rel="stylesheet" href="css/styles.css">
</head>

<body>

    <body>
        <div class="sap-order-header">
            <h2>SAP Purchase Orders</h2>
        </div>
        <div class="chat-wrapper">
            <div class="chat-container">
                <div class="chat-header">
                    <button id="toggle-chat" class="chat-toggle-btn">−</button>
                    <p>
                        HT Assistant
                    </p>

                    <div>
                        <button id="voice-toggle" style="
                       
                       background-color: #007BFF;
                       color: white;
                       border: none;
                       padding: 8px 14px;
                       border-radius: 6px;
                       cursor: pointer;
                       font-weight: 500;
                       z-index: 1000;">
                            🎤
                        </button>
                        <!-- tasto cancella cronologia -->
                        <button id="bin" style="
                       
                       background-color: #007BFF;
                       color: white;
                       border: none;
                       padding: 8px 14px;
                       border-radius: 6px;
                       cursor: pointer;
                       font-weight: 500;
                       z-index: 1000;">
                            ♻️
                        </button>
                    </div>
                </div>
                <div class="chat-box" id="chat-box"></div>
                <div class="chat-input">
                    <input type="text" id="user-input" placeholder="Scrivi un messaggio...">
                    <button id="send-btn">Send</button>
                </div>
            </div>
            <!-- Risultati dinamici da SAP -->
            <div id="sap-results" class="dynamic-result"></div>


            <!-- Area per i risultati dinamici -->
            <div id="dynamic-result" class="dynamic-result"></div>
        </div>



        <!-- <script src="js/script.js"></script> -->
        <!-- Prima i file di configurazione e utilità -->
        <script src="js/config.js"></script>

        <!-- Poi i moduli funzionali -->
        <script src="js/chat.js"></script>
        <script src="js/sap.js"></script>
        <script src="js/voice.js"></script>

        <!-- Infine l'inizializzazione -->
        <script src="js/main.js"></script>
    </body>
</body>

</html>


<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAP Assistant - HT</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            color: #2d3748;
            font-size: 1.8rem;
            font-weight: 700;
        }

        .home-btn {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(66, 153, 225, 0.4);
            display: none;
        }

        .home-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(66, 153, 225, 0.6);
        }

        .home-btn.show {
            display: block;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .home-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .welcome-card {
            text-align: center;
            margin-bottom: 3rem;
        }

        .welcome-card h2 {
            font-size: 2.5rem;
            color: #2d3748;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .welcome-card p {
            font-size: 1.2rem;
            color: #718096;
            line-height: 1.6;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid #e2e8f0;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .feature-card h3 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }

        .feature-card p {
            color: #718096;
            line-height: 1.6;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .action-btn {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
        }

        .chat-wrapper {
            display: flex;
            gap: 2rem;
            margin-top: 2rem;
        }

        .chat-container {
            flex: 1;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-toggle-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }

        .chat-toggle-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .chat-controls {
            display: flex;
            gap: 0.5rem;
        }

        .control-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .control-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .chat-box {
            height: 400px;
            overflow-y: auto;
            padding: 1rem;
            background: #f8fafc;
        }

        .chat-input {
            display: flex;
            padding: 1rem;
            background: white;
            border-top: 1px solid #e2e8f0;
        }

        .chat-input input {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
        }

        .chat-input input:focus {
            border-color: #4299e1;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .send-btn {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            margin-left: 0.5rem;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .send-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
        }

        .dynamic-result {
            flex: 1.5;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            min-height: 500px;
        }

        .user-message {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 18px 18px 4px 18px;
            margin: 8px 0;
            margin-left: 20%;
            word-wrap: break-word;
        }

        .bot-message {
            background: #f7fafc;
            color: #2d3748;
            padding: 12px 16px;
            border-radius: 18px 18px 18px 4px;
            margin: 8px 0;
            margin-right: 20%;
            border-left: 4px solid #4299e1;
        }

        .hidden {
            display: none !important;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            .chat-wrapper {
                flex-direction: column;
            }

            .features-grid {
                grid-template-columns: 1fr;
            }

            .quick-actions {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>🏢 SAP Assistant</h1>
        <button id="home-btn" class="home-btn" onclick="showHome()">🏠 Home</button>
    </div>

    <div class="chat-wrapper">
        <div class="chat-container">
            <div class="chat-header">
                <button id="toggle-chat" class="chat-toggle-btn">−</button>
                <p>
                    HT Assistant
                </p>

                <div>
                    <button id="voice-toggle" style="
                       
                       background-color: #007BFF;
                       color: white;
                       border: none;
                       padding: 8px 14px;
                       border-radius: 6px;
                       cursor: pointer;
                       font-weight: 500;
                       z-index: 1000;">
                        🎤
                    </button>
                    <!-- tasto cancella cronologia -->
                    <button id="bin" style="
                       
                       background-color: #007BFF;
                       color: white;
                       border: none;
                       padding: 8px 14px;
                       border-radius: 6px;
                       cursor: pointer;
                       font-weight: 500;
                       z-index: 1000;">
                        ♻️
                    </button>
                </div>
            </div>
            <div class="chat-box" id="chat-box"></div>
            <div class="chat-input">
                <input type="text" id="user-input" placeholder="Scrivi un messaggio...">
                <button id="send-btn">Send</button>
            </div>
        </div>


        
        <!-- Area per i risultati dinamici -->
        <!-- Risultati dinamici da SAP -->
        <div id="sap-results" class="dynamic-result"></div>
        <!-- <div id="dynamic-result" class="dynamic-result"></div> -->
    </div>

    <div class="container">
        <!-- HOME SECTION -->
        <div id="home-section " class="home-section">
            <div class="welcome-card">
                <h2>👋 Benvenuto nel SAP Assistant</h2>
                <p>Il tuo assistente intelligente per la gestione degli ordini di acquisto SAP.
                    Utilizza comandi naturali per interrogare, visualizzare e gestire i tuoi ordini in modo semplice e
                    veloce.</p>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <h3>Ricerca Intelligente</h3>
                    <p>Trova ordini utilizzando linguaggio naturale. Puoi cercare per numero ordine, fornitore, data o
                        qualsiasi altro criterio.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🎤</div>
                    <h3>Controllo Vocale</h3>
                    <p>Interagisci con l'assistente usando la voce. Perfetto per operazioni hands-free e maggiore
                        produttività.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🔐</div>
                    <h3>Gestione Ordini</h3>
                    <p>Rilascia ordini, visualizza dettagli e gestisci il workflow direttamente dall'interfaccia
                        conversazionale.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Analytics Avanzate</h3>
                    <p>Visualizza statistiche, trend e analisi dei tuoi ordini di acquisto con grafici e report
                        dettagliati.</p>
                </div>
            </div>

            <div class="quick-actions">
                <button class="action-btn" onclick="quickSearch('tutti gli ordini')">
                    📋 Tutti gli Ordini
                </button>
                <button class="action-btn" onclick="quickSearch('ordini di oggi')">
                    📅 Ordini di Oggi
                </button>
                <button class="action-btn" onclick="quickSearch('lista fornitori')">
                    🏢 Lista Fornitori
                </button>
                <button class="action-btn" onclick="quickSearch('ordini da rilasciare')">
                    🔐 Da Rilasciare
                </button>
            </div>
        </div>





        <!-- <script src="js/script.js"></script> -->
        <!-- Prima i file di configurazione e utilità -->
        <script src="js/config.js"></script>

        <!-- Poi i moduli funzionali -->
        <script src="js/chat.js"></script>
        <script src="js/sap.js"></script>
        <script src="js/voice.js"></script>

        <!-- Infine l'inizializzazione -->
        <script src="js/main.js"></script>
    </div>


</body>

</html>