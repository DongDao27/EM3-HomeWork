document.querySelectorAll('[data-image-picker]').forEach((picker) => {
    const input = picker.querySelector('input[type="file"]');
    const count = picker.querySelector('[data-image-count]');
    const preview = picker.querySelector('[data-image-preview]');
    let previewUrls = [];

    input.addEventListener('change', () => {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        previewUrls = [];
        preview.replaceChildren();
        input.setCustomValidity('');

        const files = Array.from(input.files);
        count.textContent = files.length ? `Đã chọn ${files.length} ảnh` : '';

        if (files.length > 5) {
            input.setCustomValidity('Chỉ chọn tối đa 5 ảnh.');
        } else if (files.some((file) => file.size > 2 * 1024 * 1024)) {
            input.setCustomValidity('Mỗi ảnh phải nhỏ hơn hoặc bằng 2 MB.');
        }

        files.slice(0, 5).forEach((file) => {
            const image = document.createElement('img');
            const url = URL.createObjectURL(file);
            previewUrls.push(url);
            image.src = url;
            image.alt = file.name;
            image.className = 'preview';
            preview.append(image);
        });
    });
});
