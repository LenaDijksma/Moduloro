// name: Clock

export function render(container) {
  container.innerHTML = `
    <div class="container">
    <h2>Clock</h2>
    <p id="clock-time" style="font-size:2rem"></p>
    <h3 id="timezone"></h3></div>
  `;

  const timeEl = container.querySelector('#clock-time');

  const timezone = new Intl.DateTimeFormat('en', {
    timeZoneName: 'short'
  }).formatToParts(new Date()).find(part => part.type === 'timeZoneName').value;

  const timezoneC = container.querySelector('#timezone');
  timezoneC.textContent = timezone;

  function tick() {
    timeEl.textContent = new Date().toLocaleTimeString();
  }

  tick();
  const interval = setInterval(tick, 1000);

  // Stop the interval if the user navigates to a different tool
  const observer = new MutationObserver(() => {
    if (!document.body.contains(timeEl)) {
      clearInterval(interval);
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('content'), { childList: true, subtree: true });
}
