const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.post('/', userController.addUser);
router.post('/login', userController.loginUser); 
router.put('/:id', userController.editUser);
router.delete('/:id', userController.removeUser);

module.exports = router;