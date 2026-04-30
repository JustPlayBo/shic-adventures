document.querySelectorAll('[data-spoiler]').forEach(function(section){
  var toggle = section.querySelector('.spoiler__toggle');
  if (!toggle) return;
  toggle.addEventListener('click', function(){
    var open = section.getAttribute('data-spoiler-open') === 'true';
    section.setAttribute('data-spoiler-open', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    toggle.textContent = open ? 'Reveal ▸' : 'Hide ▾';
  });
});
