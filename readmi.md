// function makeAvatarSpeak(text) {
//     if (!modelLoaded || !avatar) {
//         console.warn("Avatar non pronto per parlare.");
//         return;
//     }

//     console.log("Inizializzazione parlato per avatar:", avatar);

//     let head = null;
//     avatar.traverse((child) => {
//         if (child.name === 'mixamorigHead') {
//             head = child;
//             console.log("Trovata testa:", child.name);
//         }
//     });

//     if (!head) {
//         console.warn("Nessuna testa trovata per l'animazione.");
//         return;
//     }

//     let mouthParts = [];
//     avatar.traverse((child) => {
//         // Filtro per evitare di includere occhi, sopracciglia, naso, palpebre e altre parti non correlate alla bocca
//         if (
//             (child.type === 'SkinnedMesh' || child.type === 'Mesh') &&
//             !isEyePart(child) && // Escludi occhi
//             !child.name.toLowerCase().includes("brow") && // Escludi sopracciglia
//             !child.name.toLowerCase().includes("nose") && // Escludi naso
//             !child.name.toLowerCase().includes("iris") && // Escludi iris
//             !child.name.toLowerCase().includes("pupil") && // Escludi pupille
//             !child.name.toLowerCase().includes("lid") // Escludi palpebre
//         ) {
//             mouthParts.push(child);
//             console.log("Parte della bocca identificata:", child.name);
//         }
//     });

//     // Funzione che verifica se la parte fa parte di un occhio, escludendo anche parti gerarchiche
//     function isEyePart(child) {
//         let parent = child.parent;
//         while (parent) {
//             // Se il nome del nodo o del genitore contiene "eye", è un nodo che riguarda gli occhi
//             if (parent.name.toLowerCase().includes("eye") || 
//                 child.name.toLowerCase().includes("eye") || 
//                 parent.name.toLowerCase().includes("iris") ||
//                 parent.name.toLowerCase().includes("pupil")) {
//                 return true; // Exclude this node (it's part of the eyes)
//             }
//             parent = parent.parent;
//         }
//         return false;
//     }

//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "it-IT"; // Imposta la lingua

//     // Seleziona una voce italiana, se disponibile
//     setTimeout(() => {
//         const voices = synth.getVoices();
//         const italianVoice = voices.find(voice => voice.lang.includes('it-IT'));
//         if (italianVoice) {
//             utterance.voice = italianVoice;
//             console.log("Voce selezionata:", italianVoice.name);
//         } else {
//             console.warn("Voce italiana non trovata, usando la voce predefinita.");
//         }
//         synth.speak(utterance);
//     }, 100);

//     // Salva la rotazione originale della testa
//     const originalHeadRotation = head.rotation.clone();
//     let isSpeaking = true;
//     let time = 0;

//     let interval = setInterval(() => {
//         if (!isSpeaking) return;

//         time += 0.15; // Aumentato il tempo per un'animazione più visibile

//         // Oscillazione della testa più evidente
//         head.rotation.y = originalHeadRotation.y + Math.sin(time) * 0.01; // Oscilla lateralmente
//         head.rotation.x = originalHeadRotation.x + Math.sin(time * 0.7) * 0.05; // Oscillazione verticale

//         // Anima la bocca senza muovere occhi/naso
//         mouthParts.forEach(part => {
//             if (part.morphTargetInfluences && part.morphTargetInfluences.length > 0) {
//                 for (let i = 0; i < part.morphTargetInfluences.length; i++) {
//                     if (i % 2 === 0) {
//                         part.morphTargetInfluences[i] = Math.random() * 0.8;
//                     }
//                 }
//             } else {
//                 part.scale.y = 1 + Math.random() * 0.3;
//             }
//         });

//         // Aggiorna la scena
//         renderer.render(scene, camera);

//     }, 50);

//     utterance.onend = () => {
//         isSpeaking = false;
//         clearInterval(interval);

//         // Ripristina la testa e la bocca alla posizione originale
//         head.rotation.copy(originalHeadRotation);

//         mouthParts.forEach(part => {
//             if (part.morphTargetInfluences) {
//                 for (let i = 0; i < part.morphTargetInfluences.length; i++) {
//                     part.morphTargetInfluences[i] = 0;
//                 }
//             } else {
//                 part.scale.set(1, 1, 1);
//             }
//         });

//         // Render finale
//         renderer.render(scene, camera);
//     };
// }

// function makeAvatarSpeak(text) {
//     if (!modelLoaded || !avatar) {
//         console.warn("Avatar non pronto per parlare.");
//         return;
//     }

