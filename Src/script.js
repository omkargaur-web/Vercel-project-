    if (humanizeBtn) {
        humanizeBtn.addEventListener('click', async () => {
            const text = inputText.value.trim(); // User ka input text
            if (!text) {
                showNotification('Please enter some text', 'info');
                return;
            }

            // UI Update: Button ko loading state mein laayein
            humanizeBtn.disabled = true;
            btnText.style.display = 'none';
            processingText.style.display = 'inline';
            outputText.value = "🤖 Humanizing your text... Please wait.";

            try {
                // Vercel API Call (Sahi Path aur Data)
                const response = await fetch('/api/humanize', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: text }) // Sirf 'text' bhej rahe hain
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.detail || data.error || "API Error");
                }

                // Output display karein
                outputText.value = data.output;
                
                if (outputWordCount) {
                    const outWords = data.output.trim() ? data.output.trim().split(/\s+/).length : 0;
                    outputWordCount.textContent = `Words: ${outWords}`;
                }
                showNotification('✅ Done!', 'success');

            } catch (error) {
                console.error("Frontend Error:", error);
                outputText.value = `Error: ${error.message}`;
                showNotification('❌ Error occurred', 'error');
            } finally {
                // UI Reset: Button ko wapas normal karein
                humanizeBtn.disabled = false;
                btnText.style.display = 'inline';
                processingText.style.display = 'none';
            }
        });
    }
