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
    const container = document.getElementById('media-container');
    const title = document.getElementById('title');
    const desc = document.getElementById('description');

    title.innerText = "Universum vilar aldrig (men NASA:s server gör det)";
    
    desc.innerHTML = `
        <p>Just nu har NASA:s bildarkiv lite tekniska problem, men rymden är lika vacker för det! 
        Under tiden vi väntar på att anslutningen ska komma igång igen kan du läsa våra senaste artiklar här nedanför.</p>
        <p><i>Tips: Prova att ladda om sidan om en stund för att se dagens unika bild!</i></p>
    `;

    container.innerHTML = `
        <img src="backup.jpg" alt="Vacker rymdbild" class="featured-image" style="width:100%; border-radius:15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    `;
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

    // 4. Starta rymdnyheter (HÄR LÄGGER VI TILL DEN!)
    fetchSpaceNews();

    // 5. Cookie-banner logik
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && !localStorage.getItem('cookiesAccepted')) {
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

async function fetchSpaceNews() {
    const newsContainer = document.getElementById('news-container');
    
    try {
        // Vi hämtar de 3 senaste artiklarna från pålitliga källor
        const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=3');
        const data = await response.json();
        
        newsContainer.innerHTML = ''; // Rensa laddnings-texten

        data.results.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            
            card.innerHTML = `
                <img src="${article.image_url}" class="news-image" alt="${article.title}">
                <div class="news-content">
                    <span class="news-site">${article.news_site}</span>
                    <h3 class="news-title">${article.title}</h3>
                    <a href="${article.url}" target="_blank" class="news-btn">Läs artikeln <span>→</span></a>
                </div>
            `;
            newsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Kunde inte hämta nyheter:", error);
        newsContainer.innerHTML = '<p>Kunde inte ladda nyheter just nu. Men rymden finns kvar!</p>';
    }
}

// Kom ihåg att anropa funktionen i din DOMContentLoaded:
 fetchSpaceNews();

function shareOnFacebook() {
    const url = window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}
