const API_KEY = 'AIzaSyCvGFjPz8bI8tv3CDYndMTEMK9vuQfIYF4'; 
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mainContent = document.getElementById('main-content');
const mathButton = document.getElementById('math-button');
const clearButton = document.getElementById('clear-chat');
const exportButton = document.getElementById('export-chat');
const newChatButton = document.getElementById('new-chat');
const historyButton = document.getElementById('history');
const favoritesButton = document.getElementById('favorites');
const fileUploadButton = document.getElementById('file-upload-button');

// Store chat history and favorite messages
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
let favoriteMessages = JSON.parse(localStorage.getItem('favoriteMessages')) || [];
let favoritedMessagesInSession = new Set(); // Track favorited messages in the current session

// Add file input to the chat input container
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.id = 'file-input';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// Handle file upload
fileUploadButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            addMessage(`Uploaded file: ${file.name}\n${fileContent}`, true);
        };
        reader.readAsText(file); // Read as text (for .txt files)
    }
});

// New Chat Functionality
newChatButton.addEventListener('click', () => {
    chatMessages.innerHTML = ''; // Clear chat messages
    favoritedMessagesInSession.clear(); // Reset favorited messages for the new chat
    addMessage("New chat started. How can I assist you today?", false); // Add a welcome message
});

// History Button Functionality
historyButton.addEventListener('click', () => {
    displayChatHistory();
});

// Favorites Button Functionality
favoritesButton.addEventListener('click', () => {
    displayFavoriteMessages();
});

// Save chat history
function saveChatHistory() {
    const messages = Array.from(chatMessages.querySelectorAll('.message-content')).map(message => {
        const isUser = message.parentElement.classList.contains('user-message');
        const sender = isUser ? 'You' : 'EishiAI';
        const content = message.innerHTML.replace(/<[^>]+>/g, ''); // Remove HTML tags
        const time = message.querySelector('.message-time').textContent;
        return { sender, content, time };
    });
    chatHistory.push({ timestamp: new Date().toISOString(), messages });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Load chat history
function loadChatHistory() {
    return JSON.parse(localStorage.getItem('chatHistory')) || [];
}

// Display chat history
function displayChatHistory() {
    const history = loadChatHistory();
    chatMessages.innerHTML = ''; // Clear current chat
    history.forEach(chat => {
        chat.messages.forEach(message => {
            addMessage(`${message.sender}: ${message.content}`, message.sender === 'You');
        });
    });
}

// Display favorite messages
function displayFavoriteMessages() {
    const favorites = JSON.parse(localStorage.getItem('favoriteMessages')) || [];
    chatMessages.innerHTML = ''; // Clear current chat
    favorites.forEach(favorite => {
        addMessage(`⭐ ${favorite.content}`, false);
    });
}

// Add a favorite button to each message
function addFavoriteButton(messageElement) {
    const favoriteButton = document.createElement('button');
    favoriteButton.innerHTML = '<i class="fas fa-star"></i>';
    favoriteButton.classList.add('favorite-button');
    favoriteButton.title = 'Add to Favorites';
    favoriteButton.addEventListener('click', () => {
        const messageContent = messageElement.querySelector('.message-content').innerText;
        if (!favoritedMessagesInSession.has(messageContent)) {
            favoriteMessages.push({ content: messageContent, timestamp: new Date().toISOString() });
            localStorage.setItem('favoriteMessages', JSON.stringify(favoriteMessages));
            favoriteButton.disabled = true; // Disable after adding to favorites
            favoritedMessagesInSession.add(messageContent); // Track favorited message
        }
    });
    messageElement.appendChild(favoriteButton);
}

// Add a remove favorite button to favorited messages
function addRemoveFavoriteButton(messageElement, messageContent) {
    const removeFavoriteButton = document.createElement('button');
    removeFavoriteButton.innerHTML = '<i class="fas fa-trash"></i>';
    removeFavoriteButton.classList.add('remove-favorite-button');
    removeFavoriteButton.title = 'Remove from Favorites';
    removeFavoriteButton.addEventListener('click', () => {
        favoriteMessages = favoriteMessages.filter(favorite => favorite.content !== messageContent);
        localStorage.setItem('favoriteMessages', JSON.stringify(favoriteMessages));
        messageElement.remove(); // Remove the message from the favorites list
    });
    messageElement.appendChild(removeFavoriteButton);
}

// Clear Chat Functionality
clearButton.addEventListener('click', () => {
    chatMessages.innerHTML = ''; // Clear all messages from the chat
    addMessage("Chat history has been cleared.", false); // Add a confirmation message
});

// Export Chat Functionality
exportButton.addEventListener('click', () => {
    const messages = Array.from(chatMessages.querySelectorAll('.message-content')).map(message => {
        const isUser = message.parentElement.classList.contains('user-message');
        const sender = isUser ? 'You' : 'EishiAI';
        const content = message.innerHTML.replace(/<[^>]+>/g, ''); // Remove HTML tags
        const time = message.querySelector('.message-time').textContent;
        return `${time} - ${sender}: ${content}`;
    });

    const chatHistory = messages.join('\n');
    const blob = new Blob([chatHistory], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat_history.txt'; // File name
    link.click();
    URL.revokeObjectURL(link.href);
});

// Sidebar Toggle
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-collapsed');
    mainContent.style.marginLeft = sidebar.classList.contains('sidebar-collapsed') ? '60px' : '250px';
});

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    
    // Reset to default height if empty
    if (this.value === '') {
        this.style.height = '';
    }
});

