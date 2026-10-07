document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const mainImage = gallery.querySelector('.gallery-main');
    const thumbnails = Array.from(gallery.querySelectorAll('.gallery-thumb'));
    function showImage(index) {
        mainImage.src = thumbnails[index].querySelector('img').src;

        thumbnails.forEach((button, buttonIndex) => {
            const selected = buttonIndex === index;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    }

    thumbnails.forEach((button, index) => {
        button.addEventListener('click', () => showImage(index));
    });
});
