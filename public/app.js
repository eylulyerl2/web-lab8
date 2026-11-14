const statusElement = document.querySelector('#status');
const outputElement = document.querySelector('#output');
const buttons = document.querySelectorAll('button[data-url]');

function formatBody(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

async function sendRequest(method, url) {
  statusElement.textContent = `Sending ${method} ${url}...`;
  statusElement.className = '';
  outputElement.textContent = '';

  try {
    const response = await fetch(url, { method });
    const text = await response.text();

    statusElement.textContent = `${response.status} ${response.statusText}`;
    statusElement.className = response.ok ? 'success' : 'failure';
    outputElement.textContent = formatBody(text);
  } catch (error) {
    statusElement.textContent = 'Network error';
    statusElement.className = 'failure';
    outputElement.textContent = error.message;
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    sendRequest(button.dataset.method, button.dataset.url);
  });
});