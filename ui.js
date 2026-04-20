(function() {
  function createSwitch(label, active, onChange) {
    const item = document.createElement('label');
    item.className = 'switch-item' + (active ? ' active' : '');
    item.innerHTML = `<div class="switch-track"></div><span>${label}</span>`;
    item.addEventListener('click', () => {
      const next = !item.classList.contains('active');
      item.classList.toggle('active', next);
      onChange(next);
    });
    return item;
  }

  window.Ui = { createSwitch };
})();
