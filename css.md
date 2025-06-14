body {
    font-family: Arial, sans-serif;
    background-color: #f2f2f2;
    margin: 0;
    padding: 0;
    height: 100vh;
    overflow: hidden;
    position: relative;
    display: flex;
}

/* title */
.sap-order-header {
    width: 100%;
    max-width: 600px;
    margin: -15px auto 2px auto;
    padding: 20px;
    background: linear-gradient(90deg, #007BFF, #00C6FF);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;

}

/* pastest */


.sap-order-header h2 {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 1px;
}

.chat-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;

}

.chat-container {
    width: 40%;
    max-height: 90vh;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 10;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.chat-header {
    background: #2196F3;
    color: white;
    text-align: center;
    padding: 10px;
    font-size: 18px;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.chat-box {
    height: 400px;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    background: #e3f2fd;
    flex-grow: 1;
}

.user-message,
.bot-message {
    max-width: 70%;
    padding: 8px;
    margin: 5px;
    border-radius: 10px;
}

.user-message {
    align-self: flex-end;
    background: #4CAF50;
    color: white;
}

.bot-message {
    align-self: flex-start;
    background: white;
    color: black;
}

.chat-input {
    display: flex;
    padding: 10px;
    background: #f2f2f2;
}

.chat-input input {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 5px;
}

.chat-input button {
    padding: 8px 12px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    margin-left: 5px;
    cursor: pointer;
}

.dynamic-result,
#sap-results {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
    border-right: 1px solid #ccc;
    background-color: #fff8dc;
    font-size: 14px;
    color: #333;
    white-space: pre-line;
    padding: 50px 0 0 0;
    
}

/* chiusura chatbot */
.chat-toggle-btn {
    float: right;
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    margin-top: -2px;
}

.chat-container.minimized .chat-box,
.chat-container.minimized .chat-input {
    display: none;
}

.chat-container.minimized {
    height: auto;
}

/* Nasconde il contenuto se vuoto per far vedere solo l'altro */
#sap-results:empty {
    display: none;
}

#dynamic-result:empty {
    display: none;
}

@media (max-width: 768px) {

    .chat-container,
    .dynamic-result,
    #sap-results {
        width: 100%;
        height: 50vh;
        position: relative;
        max-height: none;
        border-radius: 0;
        border-right: none;
        box-shadow: none;
    }

    body {
        flex-direction: column;
    }

    .chat-wrapper {
        height: auto;
    }
}