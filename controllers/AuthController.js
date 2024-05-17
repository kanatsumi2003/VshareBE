const jwt = require("jsonwebtoken");
const { beautifyJson } = require("../helpers");
const UserService = require("../services/UserService");
const CustomerService = require("../services/CustomerService");
const AuthService = require("../services/AuthService");
const constants = require("../config/constants");
const { formatPhone0x } = require("../utils/FormatUtil");
const { success: resSuccess, error: resError } = require("../utils/ResponseUtil");

async function userLogin(req, res) {
  try {
    const body = beautifyJson(req.body);
    const { username, password } = body;
    let user = await UserService.getOne({ username });
    if (!user) {
      return res.status(404).send({ message: "Tài khoản không tồn tại" });
    }
    if (!(await user.validPassword(password))) {
      throw new Error("Mật khẩu không chính xác");
    }
    if (!user.active) {
      throw new Error("Tài khoản đang bị khóa");
    }
    const data = {
      sub: user.id,
      user_type: user.user_type,
      username: user.username,
      email: user.email,
      phone: user.phone,
      fullname: user.fullname,
    };
    const result = AuthService.encodeData(data);
    return res.status(200).send(result);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ message: error.message });
  }
}

async function userRefreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    var decode = jwt.verify(refreshToken, constants.JWT_REFRESH_TOKEN_SECRET);
    const result = AuthService.encodeData(decode);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
}

async function userLogout(req, res) {
  try {
    req.logout();
    return res.send({ authenticated: req.isAuthenticated() });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
}

async function customerLogin(req, res) {
  try {
    const body = beautifyJson(req.body);
    const { phone, password } = body;
    let customer = await CustomerService.getByPhone(phone);
    if (!customer) {
      return res.status(404).send({ message: "Tài khoản không tồn tại" });
    }
    if (customer)
      customer = await CustomerService.getOne(
        { id: customer.id },
        { attributes: ["id", "email", "phone", "fullname", "other_data", "password"] }
      );
    if (!(await customer.validPassword(password))) {
      throw new Error("Mật khẩu không chính xác");
    }
    const data = {
      sub: customer.id,
      email: customer.email,
      phone: customer.phone,
      fullname: customer.fullname,
      avatar: customer.other_data ? customer.other_data.avatar : "",
    };
    const result = AuthService.encodeData(data);
    return res.status(200).send(result);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ message: error.message });
  }
}

async function customerRefreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    var decode = jwt.verify(refreshToken, constants.JWT_REFRESH_TOKEN_SECRET);
    const result = AuthService.encodeData(decode);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
}

async function customerLogout(req, res) {
  try {
    req.logout();
    return res.send({ authenticated: req.isAuthenticated() });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
}

async function customerRegister(req, res) {
  try {
    const data = req.body;
    const checkExist = await CustomerService.getOne({ phone0x: formatPhone0x(data.phone) });
    if (checkExist) {
      return resError(res, { message: "Số điện thoại đã được sử dụng", status: 409 });
    }
    const customer = await CustomerService.create(req.body);
    if (customer) {
      return resSuccess(res, { message: "success", data: { customerId: customer.id } });
    }
    throw new Error("failed");
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
}

async function customerForgotPassword(req, res) {
  try {
    const { phone, email } = req.body;
    const customer = await CustomerService.getOne({ phone0x: formatPhone0x(phone) });
    if (!customer) {
      return resError(res, { message: "Tài khoản không tồn tại", status: 404 });
    }
    if (customer.email && customer.email !== email) {
      throw new Error('Email không khớp với tài khoản')
    }
    if (!customer.email) {
      customer.email = email;
      await customer.save();
    }
    await CustomerService.resetPassword(customer);
    return resSuccess(res, { message: "success" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
}

async function customerChangePassword(req, res) {
  try {
    const
      { sub } = req.user,
      { oldPassword, newPassword } = req.body;

    const customer = await CustomerService.getById(sub);
    if (!customer) {
      return resError(res, { message: "Tài khoản không tồn tại", status: 404 });
    }
    if (!(await customer.validPassword(oldPassword))) {
      throw new Error("Mật khẩu cũ không chính xác");
    }
    customer.password = newPassword;
    await customer.save();
    return resSuccess(res, { message: "success" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
}

module.exports = {
  userLogin,
  userLogout,
  userRefreshToken,
  customerLogin,
  customerLogout,
  customerRefreshToken,
  customerRegister,
  customerForgotPassword,
  customerChangePassword,
};
