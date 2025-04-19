const image = new Image();
const solvedImage = new Image();
const TILECOUNT = 4;
const SHUFFLES = 1;
if (window.innerWidth < 800) {
    image.src = 'stuff/puzzle-small.png';
    solvedImage.src = 'stuff/solved-small.png';
} else {
    image.src = 'stuff/puzzle.png';
    solvedImage.src = 'stuff/solved.png';
}
solvedImage.classList.add('hiding');
let solvedAudio;
let blank;
let grid;
let ansBut;
const SECONDSTAGE = `
    <div id="mech">
        <p>Miau?</p>
        <input id="answerBox"></input><button onClick="checkAnswer()" id="answerButton">vastaa</button>
        <p id="hint" class="hiding"></p>
    </div>
`;
let effort = 0;
let success = 0;
const answerGroups = {
    close: new Set(["kissa", "haamu", "kummitus", "katti", "kisu", "aave", "kummittelu", "kummittelee", "henki", "tassut",
        "kustaa", "kustaa ii aadolf", "kustaa ii aadolf", "kustaa 2 aadolf", "kustaa ii adolf", "kustaa 2 adolf",
        "gustav ii adolf", "gustav 2 adolf", "gustav ii aadolf", "gustavus adolphus", "gustaf adolf", "gustaf ii adolf",
        "gustafus", "kustaa", "gustav", "adolf", "aadolf", "gustaf"
    ]),
    taunt: new Set(["linna", "hämeenlinna", "hämeen linna", "rakennus", "tavastehus", "linnoitus"]),
    correct: "pirskatti"
};
const messages = {
    close: "polttaa...",
    taunt: "Ihanko totta? \u{1FAE0}",
    default: "hmm..."
};

image.onload = () => {
    const tileSize = image.width / TILECOUNT;
    let i = 0;
    for (let y = 0; y < TILECOUNT; y++) {
        for (let x = 0; x < TILECOUNT; x++) {
            const tileCanvas = document.createElement('canvas');
            const wrapper = document.createElement('div');
            wrapper.classList.add('cell');
            wrapper.dataset.index = i;
            i++;
            tileCanvas.width = tileSize;
            tileCanvas.height = tileSize;
            const ctx = tileCanvas.getContext('2d');
            ctx.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);
            wrapper.appendChild(tileCanvas);
            document.getElementById('tileContainer').appendChild(wrapper);
        }
    }

    //SHUFFLE
    grid = document.querySelector('#tileContainer');
    let cells = Array.from(grid.children);
    blank = cells[Math.floor(Math.random() * cells.length)];
    blank.classList.add('blank');
    blank.style.visibility = 'hidden';
    cells.forEach(cell => grid.appendChild(cell));
    let moves = 0;
    while (moves < SHUFFLES) {
        cells = Array.from(grid.children);
        const randomCell = cells[Math.floor(Math.random() * cells.length)];
        moves = moves + moveCells(randomCell);
        effort++;
    }
    console.log('efforts: ', effort, ' successes: ', success);

    //CLICKETY
    grid.addEventListener('click', e => {
        const clicked = e.target.closest('.cell');
        if (clicked == null) return;
        if (moveCells(clicked) == 1) {
            checkTiles();
        }
    });
}

window.onload = (event) => {
    const style = document.createElement('style');
    style.textContent = `
        #tileContainer {
            grid-template-columns: repeat(${TILECOUNT}, auto);
        }
    `;
    document.head.appendChild(style);
    solvedAudio = new Audio('stuff/sound.ogg');
}

function moveCells(clicked) {
    if (clicked.classList.contains('blank')) return 0;
    const a = getCoords(clicked);
    const b = getCoords(blank);
    if ((Math.abs(b[0] - a[0]) == 1 && a[1] == b[1]) || (Math.abs(b[1] - a[1]) == 1 && a[0] == b[0])) {
        const a2 = clicked.nextSibling;
        const b2 = blank.nextSibling;
        if (a2 === blank) {
            grid.insertBefore(blank, clicked);
        } else if (b2 === clicked) {
            grid.insertBefore(clicked, blank);
        } else {
            grid.insertBefore(clicked, b2);
            grid.insertBefore(blank, a2);
        }
        success++;
        return 1;
    }
    return 0;
}

