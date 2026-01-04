// 1. KONFIGURATION
const apiKey = '5mDJmGbfPpOWOEB2R8aKKaP5vXjwPVFbfacIUaM8';

// 2. HUVUDFUNKTION FÖR ATT HÄMTA DATA
async function getSpaceData(targetDate = "") {
    console.log("Anropar NASA...");
    
    // Om inget datum anges, skicka ingen datum-parameter alls (NASA väljer då senaste bilden)
    let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    if (targetDate) {
        url += `&date=${targetDate}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("NASA svarar inte");
        
        const data = await response.json();
        renderContent(data);
        
        // Vi översätter bara titeln för att vara säkra på att det inte kraschar
        translateToSwedish(data.title, 'title');
        // Beskrivningen behåller vi på engelska eller översätter separat om den inte är för lång
        if(data.explanation.length < 1000) {
            translateToSwedish(data.explanation, 'description');
        }

    } catch (error) {
        console.error("Fel vid hämtning:", error);
        showFallback();
    }
}

// 3. FUNKTION FÖR ATT VISA INNEHÅLLET
function renderContent(data) {
    // Sätt textinnehåll
    document.getElementById('title').innerText = data.title;
    document.getElementById('date-display').innerText = `Rymdarkivet: ${data.date}`;
    
    // Skapa snygg artikelstart
    const descriptionElement = document.getElementById('description');
    const firstLetter = data.explanation.charAt(0);
    const restOfText = data.explanation.slice(1);
    descriptionElement.innerHTML = `<span class="first-letter">${firstLetter}</span>${restOfText}`;

    const mediaContainer = document.getElementById('media-container');
    if(data.media_type === "video") {
        mediaContainer.innerHTML = `<iframe src="${data.url}" frameborder="0" allowfullscreen class="nasa-video" style="height:400px; width:100%; border-radius:10px;"></iframe>`;
    } else {
        mediaContainer.innerHTML = `<img src="${data.url}" alt="${data.title}" class="nasa-image" style="width:100%; border-radius:10px; cursor:pointer;" onclick="window.open(this.src, '_blank')">`;
    }
}

// 4. RESERVPLAN
function showFallback() {
    document.getElementById('title').innerText = "Vintergatan väntar";
    document.getElementById('description').innerText = "Just nu har vi svårt att nå NASA:s servrar. Det kan bero på tillfälligt underhåll. Prova att ladda om sidan om en liten stund!";
    
    // Använd en stabil länk från Unsplash istället för en lokal fil
    const mediaContainer = document.getElementById('media-container');
    mediaContainer.innerHTML = `<img src="https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=1200&q=80" style="width:100%; border-radius:10px;" alt="Stjärnhimmel">`;
}
// 5. ÖVERSÄTTNING
async function translateToSwedish(text, elementId) {
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|sv`);
        const json = await res.json();
        if(json.responseData.translatedText) {
            if(elementId === 'description') {
                const txt = json.responseData.translatedText;
                document.getElementById(elementId).innerHTML = `<span class="first-letter">${txt.charAt(0)}</span>${txt.slice(1)}`;
            } else {
                document.getElementById(elementId).innerText = json.responseData.translatedText;
            }
        }
    } catch (err) {
        console.log("Översättning misslyckades.");
    }
}

// 6. ALLA EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    // 1. Hämta dagens bild
    getSpaceData();

    // 2. Hantera Sök-knapp
    const searchBtn = document.getElementById('search-btn');
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            const pickedDate = document.getElementById('search-date').value;
            if (pickedDate) {
                getSpaceData(pickedDate);
            }
        });
    }

    // 3. Starta rymdfakta
    displayNewFact();

    // 4. Cookie-banner logik
    const cookieBanner = document.getElementById('cookie-banner');
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => cookieBanner.classList.add('show'), 2000);
    }
});

// --- ÖVRIGA HJÄLPFUNKTIONER ---

const spaceFacts = [
    "En dag på Venus är längre än ett år på Venus.",
    "Neutronstjärnor är så täta att en tesked väger som Mount Everest.",
    "Det regnar diamanter på Jupiter och Saturnus.",
    "Vi ser in i det förflutna när vi tittar på stjärnorna.",
    "Olympus Mons på Mars är solsystemets högsta vulkan."
];

function displayNewFact() {
    const factElement = document.getElementById('fun-fact');
    if (factElement) {
        const randomIndex = Math.floor(Math.random() * spaceFacts.length);
        factElement.innerText = spaceFacts[randomIndex];
    }
}

function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookie-banner').classList.remove('show');
}

window.onclick = function(event) {
    if (event.target.className === 'modal') event.target.style.display = "none";
}
