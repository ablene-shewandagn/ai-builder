document.addEventListener("DOMContentLoaded", () => {
    // Canvas Visualization Setup
    const canvas = document.getElementById("matrixCanvas");
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Controls DOM elements
    const freqSlider = document.getElementById("freq-slider");
    const freqVal = document.getElementById("freq-val");
    const resonanceSlider = document.getElementById("resonance-slider");
    const resonanceVal = document.getElementById("resonance-val");
    const densitySlider = document.getElementById("density-slider");
    const densityVal = document.getElementById("density-val");
    const colorTheme = document.getElementById("color-theme");
    const generateBtn = document.getElementById("generate-btn");
    const resetBtn = document.getElementById("reset-btn");
    
    // Stats & ID display
    const matrixIdDisp = document.getElementById("matrix-id");
    const ayintVectorDisp = document.getElementById("ayint-vector");
    const canvasStats = document.getElementById("canvas-stats");

    // Dynamic Variables based on controllers
    let speedMult = parseFloat(freqSlider.value) / 40;
    let maxDistance = parseFloat(resonanceSlider.value);
    let particleCount = parseInt(densitySlider.value);
    
    let particles = [];
    let primaryColor = "#00f0ff";
    let secondaryColor = "#ff007f";

    // Set color modes
    const applyThemeColors = (theme) => {
        const root = document.documentElement;
        if (theme === "cyan-purple") {
            primaryColor = "#00f0ff";
            secondaryColor = "#ff007f";
            root.style.setProperty("--primary-glow", "var(--color-accent-cyan)");
            root.style.setProperty("--secondary-glow", "var(--color-accent-magenta)");
        } else if (theme === "emerald-gold") {
            primaryColor = "#10b981";
            secondaryColor = "#f59e0b";
            root.style.setProperty("--primary-glow", "var(--color-accent-emerald)");
            root.style.setProperty("--secondary-glow", "var(--color-accent-gold)");
        } else if (theme === "crimson-void") {
            primaryColor = "#ef4444";
            secondaryColor = "#4b5563";
            root.style.setProperty("--primary-glow", "var(--color-accent-crimson)");
            root.style.setProperty("--secondary-glow", "var(--text-muted)");
        } else if (theme === "ayint-classic") {
            primaryColor = "#f59e0b";
            secondaryColor = "#ff007f";
            root.style.setProperty("--primary-glow", "var(--color-accent-gold)");
            root.style.setProperty("--secondary-glow", "var(--color-accent-magenta)");
        }
    };

    // Resize observer
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        initParticles();
    }

    window.addEventListener("resize", resizeCanvas);
    setTimeout(resizeCanvas, 100);

    // Particle Object
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = Math.random() * 2.5 + 1;
            this.alpha = Math.random() * 0.5 + 0.3;
        }

        update() {
            this.x += this.vx * speedMult;
            this.y += this.vy * speedMult;

            // Boundaries bounce
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = primaryColor;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Animation loop
    let lastTime = performance.now();
    let frameCount = 0;
    
    function animate() {
        // Calculate dynamic FPS
        const now = performance.now();
        frameCount++;
        if (now - lastTime >= 1000) {
            canvasStats.textContent = `FPS: ${frameCount}`;
            frameCount = 0;
            lastTime = now;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw node connections (Matrix geometry)
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    const progress = (maxDistance - dist) / maxDistance;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    // Complex glow gradient between connected nodes
                    const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                    gradient.addColorStop(0, primaryColor);
                    gradient.addColorStop(1, secondaryColor);
                    
                    ctx.strokeStyle = gradient;
                    ctx.globalAlpha = progress * 0.45;
                    ctx.lineWidth = progress * 1.5;
                    ctx.stroke();
                }
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Interactive event listeners
    freqSlider.addEventListener("input", (e) => {
        freqVal.textContent = e.target.value;
        speedMult = parseFloat(e.target.value) / 40;
    });

    resonanceSlider.addEventListener("input", (e) => {
        resonanceVal.textContent = e.target.value;
        maxDistance = parseFloat(e.target.value);
    });

    densitySlider.addEventListener("input", (e) => {
        densityVal.textContent = e.target.value;
        particleCount = parseInt(e.target.value);
        initParticles();
    });

    colorTheme.addEventListener("change", (e) => {
        applyThemeColors(e.target.value);
    });

    // Generate dynamic metadata identifier
    function randomizeMeta() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let randomId = "SLZ-";
        for (let i = 0; i < 4; i++) {
            randomId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        randomId += "-" + Math.floor(Math.random() * 90 + 10);
        matrixIdDisp.textContent = randomId;

        const val1 = (Math.random() * 2 - 1).toFixed(2);
        const val2 = (Math.random() * 2 - 1).toFixed(2);
        const val3 = (Math.random() * 10).toFixed(2);
        ayintVectorDisp.textContent = `[${val1}, ${val2}, ${val3}]`;
    }

    // Trigger explicit manual generation cycle
    generateBtn.addEventListener("click", () => {
        randomizeMeta();
        // Give visual burst effect inside visualizer
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Randomize current node physics speeds slightly on execution
        particles.forEach(p => {
            p.vx *= 2.5;
            p.vy *= 2.5;
            setTimeout(() => {
                p.vx /= 2.5;
                p.vy /= 2.5;
            }, 300);
        });

        writeToTerminal("Initializing Adrglgn generator matrix: " + matrixIdDisp.textContent + " at frequency " + freqSlider.value + "Hz.");
    });

    resetBtn.addEventListener("click", () => {
        freqSlider.value = 42;
        freqVal.textContent = "42";
        speedMult = 42 / 40;

        resonanceSlider.value = 120;
        resonanceVal.textContent = "120";
        maxDistance = 120;

        densitySlider.value = 24;
        densityVal.textContent = "24";
        particleCount = 24;

        colorTheme.value = "cyan-purple";
        applyThemeColors("cyan-purple");

        initParticles();
        randomizeMeta();
        writeToTerminal("System variables synchronized back to default baseline status.");
    });

    // INITIALIZATION RUNTIME
    applyThemeColors("cyan-purple");
    initParticles();
    animate();


    /* CODEX TABS SYSTEM */
    const tabButtons = document.querySelectorAll(".codex-tab-btn");
    const tabContents = document.querySelectorAll(".codex-tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");

            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
        });
    });


    /* CYBER TERMINAL SHELL FUNCTIONALITY */
    const terminalBody = document.getElementById("terminal-body");
    const terminalInput = document.getElementById("terminal-input");

    function writeToTerminal(text, type = "normal") {
        const line = document.createElement("div");
        line.classList.add("terminal-line");
        
        if (type === "error") {
            line.innerHTML = `<span class="text-accent">[X] Error:</span> ${text}`;
        } else if (type === "success") {
            line.innerHTML = `<span class="text-highlight">[O] Matrix:</span> ${text}`;
        } else if (type === "system") {
            line.innerHTML = `<span class="text-muted">[#]</span> ${text}`;
        } else {
            line.innerHTML = `<span class="text-muted">&gt;</span> ${text}`;
        }

        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    terminalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const val = terminalInput.value.trim().toLowerCase();
            terminalInput.value = "";

            if (!val) return;

            // Output user prompt command
            const cmdEcho = document.createElement("div");
            cmdEcho.classList.add("terminal-line");
            cmdEcho.innerHTML = `<span class="text-accent">&gt;</span> <span style="color: #fff">${val}</span>`;
            terminalBody.appendChild(cmdEcho);

            // Execute CLI state parser
            executeCommand(val);
        }
    });

    function executeCommand(command) {
        const parts = command.split(" ");
        const baseCmd = parts[0];

        switch(baseCmd) {
            case "help":
                writeToTerminal("Available commands:");
                writeToTerminal("  help              - View CLI control operations");
                writeToTerminal("  generate          - Instantly recalculate Slezi engine variables");
                writeToTerminal("  slezi             - Read spatial quantum database core");
                writeToTerminal("  ayint             - Run live hardware visualizer health diagnostic");
                writeToTerminal("  clear             - Clear display terminal buffer memory logs");
                writeToTerminal("  config <f> <r>    - Custom configuration. Example: config 80 180");
                break;

            case "generate":
                generateBtn.click();
                writeToTerminal("Generator sequence triggered manually via prompt command.", "success");
                break;

            case "slezi":
                writeToTerminal("Retrieving archives: Slezi particles contain localized spatial dark waves first noticed in Yahunun cluster.", "success");
                break;

            case "ayint":
                writeToTerminal(`Performing diagnostics on matrix screen vector mapping:`, "system");
                writeToTerminal(`- Active nodes monitored: ${particles.length}`, "system");
                writeToTerminal(`- Frame Rate Index: ${canvasStats.textContent}`, "system");
                writeToTerminal(`- Network State: Operational. Waveform coherent.`, "success");
                break;

            case "clear":
                terminalBody.innerHTML = `<div class="terminal-line text-muted">Console system cleared. Buffer purged successfully.</div>`;
                break;

            case "config":
                if (parts.length >= 3) {
                    const f = parseInt(parts[1]);
                    const r = parseInt(parts[2]);
                    if (!isNaN(f) && f >= 1 && f <= 100 && !isNaN(r) && r >= 10 && r <= 200) {
                        freqSlider.value = f;
                        freqVal.textContent = f;
                        speedMult = f / 40;

                        resonanceSlider.value = r;
                        resonanceVal.textContent = r;
                        maxDistance = r;
                        
                        writeToTerminal(`Configuration updated. Freq: ${f}Hz, Resonance: ${r}px.`, "success");
                    } else {
                        writeToTerminal("Value range out of limits: Freq [1-100], Resonance [10-200].", "error");
                    }
                } else {
                    writeToTerminal("Syntax invalid. Usage: config [frequency] [resonance]", "error");
                }
                break;

            default:
                writeToTerminal(`Command '${baseCmd}' not detected. Execute 'help' to review standard commands directory.`, "error");
                break;
        }

        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
});
---