// Math button functionality
mathButton.addEventListener('click', () => {
    insertMathSymbol();
});

function insertMathSymbol() {
    const mathFormula = prompt("Enter your math formula (using LaTeX syntax):", "E = mc^2");
    if (mathFormula) {
        const cursorPos = userInput.selectionStart;
        const textBefore = userInput.value.substring(0, cursorPos);
        const textAfter = userInput.value.substring(cursorPos);
        userInput.value = textBefore + '$$' + mathFormula + '$$' + textAfter;
        userInput.focus();
    }
}

async function generateResponse(prompt) {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function processMathFormulas(text) {
    // Find all math expressions enclosed in $$ and process them
    const processedText = text.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
        return `<span class="math-formula">${formula}</span>`;
    });
    
    return processedText;
}

function processCodeBlocks(text) {
    // Replace code blocks with properly formatted HTML
    const processedText = text.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (match, language, code) => {
        return `<pre class="code-block"><code>${escapeHTML(code)}</code></pre>`;
    });
    
    // Replace inline code with formatted spans
    return processedText.replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${escapeHTML(code)}</code>`;
    });
}

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function processTextForDisplay(text) {
    // Process markdown-style formatting
    let processedText = text
        // Process paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Process bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Process italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Process links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Process code blocks
    processedText = processCodeBlocks(processedText);
    
    // Process math formulas
    processedText = processMathFormulas(processedText);
    
    // Wrap in paragraph tags if not already
    if (!processedText.startsWith('<p>')) {
        processedText = '<p>' + processedText;
    }
    if (!processedText.endsWith('</p>')) {
        processedText += '</p>';
    }
    
    return processedText;
}

function cleanMarkdown(text) {
    return text
        .replace(/#{1,6}\s?/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    
    const profileContainer = document.createElement('div');
    profileContainer.classList.add('profile-container');
    
    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    profileImage.src = isUser ? 'user.jpg' : 'bot.jpg';
    profileImage.alt = isUser ? 'User' : 'Bot';
    profileImage.onerror = function() {
        // Fallback if image doesn't load
        this.src = isUser ? 
            'https://ui-avatars.com/api/?name=User&background=4a90e2&color=fff' : 
            'https://ui-avatars.com/api/?name=EishiAI&background=2a2a2a&color=fff';
    };
    
    const statusIndicator = document.createElement('div');
    statusIndicator.classList.add('profile-status');
    
    profileContainer.appendChild(profileImage);
    profileContainer.appendChild(statusIndicator);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Process text for formatting, code, and math
    const formattedMessage = processTextForDisplay(message);
    messageContent.innerHTML = formattedMessage;
    
    // Add timestamp
    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.textContent = getCurrentTime();
    messageContent.appendChild(timeElement);
    
    if (isUser) {
        messageElement.appendChild(messageContent);
        messageElement.appendChild(profileContainer);
    } else {
        messageElement.appendChild(profileContainer);
        messageElement.appendChild(messageContent);
    }
    
    chatMessages.appendChild(messageElement);
    
    // Add favorite button to bot messages
    if (!isUser) {
        addFavoriteButton(messageElement);
    }
    
    // Render math formulas with KaTeX if available
    if (window.renderMathInElement) {
        renderMathInElement(messageContent, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }
    
    // Scroll to latest message with smooth animation
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
    
    return messageElement;
}

function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'bot-message', 'typing-message');
    
    const profileContainer = document.createElement('div');
    profileContainer.classList.add('profile-container');
    
    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    profileImage.src = 'bot.jpg';
    profileImage.alt = 'Bot';
    profileImage.onerror = function() {
        this.src = 'https://ui-avatars.com/api/?name=EishiAI&background=2a2a2a&color=fff';
    };
    
    const statusIndicator = document.createElement('div');
    statusIndicator.classList.add('profile-status');
    
    profileContainer.appendChild(profileImage);
    profileContainer.appendChild(statusIndicator);
    
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingIndicator.appendChild(dot);
    }
    
    typingElement.appendChild(profileContainer);
    typingElement.appendChild(typingIndicator);
    
    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingElement;
}

function removeTypingIndicator(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

async function handleUserInput() {
    const userMessage = userInput.value.trim();
    
    if (userMessage) {
        addMessage(userMessage, true);
        
        userInput.value = '';
        userInput.style.height = '';  // Reset height
        sendButton.disabled = true;
        userInput.disabled = true;
        
        const typingIndicator = showTypingIndicator();
        
        try {
            const botMessage = await generateResponse(userMessage);
            removeTypingIndicator(typingIndicator);
            addMessage(cleanMarkdown(botMessage), false);
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingIndicator);
            addMessage('Sorry, I encountered an error. Please try again.', false);
        } finally {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();
        }
    }
}

// Event listeners
sendButton.addEventListener('click', handleUserInput);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});

// Add welcome message when page loads
document.addEventListener('DOMContentLoaded', () => {
    addMessage("👋 Hello! I'm EishiAI, your intelligent assistant. I can help with questions, provide information, and assist with various tasks. What can I help you with today?", false);
});

// Handle mobile sidebar toggle
if (window.innerWidth <= 768) {
    sidebar.classList.add('sidebar-collapsed');
    mainContent.style.marginLeft = '0';
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}