// sendMessage: triggered when the user sends a message via button or pressing Enter
function sendMessage() {
  const input = document.getElementById("userInput"); // Grabs input field
  const chatBox = document.getElementById("chatBox"); // Grabs chat display box

  // Prevent sending empty messages or whitespace-only inputs
  if (input.value.trim() === "") return;

  const userText = input.value; // Stores user's message text

  // Display user message in the chat box
  addMessage(userText, "user");
  saveToHistory("user", userText); // Save user message to localStorage

  // Clear the input field so it's ready for new input
  input.value = "";

  // Create a thinking placeholder while AI generates a response
  const typingPlaceholder = document.createElement("div");
  typingPlaceholder.className = "msg bot";
  typingPlaceholder.textContent = "...";
  chatBox.appendChild(typingPlaceholder);
  scrollChatToBottom();

  // Simulate AI thinking and responding with delay (600ms)
  setTimeout(() => {
    const reply = getAIResponse(userText); // Generate response based on input
    chatBox.removeChild(typingPlaceholder); // Remove thinking dots
    typeMessage(reply, "bot"); // Use typing effect to show response
    saveToHistory("bot", reply); // Save AI response to localStorage
  }, 600);
}

// addMessage: appends a message from either the user or the bot into the chat UI
function addMessage(text, sender) {
  const msg = document.createElement("div"); // Create a new div for the message
  msg.className = `msg ${sender}`; // Apply styling class: 'msg user' or 'msg bot'
  msg.textContent = text; // Insert the message text

  // Append the message to the chat container
  document.getElementById("chatBox").appendChild(msg);

  // Auto-scroll to latest message
  scrollChatToBottom();
}

// saveToHistory: saves message to localStorage for persistence
function saveToHistory(sender, text) {
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatHistory.push({ sender, text });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// loadChatHistory: loads and displays previous messages from localStorage
function loadChatHistory() {
  const chatBox = document.getElementById("chatBox");
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

  chatHistory.forEach(entry => {
    const msg = document.createElement("div");
    msg.className = `msg ${entry.sender}`;
    msg.textContent = entry.text;
    chatBox.appendChild(msg);
  });

  scrollChatToBottom();
}

// Automatically load chat history on page load
document.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
});
