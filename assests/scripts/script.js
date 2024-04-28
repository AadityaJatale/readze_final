fetch('/header')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

fetch('/footer')
    .then(response => response.text())
    .then(data => document.getElementById('footer').innerHTML = data);

document.querySelectorAll('.card-slider').forEach(slider => {
    const cardContainer = slider.querySelector('.card-container');
    const prevBtn = slider.querySelector('.prev-btn');
    const nextBtn = slider.querySelector('.next-btn');
    let currentIndex = 0;
    const maxIndex = Math.ceil(cardContainer.scrollWidth / cardContainer.clientWidth) - 1;

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            cardContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
            cardContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    });
});