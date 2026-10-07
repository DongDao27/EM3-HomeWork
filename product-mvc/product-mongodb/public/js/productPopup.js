document.querySelectorAll('[data-open-product]').forEach((button) => {
    button.addEventListener('click', () => {
        const popup = document.getElementById(button.dataset.openProduct);
        popup.showModal();
        document.body.classList.add('popup-open');
    });
});

document.querySelectorAll('.product-popup').forEach((popup) => {
    function closePopup() {
        popup.close();
        document.body.classList.remove('popup-open');
    }

    popup
        .querySelector('[data-close-product]')
        .addEventListener('click', () => {
            closePopup();
        });

    popup.addEventListener('click', (event) => {
        const bounds = popup.getBoundingClientRect();
        const outside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

        if (event.target === popup && outside) {
            closePopup();
        }
    });

    popup.addEventListener('cancel', () => {
        document.body.classList.remove('popup-open');
    });

    popup.addEventListener('close', () => {
        if (!popup.open) {
            document.body.classList.remove('popup-open');
        }
    });
});
