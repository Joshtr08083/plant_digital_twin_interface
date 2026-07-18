async function poll() {
    const res = await fetch('/api/latest/');
    const data = await res.json();
    document.getElementById('readings').innerHTML =
        data.readings.map(r => `<li>${r.timestamp} — ${r.raw}</li>`).join('');
}
setInterval(poll, 50);
poll();