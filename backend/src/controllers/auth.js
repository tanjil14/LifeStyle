const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const env = require("../config/envConfig");
const UserModel = require("../models/User.js");
module.exports.register = async (req, res) => {
  try {
    const {
      username,
      fullName,
      email,
      password,
      phone,
      address,
      gender,
      active,
      img,
    } = req.body;
    const cipherText = CryptoJS.AES.encrypt(
      password,
      env.JWT_SECRET
    ).toString();
    const emailExist = await UserModel.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "User already registered!" });
    } else {
      const response = await UserModel.create({
        username,
        fullName,
        email,
        password: cipherText,
        phone,
        address,
        gender,
        active,
        img,
      });
      return res
        .status(200)
        .json({ message: "User created Successfully..!", response });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server internal error!" });
  }
};
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.JWT_SECRET);
      const originalPass = bytes.toString(CryptoJS.enc.Utf8);
      const isPasswordCorrect = password === originalPass;
      if (isPasswordCorrect) {
        const { password, ...others } = user._doc;
        const token = jwt.sign(
          {
            id: user._id,
            isAdmin: user.isAdmin,
          },
          process.env.JWT_SECRET,
          { expiresIn: "3d" }
        );
        // res.status(200).json({ others, token }); // "others":{} to prevent this use spread operator
        res.status(200).json({ ...others, token });
      } else {
        res.status(400).json({ message: "invalid Password" });
      }
    } else {
      res.status(400).json({ message: "User not found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server internal error!" });
  }
};
