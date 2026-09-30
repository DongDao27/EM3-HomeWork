const express = require('express');
const controller = require('../controllers/productController');

const router = express.Router();

router.get('/', controller.index);
router.get('/new', controller.showCreateForm);
router.post('/', controller.create);
router.get('/:id/edit', controller.showEditForm);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
