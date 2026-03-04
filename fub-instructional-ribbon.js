/**
 * KRONOS FUB INSTRUCTIONAL VIDEO OVERLAY (ALPHA 1)
 *
 * HOW TO USE:
 * 1. Open your Chrome browser and log into Follow Up Boss.
 * 2. Press Option + Command + J (Mac) to open the DevTools Console.
 * 3. Copy and paste this entire script into the console and press Enter.
 * 4. Start your Screen Recording software.
 * 5. PRESS THE RIGHT ARROW KEY (->) to advance the text steps on the screen while you record!
 */

const FUB_STEPS = [
    "[ STEP 1 ] KRONOS OVERRIDE ACTIVE. Commencing Follow Up Boss Navigation Protocol. Press Right Arrow (->) to advance.",
    "[ STEP 2 ] Locate the 'Leads' module in the upper navigation bar and click it to access your active contacts.",
    "[ STEP 3 ] Identify the primary target lead and click on their name to open the detailed contact profile.",
    "[ STEP 4 ] In the central activity feed, locate the 'Email' icon to compose a new direct message.",
    "[ STEP 5 ] Select a predefined KRONOS drip campaign from the template dropdown to inject the automated sequence.",
    "[ STEP 6 ] Verify the transmission details and click 'Send' to dispatch the routing packet.",
    "[ COMPLETE ] Sequence resolved. KRONOS terminating overlay. (Refresh page to remove)"
];

let currentStep = 0;

function injectKronosRibbon() {
    // Prevent double injection
    if (document.getElementById("kronos-ribbon")) return;

    // Create the Ribbon Container (approx 10" x 2" visually on most monitors, centered at bottom)
    const ribbon = document.createElement("div");
    ribbon.id = "kronos-ribbon";

    // Styling the Ribbon
    Object.assign(ribbon.style, {
        position: "fixed",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "900px", // 10 inches wide simulated
        height: "120px", // 2 inches tall simulated
        backgroundColor: "#000000",
        border: "3px solid white",
        borderRadius: "12px",
        boxShadow: "0px 20px 50px rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "999999",
        padding: "20px",
        boxSizing: "border-box",
        pointerEvents: "none", // Let clicks pass through it if needed
        transition: "all 0.3s ease",
        fontFamily: "'Inter', 'Roboto', sans-serif"
    });

    // Create the Text Element inside the Ribbon
    const textNode = document.createElement("p");
    textNode.id = "kronos-ribbon-text";

    Object.assign(textNode.style, {
        color: "#ffffff",
        fontSize: "24px",
        fontWeight: "900",
        textAlign: "center",
        margin: "0",
        lineHeight: "1.4",
        textShadow: "0px 2px 10px rgba(255, 255, 255, 0.3)"
    });

    textNode.innerText = FUB_STEPS[currentStep];

    ribbon.appendChild(textNode);
    document.body.appendChild(ribbon);

    // Add Keyboard Listener to advance/retreat the steps
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
            if (currentStep < FUB_STEPS.length - 1) {
                currentStep++;
                document.getElementById("kronos-ribbon-text").innerText = FUB_STEPS[currentStep];

                // Add a tiny flash animation to indicate movement
                ribbon.style.backgroundColor = "#222";
                setTimeout(() => ribbon.style.backgroundColor = "#000", 150);
            }
        } else if (e.key === "ArrowLeft") {
            if (currentStep > 0) {
                currentStep--;
                document.getElementById("kronos-ribbon-text").innerText = FUB_STEPS[currentStep];
            }
        }
    });

    console.log("KRONOS OVERLAY ACTIVE: Press Left/Right arrow keys to navigate the FUB Script.");
}

injectKronosRibbon();
