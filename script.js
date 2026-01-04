// 1. KONFIGURATION
const apiKey = '5mDJmGbfPpOWOEB2R8aKKaP5vXjwPVFbfacIUaM8';
const today = new Date().toISOString().split("T")[0];

// 2. HUVUDFUNKTION FÖR ATT HÄMTA DATA
async function getSpaceData(date = "") {
    console.log("Startar hämtning...");
    const targetDate = date || today;
    
    // Kolla om vi redan har detta datum i cachen
    const cachedData = localStorage.getItem('nasa_cache_' + targetDate);
    if (cachedData) {
        console.log("Hittade i cachen!");
        renderContent(JSON.parse(cachedData));
        return; 
    }

    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${targetDate}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Ökat till 15 sekunder 

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("NASA svarar inte");
        
        const data = await response.json();
        clearTimeout(timeoutId);

        localStorage.setItem('nasa_cache_' + targetDate, JSON.stringify(data));
        
        renderContent(data);
        
        // Översätt i efterhand
        translateToSwedish(data.title, 'title');
        translateToSwedish(data.explanation, 'description');

    } catch (error) {
        console.error("Fel vid hämtning:", error);
        showFallback();
    }
}

// 3. FUNKTION FÖR ATT VISA INNEHÅLLET
function renderContent(data) {
    const isSearch = data.date !== today;
    const titlePrefix = isSearch ? `Rymden den ${data.date}: ` : "";
    
    document.getElementById('title').innerText = titlePrefix + data.title;
    document.getElementById('date-display').innerText = `Datum: ${data.date}`;
    document.getElementById('description').innerText = data.explanation;

    const mediaContainer = document.getElementById('media-container');
    if(data.media_type === "video") {
        mediaContainer.innerHTML = `<iframe src="${data.url}" frameborder="0" allowfullscreen style="height:400px; width:100%; border-radius:10px;"></iframe>`;
    } else {
        mediaContainer.innerHTML = `<img src="${data.url}" alt="${data.title}" style="width:100%; border-radius:10px;">`;
    }
}

// 4. RESERVPLAN OM NÅGOT GÅR FEL
function showFallback() {
    document.getElementById('title').innerText = "Stjärnorna tar en paus";
    document.getElementById('description').innerText = "Just nu når vi inte NASA. Prova att ladda om sidan eller sök på ett annat datum!";
    document.getElementById('media-container').innerHTML = `<img src="https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=800&q=80" style="width:100%; border-radius:10px;">`;
}

// 5. ÖVERSÄTTNING
async function translateToSwedish(text, elementId) {
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|sv`);
        const json = await res.json();
        if(json.responseData.translatedText) {
            document.getElementById(elementId).innerText = json.responseData.translatedText;
        }
    } catch (err) {
        console.log("Översättning misslyckades.");
    }
}

// 6. EVENT LISTENERS (KNAPPAR)
document.addEventListener('DOMContentLoaded', () => {
    // Sätt max-datum till idag
    const dateInput = document.getElementById('search-date');
    if(dateInput) dateInput.max = today;

    // Lyssna på sökknappen
    const searchBtn = document.getElementById('search-btn');
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            const pickedDate = document.getElementById('search-date').value;
            if (pickedDate) {
                document.getElementById('title').innerText = "Hämtar rymden...";
                getSpaceData(pickedDate);
            } else {
                alert("Välj ett datum först!");
            }
        });
    }

    // Kör första hämtningen för idag
    getSpaceData();
});

const spaceFacts = [
    "En dag på Venus är längre än ett år på Venus. Det tar planeten längre tid att rotera runt sin egen axel än att gå ett varv runt solen.",
    "Neutronstjärnor är så täta att en tesked av deras material skulle väga lika mycket som Mount Everest.",
    "Det finns fler stjärnor i universum än vad det finns sandkorn på alla jordens stränder tillsammans.",
    "I rymden kan ingen höra dig skrika. Eftersom det inte finns någon luft (medium) kan ljudvågor inte färdas.",
    "Footavtrycken på månen kommer att finnas kvar i miljontals år eftersom det inte finns någon vind som kan blåsa bort dem.",
    "Olympus Mons på Mars är den högsta vulkanen i solsystemet, den är tre gånger högre än Mount Everest.",
    "Solens massa utgör 99,86% av hela solsystemets totala massa.",
    "Det regnar diamanter på planeterna Jupiter och Saturnus.",
    "Vi ser faktiskt in i det förflutna när vi tittar på stjärnorna. Ljuset från den närmaste stjärnan (förutom solen) tar 4,2 år att nå oss."
];

function displayNewFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    const factElement = document.getElementById('fun-fact');
    if (factElement) {
        factElement.style.opacity = 0; // Enkel animeringseffekt
        setTimeout(() => {
            factElement.innerText = spaceFacts[randomIndex];
            factElement.style.opacity = 1;
        }, 300);
    }
}

// Kör funktionen när sidan laddas (lägg till denna rad inuti din DOMContentLoaded-listener)
displayNewFact();

function openModal(id) {
    document.getElementById(id).style.display = "block";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// Stäng modalen om man klickar utanför boxen
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}

// --- COOKIE LOGIK ---
const cookieBanner = document.getElementById('cookie-banner');
const hasAccepted = localStorage.getItem('cookiesAccepted');

// Visa bannern efter 2 sekunder om de inte redan accepterat
if (!hasAccepted) {
    setTimeout(() => {
        cookieBanner.classList.add('show');
    }, 2000);
}

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.classList.remove('show');
}