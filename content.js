console.log("AI Email Writer Extension...");

function createAIButton() {
   const button = document.createElement('div');
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
   button.style.marginRight = '8px';
   button.style.borderRadius = '8px';
   button.innerHTML = 'AI Reply';
   button.setAttribute('role','button');
   button.setAttribute('data-tooltip','Generate AI Reply');
   return button;
}

function createAIDropdownOptions() {
  const dropdown = document.createElement('select');
  dropdown.className = 'aoO v7 T-I-atl L3';
  dropdown.style.marginRight = '8px';
  dropdown.style.paddingRight = '8px';
  dropdown.style.borderRadius = '8px';
  dropdown.style.padding = '5px';
  dropdown.style.fontSize = '13px';
  dropdown.style.color = '#202124';
  dropdown.style.backgroundColor = '#f1f3f4';
  dropdown.style.border = '1px solid #dadce0';

  const tones = ['Professional', 'Casual', 'Friendly', 'Formal', 'Angry', 'Sad', 'Happy', 'Excited'];
  tones.forEach(tone => {
    const option = document.createElement('option');
    option.value = tone.toLowerCase();
    option.innerHTML = tone;
    dropdown.appendChild(option);
  });

  return dropdown;
}

function getSelectedToneOption() {
  const dropdown = document.querySelector('.ai-tone-dropdown');
  if (dropdown) {
    return dropdown.value;
  }
  return 'professional';
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
      }
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
      }
    return null;
}

function injectButtonAndOptions() {
    const existingButton = document.querySelector('.ai-reply-button');
    const existingDropdown = document.querySelector('.ai-tone-dropdown');
    if (existingButton) existingButton.remove();
    if (existingDropdown) existingDropdown.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    const button = createAIButton();
    button.classList.add('ai-reply-button');
    
    const dropdown = createAIDropdownOptions();
    dropdown.classList.add('ai-tone-dropdown');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const tone =  getSelectedToneOption();

            const response = await fetch('https://ai-email-writer-cvpu.onrender.com/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: tone
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled =  false;
        }
    });

    toolbar.insertBefore(dropdown, toolbar.firstChild);
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            setTimeout(injectButtonAndOptions, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
