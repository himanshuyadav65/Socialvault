// ============================================
// FICTIONAL CINEMATIC PROFILE DATABASE
// ============================================

const demoUsers = {

    "demo_user": {
        name: "Demo User",
        posts: 247,
        followers: "12.8K",
        following: 684
    },

    "movie_star": {
        name: "Movie Star",
        posts: 532,
        followers: "245K",
        following: 312
    },

    "cyber_demo": {
        name: "Cyber Demo",
        posts: 186,
        followers: "8.4K",
        following: 421
    },

    "test_user": {
        name: "Test User",
        posts: 98,
        followers: "5.2K",
        following: 290
    }
};


// ============================================
// TERMINAL LOGS
// ============================================

const logs = [

    "Initializing simulation environment...",

    "Loading fictional analysis engine...",

    "Checking username format...",

    "Resolving fictional profile database...",

    "Searching sample profile records...",

    "Processing profile metadata...",

    "Generating cinematic analysis...",

    "Finalizing simulation report..."

];


// ============================================
// ADD TERMINAL LOG
// ============================================

function addLog(text) {

    const terminal =
        document.getElementById("terminalOutput");

    const line =
        document.createElement("div");

    line.className = "log";

    line.innerHTML =
        `<span>[${new Date().toLocaleTimeString()}]</span> ${text}`;

    terminal.appendChild(line);

    terminal.scrollTop =
        terminal.scrollHeight;
}


// ============================================
// START SIMULATION
// ============================================

function startSimulation() {

    const input =
        document.getElementById("username");

    let username =
        input.value.trim()
            .replace(/^@/, "")
            .toLowerCase();


    // Empty username
    if (!username) {

        input.focus();

        alert("Please enter a fictional username.");

        return;
    }


    // Disable input
    input.disabled = true;

    document.getElementById("startBtn")
        .disabled = true;


    // Show analysis section
    document.getElementById("analysisArea")
        .classList.remove("hidden");


    // Clear previous results
    document.getElementById("terminalOutput")
        .innerHTML = "";

    document.getElementById("profileArea")
        .innerHTML = "";


    // Reset progress
    let progress = 0;

    let logIndex = 0;


    const progressBar =
        document.getElementById("progressBar");

    const percent =
        document.getElementById("percent");

    const status =
        document.getElementById("status");


    // Reset UI
    progressBar.style.width = "0%";

    percent.textContent = "0%";

    status.textContent =
        "Initializing simulation...";


    // Simulation timer
    const interval =
        setInterval(() => {

            progress +=
                Math.floor(Math.random() * 5) + 2;


            if (progress > 100) {

                progress = 100;

            }


            // Update progress
            progressBar.style.width =
                progress + "%";

            percent.textContent =
                progress + "%";


            // Add terminal logs
            if (
                logIndex < logs.length &&
                progress >=
                ((logIndex + 1) * 12)
            ) {

                addLog(logs[logIndex]);

                status.textContent =
                    logs[logIndex];

                logIndex++;
            }


            // Completed
            if (progress >= 100) {

                clearInterval(interval);


                // Make sure all logs appear
                while (logIndex < logs.length) {

                    addLog(logs[logIndex]);

                    logIndex++;
                }


                status.textContent =
                    "Checking fictional profile...";


                setTimeout(() => {

                    // Check ONLY local fictional database
                    if (demoUsers[username]) {

                        showResults(
                            username,
                            demoUsers[username]
                        );

                    } else {

                        showInvalidUser(username);

                    }

                }, 900);

            }

        }, 180);
}


// ============================================
// PROFILE FOUND
// ============================================

function showResults(username, user) {

    const initial =
        user.name
            .charAt(0)
            .toUpperCase();


    document.getElementById("status")
        .textContent =
        "Profile found";


    document.getElementById("profileArea")
        .innerHTML = `

        <div class="profile">

            <div class="avatar">
                ${initial}
            </div>

            <div>

                <h2>
                    @${username}
                </h2>

                <p style="color:#777">
                    ${user.name}
                </p>


                <div class="stats">

                    <div class="stat">

                        <b>
                            ${user.posts}
                        </b>

                        <small>
                            Posts
                        </small>

                    </div>


                    <div class="stat">

                        <b>
                            ${user.followers}
                        </b>

                        <small>
                            Followers
                        </small>

                    </div>


                    <div class="stat">

                        <b>
                            ${user.following}
                        </b>

                        <small>
                            Following
                        </small>

                    </div>

                </div>

            </div>

        </div>


        <div class="result">

            <div class="result-box">

                <strong>
                    ${user.posts}
                </strong>

                <span>
                    Sample Posts
                </span>

            </div>


            <div class="result-box">

                <strong>
                    86
                </strong>

                <span>
                    Media Records
                </span>

            </div>


            <div class="result-box">

                <strong>
                    100%
                </strong>

                <span>
                    Simulation
                </span>

            </div>

        </div>


        <div class="complete">

            ✓ PROFILE FOUND — CINEMATIC SIMULATION

        </div>
    `;
}


// ============================================
// PROFILE NOT FOUND
// ============================================

function showInvalidUser(username) {

    document.getElementById("status")
        .textContent =
        "Profile not found";


    document.getElementById("profileArea")
        .innerHTML = `

        <div class="not-found">

            <div class="not-found-icon">
                ⚠️
            </div>

            <h2>
                User Does Not Exist
            </h2>

            <p>
                @${username} was not found in the
                fictional simulation database.
            </p>

            <div class="simulation-result">
                SIMULATION RESULT
            </div>

        </div>
    `;


    // Allow another search
    document.getElementById("startBtn")
        .disabled = false;

    document.getElementById("username")
        .disabled = false;
}


// ============================================
// BUTTON EVENT
// ============================================

document
    .getElementById("startBtn")
    .addEventListener(
        "click",
        startSimulation
    );


// Press Enter to start
document
    .getElementById("username")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                startSimulation();

            }

        }
    );