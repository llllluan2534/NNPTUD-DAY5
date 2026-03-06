var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/roles');

// GET ALL - /api/v1/roles
// Lấy tất cả roles chưa bị xoá mềm
router.get('/', async function (req, res, next) {
    try {
        let result = await roleSchema.find({ isDeleted: false });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET BY ID - /api/v1/roles/:id
// Lấy role theo id (chỉ trả về nếu chưa bị xoá mềm)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await roleSchema.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(404).send({ message: "Không tìm thấy Role với ID này" });
        }
    } catch (error) {
        res.status(404).send({ message: "ID không hợp lệ hoặc không tồn tại" });
    }
});

// CREATE - POST /api/v1/roles
// Tạo role mới
router.post('/', async function (req, res, next) {
    try {
        let newRole = new roleSchema({
            name: req.body.name,
            description: req.body.description
        });
        await newRole.save();
        res.status(201).send(newRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// UPDATE - PUT /api/v1/roles/:id
// Cập nhật thông tin role
router.put('/:id', async function (req, res, next) {
    try {
        let result = await roleSchema.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true }
        );
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(404).send({ message: "Không tìm thấy Role với ID này" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// SOFT DELETE - DELETE /api/v1/roles/:id
// Xoá mềm role (chuyển isDeleted = true)
router.delete('/:id', async function (req, res, next) {
    try {
        let result = await roleSchema.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (result) {
            res.status(200).send({
                message: "Xoá mềm Role thành công",
                data: result
            });
        } else {
            res.status(404).send({ message: "Không tìm thấy Role với ID này" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
