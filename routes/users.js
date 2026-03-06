var express = require('express');
var router = express.Router();
let userSchema = require('../schemas/users');

// GET ALL - /api/v1/users
// Lấy tất cả users chưa bị xoá mềm, populate thông tin role
router.get('/', async function (req, res, next) {
  try {
    let result = await userSchema
      .find({ isDeleted: false })
      .populate({ path: 'role', select: 'name description' })
      .select('-password'); // Không trả về password
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET BY ID - /api/v1/users/:id
// Lấy user theo id (chỉ trả về nếu chưa bị xoá mềm)
router.get('/:id', async function (req, res, next) {
  try {
    let result = await userSchema
      .findOne({ _id: req.params.id, isDeleted: false })
      .populate({ path: 'role', select: 'name description' })
      .select('-password');
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "Không tìm thấy User với ID này" });
    }
  } catch (error) {
    res.status(404).send({ message: "ID không hợp lệ hoặc không tồn tại" });
  }
});

// CREATE - POST /api/v1/users
// Tạo user mới
router.post('/', async function (req, res, next) {
  try {
    let newUser = new userSchema({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.roleId,
      loginCount: req.body.loginCount
    });
    await newUser.save();
    // Trả về user nhưng ẩn password
    let savedUser = newUser.toObject();
    delete savedUser.password;
    res.status(201).send(savedUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// UPDATE - PUT /api/v1/users/:id
// Cập nhật thông tin user
router.put('/:id', async function (req, res, next) {
  try {
    // Ngăn cập nhật password trực tiếp qua route này
    if (req.body.password) delete req.body.password;

    let result = await userSchema
      .findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        req.body,
        { new: true }
      )
      .populate({ path: 'role', select: 'name description' })
      .select('-password');

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "Không tìm thấy User với ID này" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// SOFT DELETE - DELETE /api/v1/users/:id
// Xoá mềm user (chuyển isDeleted = true)
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await userSchema.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    ).select('-password');

    if (result) {
      res.status(200).send({
        message: "Xoá mềm User thành công",
        data: result
      });
    } else {
      res.status(404).send({ message: "Không tìm thấy User với ID này" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// ENABLE - POST /api/v1/users/enable
// Kích hoạt tài khoản user (status = true) nếu email và username khớp
router.post('/enable', async function (req, res, next) {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).send({
        message: "Vui lòng cung cấp đầy đủ email và username"
      });
    }

    // Tìm user với email và username khớp, chưa bị xoá mềm
    let user = await userSchema.findOne({
      email: email,
      username: username,
      isDeleted: false
    });

    if (!user) {
      return res.status(404).send({
        message: "Thông tin email hoặc username không chính xác"
      });
    }

    // Cập nhật status thành true
    user.status = true;
    await user.save();

    res.status(200).send({
      message: "Kích hoạt tài khoản thành công",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DISABLE - POST /api/v1/users/disable
// Vô hiệu hoá tài khoản user (status = false) nếu email và username khớp
router.post('/disable', async function (req, res, next) {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).send({
        message: "Vui lòng cung cấp đầy đủ email và username"
      });
    }

    // Tìm user với email và username khớp, chưa bị xoá mềm
    let user = await userSchema.findOne({
      email: email,
      username: username,
      isDeleted: false
    });

    if (!user) {
      return res.status(404).send({
        message: "Thông tin email hoặc username không chính xác"
      });
    }

    // Cập nhật status thành false
    user.status = false;
    await user.save();

    res.status(200).send({
      message: "Vô hiệu hoá tài khoản thành công",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
