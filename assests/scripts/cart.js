fetch('header')
    .then(response => response.text())
    .then(data => document.getElementById('contactUs_navbar').innerHTML = data);

fetch('footer')
    .then(response => response.text())
    .then(data => document.getElementById('footer').innerHTML = data);
