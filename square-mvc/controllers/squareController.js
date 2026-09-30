const Square = require('../models/square');

const renderPage = (res, data = {}) => {
  res.render('index', {
    sideLength: '',
    perimeter: null,
    area: null,
    error: null,
    ...data,
  });
};

exports.showForm = (req, res) => {
  renderPage(res);
};

exports.calculateSquare = async (req, res) => {
  const rawSideLength = req.body.sideLength;
  const sideLength = Number(rawSideLength);

  if (
    rawSideLength === undefined ||
    rawSideLength.trim() === '' ||
    !Number.isFinite(sideLength) ||
    sideLength <= 0
  ) {
    return renderPage(res.status(400), {
      sideLength: rawSideLength ?? '',
      error: 'Vui lòng nhập độ dài cạnh là một số lớn hơn 0.',
    });
  }

  const perimeter = 4 * sideLength;
  const area = sideLength ** 2;

  try {
    await Square.create({ sideLength, perimeter, area });
    return renderPage(res, { sideLength, perimeter, area });
  } catch (error) {
    console.error('Không thể lưu kết quả:', error.message);
    return renderPage(res.status(500), {
      sideLength,
      error: 'Không thể lưu kết quả vào MongoDB. Vui lòng thử lại.',
    });
  }
};