function getCoords(cell) {
    const cells = Array.from(grid.children);
    const index = cells.indexOf(cell);
    const val = [];
    val[0] = index % TILECOUNT;
    val[1] = Math.floor(index / TILECOUNT);
    return val;
}

function checkTiles() {
    const cells = Array.from(grid.children);
    for (let i = 0; i < cells.length; i++) {
        if (parseInt(cells[i].dataset.index) !== i) {
            return;
        }
    }
    puzzleSolved();
}

function puzzleSolved() {
    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.style.visibility = 'visible';
    });
    setTimeout(() => {
        document.querySelectorAll('canvas').forEach(canvas => {
            canvas.classList.add('hiding');
        });
    }, 1000);
    setTimeout(() => {
        grid.innerHTML = '';
        grid.appendChild(solvedImage);
        solvedAudio.volume = 0.1;
        solvedAudio.play();
        requestAnimationFrame(() => {
            solvedImage.classList.remove('hiding');
            solvedImage.classList.add('revealed');
        });
    }, 2000);
    setTimeout(() => {
        document.getElementById('container').insertAdjacentHTML('beforeend', SECONDSTAGE);
        ans = document.getElementById('answerBox');
        ans.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }, 4000);
}

function checkAnswer() {
    const input = document.getElementById('answerBox').value.trim().toLowerCase();
    const output = document.getElementById('hint');
    if (answerGroups.close.has(input)) {
        output.textContent = messages.close;
        flashText();
    } else if (answerGroups.taunt.has(input)) {
        output.textContent = messages.taunt;
        flashText();
    } else if (input === answerGroups.correct) {
        finalReveal();
    } else {
        output.textContent = messages.default;
        flashText();
    }
}

function flashText() {
    const tauntText = document.getElementById('hint');
    tauntText.classList.remove('hiding');
    tauntText.classList.add('revealed');
    setTimeout(() => {
        tauntText.classList.remove('revealed');
        tauntText.classList.add('hiding');
    }, 3000);
}

const REVEAL = `
    <div id="done" class="hiding" style="display: block;">
        <h1>Oikein! Hämeen linnassa kummittelee Pirskatti.</h1>
        <p>Jokaisessa itseään kunnioittavassa linnassa ja vanhassa kartanossa vaeltaa valkopukuinen nainen.</p>

        <p>Sellainen löytyy myös Hämeen linnasta.</p>

        <p>Kerrotaan että linnan valkopukuinen nainen on Birger jaarlin <b>Synnöve</b>-sisko, joka otti ja rakastui
            hämäläiseen heimopäällikköön, pakanaan kaiken lisäksi. Kostoksi veli sulki hänet yhteen linnan tyrmistä.</p>
        <p>Vuosia sitten Helsingin Sanomien Nyt-liite valitsi Hämeen linnan Suomen kummituslinnaksi numero yksi. Kerrotaan,
            että linnan aineettomaan väkeen kuuluvat myös pariskunta <b>Kotivalo</b> ja <b>Jeremias</b> sekä kummituskissa
            <b>Pirskatti</b>.</p>

        <p>Kuninkaansalin tiililattiassa näkyvät kissantassujen jäljet. Pirskatti tai joku sen lajitoveri on aikanaan
            päässyt tassuttelemaan kuivumassa olevien tiilien päällä.</p>
        <img src="stuff/tassut.png">

        <p>Ruotsin kuningas Kustaa II Aadolf (1594 -1632) vieraili Hämeen linnassa pariinkin otteeseen. Tarinan mukaan
            Pirskatti oli juuri hänen lemmikkikissansa.</p>
        <p>Kerrotaan, että kummituskissa naukuu mielellään juuri lasten satutuntien aikana. Joku lapsista on kertonut
            nähneensäkin punertavaturkkisen Pirskatin.</p>
        <button onclick="window.open('https://www.geocaching.com/map#?ll=61.00333,24.46555', '_blank')">
            Linkki Geocaching.comiin
        </button>
    </div>
`;

function finalReveal() {
    const con = document.getElementById('container');
    const cont = Array.from(con.children);
    cont.forEach(c => {
        c.classList.add('hiding');
    });
    setTimeout(() => {
        con.innerHTML = REVEAL;
    }, 1000);
    setTimeout(() => {
        const done = document.getElementById('done');
        done.classList.remove('hiding');
        done.classList.add('revealed');
    }, 2000);
}