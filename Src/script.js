// Global variables for Netlify Identity
let currentUser = null;
let currentWordLimit = 300;

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements Selection ---
    const themeToggle = document.getElementById('themeToggle');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearBtn = document.getElementById('clearBtn');
    const humanizeBtn = document.getElementById('humanizeBtn');
    const copyBtn = document.getElementById('copyBtn');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    const outputWordCount = document.getElementById('outputWordCount');
    const btnText = document.getElementById('btnText');
    const processingText = document.getElementById('processingText');

    // =========================================
    // THEME LOGIC - DARK/LIGHT TOGGLE
    // =========================================
    
    function updateThemeIcon() {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (document.body.classList.contains('light-theme')) {
                icon.className = 'fas fa-moon'; 
            } else {
                icon.className = 'fas fa-sun'; 
            }
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        }
        updateThemeIcon();
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            document.body.classList.toggle('dark-theme');
            const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            updateThemeIcon();
        });
    }

    // =========================================
    // NETLIFY IDENTITY INTEGRATION
    // =========================================
    
    function initNetlifyIdentity() {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.on('init', (user) => {
                currentUser = user;
                updateUserLimits();
            });
            
            window.netlifyIdentity.on('login', (user) => {
                currentUser = user;
                updateUserLimits();
                window.netlifyIdentity.close();
                showNotification('✅ Login successful! Limit increased.', 'success');
            });
            
            window.netlifyIdentity.on('logout', () => {
                currentUser = null;
                updateUserLimits();
                showNotification('👋 Logged out successfully.', 'info');
            });
        } else {
            setTimeout(initNetlifyIdentity, 500);
        }
    }

    function updateUserLimits() {
        if (!wordCount || !inputText) return;
        
        if (currentUser) {
            const roles = currentUser.app_metadata?.roles || [];
            if (roles.includes('premium')) {
                currentWordLimit = 2000;
                wordCount.innerHTML = `Words: 0/2000 <span style="color: #a855f7; font-weight: 600;">(Premium)</span>`;
            } else {
                currentWordLimit = 500;
                wordCount.innerHTML = `Words: 0/500 <span style="color: #4CAF50; font-weight: 600;">(Logged In)</span>`;
            }
        } else {
            currentWordLimit = 300;
            wordCount.innerHTML = `Words: 0/300`;
        }
        updateCounts();
    }

    // =========================================
    // NEW: FAQ ACCORDION LOGIC (SEO & UX Boost)
    // =========================================
    
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Doosre saare open FAQs ko band karne ke liye
            faqItems.forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // =========================================
    // WORD COUNT FUNCTIONS
    // =========================================
    
    function updateCounts() {
        if (!inputText || !wordCount) return;
        
        const text = inputText.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        // Dynamic color change based on limit
        if (words > currentWordLimit) {
            wordCount.style.color = '#f44336'; // Red for error
            humanizeBtn.disabled = true;
        } else {
            wordCount.style.color = ''; // Default color
            humanizeBtn.disabled = words === 0;
        }

        // Display update
        const statusLabel = currentUser ? (currentUser.app_metadata?.roles?.includes('premium') ? '(Premium)' : '(Logged In)') : '';
        wordCount.innerHTML = `Words: ${words}/${currentWordLimit} <span style="font-weight: 600;">${statusLabel}</span>`;
        if (charCount) charCount.textContent = `Chars: ${chars}`;
    }

    // =========================================
    // NOTIFICATION SYSTEM
    // =========================================

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = message;
        
        notification.style.cssText = `
            position: fixed; top: 80px; right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white; padding: 12px 24px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000;
            font-weight: 500; animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // =========================================
    // BUTTON ACTIONS
    // =========================================

    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                inputText.value = text;
                updateCounts();
                showNotification('📋 Pasted!', 'success');
            } catch (err) {
                inputText.focus();
                showNotification('Press Ctrl+V to paste', 'info');
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            inputText.value = '';
            if (outputText) outputText.value = '';
            updateCounts();
            showNotification('🧹 Cleared!', 'info');
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!outputText.value) return;
            navigator.clipboard.writeText(outputText.value);
            showNotification('📋 Copied!', 'success');
        });
    }

    // =========================================
    // API EXECUTION
    // =========================================

    if (humanizeBtn) {
        humanizeBtn.addEventListener('click', async () => {
            const text = inputText.value.trim();
            if (!text) return;

            humanizeBtn.disabled = true;
            btnText.style.display = 'none';
            processingText.style.display = 'inline';
            outputText.value = "🤖 Humanizing your text... Please wait.";

            try {
                const response = await fetch("/.netlify/functions/humanize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "API Error");

                outputText.value = data.output;
                if (outputWordCount) {
                    const outWords = data.output.trim().split(/\s+/).length;
                    outputWordCount.textContent = `Words: ${outWords}`;
                }
                showNotification('✅ Done!', 'success');
            } catch (error) {
                outputText.value = `Error: ${error.message}`;
                showNotification('❌ Error occurred', 'error');
            } finally {
                humanizeBtn.disabled = false;
                btnText.style.display = 'inline';
                processingText.style.display = 'none';
            }
        });
    }

    // Init
    if (inputText) inputText.addEventListener('input', updateCounts);
    initTheme();
    initNetlifyIdentity();
});
// View All FAQs Logic
const viewAllBtn = document.getElementById('viewAllFaqs');
const moreFaqs = document.getElementById('more-faqs');

if (viewAllBtn && moreFaqs) {
    viewAllBtn.addEventListener('click', () => {
        if (moreFaqs.style.display === "none") {
            moreFaqs.style.display = "block";
            viewAllBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
            moreFaqs.style.animation = "fadeIn 0.5s ease";
        } else {
            moreFaqs.style.display = "none";
            viewAllBtn.innerHTML = 'View All Questions <i class="fas fa-chevron-down"></i>';
        }
    });
}

// Har individual question ko clickable banane ke liye (Accordion style)
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
    });
});