//     console.log("Inizializzazione parlato per avatar:", avatar);

//     let head = null;
//     avatar.traverse((child) => {
//         if (child.name === 'mixamorigHead') {
//             head = child;
//             console.log("Trovata testa:", child.name);
//         }
//     });

//     if (!head) {
//         console.warn("Nessuna testa trovata per l'animazione.");
//         return;
//     }

//     let mouthParts = [];
//     avatar.traverse((child) => {
//         // Filtro per evitare di includere occhi, sopracciglia, naso, palpebre e altre parti non correlate alla bocca
//         if (
//             (child.type === 'SkinnedMesh' || child.type === 'Mesh') &&
//             !isEyePart(child) && // Escludi occhi
//             !child.name.toLowerCase().includes("brow") && // Escludi sopracciglia
//             !child.name.toLowerCase().includes("nose") && // Escludi naso
//             !child.name.toLowerCase().includes("iris") && // Escludi iris
//             !child.name.toLowerCase().includes("pupil") && // Escludi pupille
//             !child.name.toLowerCase().includes("lid") // Escludi palpebre
//         ) {
//             mouthParts.push(child);
//             console.log("Parte della bocca identificata:", child.name);
//         }
//     });

//     // Funzione che verifica se la parte fa parte di un occhio, escludendo anche parti gerarchiche
//     function isEyePart(child) {
//         let parent = child.parent;
//         while (parent) {
//             // Se il nome del nodo o del genitore contiene "eye", "mesh_4" o "mesh_5", è un nodo che riguarda gli occhi
//             if (parent.name.toLowerCase().includes("eye") || 
//                 child.name.toLowerCase().includes("eye") || 
//                 parent.name.toLowerCase().includes("iris") ||
//                 parent.name.toLowerCase().includes("pupil") ||
//                 child.name === "mesh_4" || // Aggiunta la condizione per "mesh_4"
//                 child.name === "mesh_5") { // Aggiunta la condizione per "mesh_5"
//                 return true; // Exclude this node (it's part of the eyes)
//             }
//             parent = parent.parent;
//         }
//         return false;
//     }

//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "it-IT"; // Imposta la lingua

//     // Seleziona una voce italiana, se disponibile
//     setTimeout(() => {
//         const voices = synth.getVoices();
//         const italianVoice = voices.find(voice => voice.lang.includes('it-IT'));
//         if (italianVoice) {
//             utterance.voice = italianVoice;
//             console.log("Voce selezionata:", italianVoice.name);
//         } else {
//             console.warn("Voce italiana non trovata, usando la voce predefinita.");
//         }
//         synth.speak(utterance);
//     }, 100);

//     // Salva la rotazione originale della testa
//     const originalHeadRotation = head.rotation.clone();
//     let isSpeaking = true;
//     let time = 0;

//     let interval = setInterval(() => {
//         if (!isSpeaking) return;

//         time += 0.05; // Aumentato il tempo per un'animazione più visibile

//         // Oscillazione della testa più evidente
//         head.rotation.y = originalHeadRotation.y + Math.sin(time) * 0.01; // Oscilla lateralmente
//         head.rotation.x = originalHeadRotation.x + Math.sin(time * 0.7) * 0.05; // Oscillazione verticale

//         // Anima la bocca senza muovere occhi/naso
//         mouthParts.forEach(part => {
//             if (part.morphTargetInfluences && part.morphTargetInfluences.length > 0) {
//                 for (let i = 0; i < part.morphTargetInfluences.length; i++) {
//                     if (i % 2 === 0) {
//                         part.morphTargetInfluences[i] = Math.random() * 0.5;
//                     }
//                 }
//             } else {
//                 part.scale.y = 1 + Math.random() * 0.3;
//             }
//         });

//         // Aggiorna la scena
//         renderer.render(scene, camera);

//     }, 50);

//     utterance.onend = () => {
//         isSpeaking = false;
//         clearInterval(interval);

//         // Ripristina la testa e la bocca alla posizione originale
//         head.rotation.copy(originalHeadRotation);

//         mouthParts.forEach(part => {
//             if (part.morphTargetInfluences) {
//                 for (let i = 0; i < part.morphTargetInfluences.length; i++) {
//                     part.morphTargetInfluences[i] = 0;
//                 }
//             } else {
//                 part.scale.set(1, 1, 1);
//             }
//         });

//         // Render finale
//         renderer.render(scene, camera);
//     };
// }