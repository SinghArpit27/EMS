const { check, validationResult } = require("express-validator");
const User = require("../models/userModel");
// const otp = require("../models/otp");
const bcrypt = require("bcrypt");


var registerValidation = [
    /*------------validation for first_name--------------*/
    check("name")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Enter name")
      .bail()
      .isLength({ min: 2 })
      .withMessage("Name must have 3 words")
      .bail()
      .isAlpha()
      .withMessage("Name Cannot Contain Number"),
  
    /*------------validation for email--------------*/
    check("email")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Enter Email")
      .bail()
      .isEmail()
      .withMessage("Enter a valid email")
      .bail()
      .custom(async (value) => {
        const user = await User.find({ email: value });
  
        if (user.length > 0) {
          throw new Error("Email already exists");
        }
      }),
  
    /*------------validation for Phone NO.--------------*/
    check("phone")
    .not()
    .isEmpty()
    .withMessage("Mobile Number is required")
    .bail()
    .trim()
    .isMobilePhone('any', {strictMode: false})
    .withMessage("Invalid Mobile Number")
    .bail()
    .custom(async (value) => {
      const user = await User.find({ phone: value});
      if(user.length > 0){
        throw new Error("Phone already exist");
      }
    }),
  
  
    /*------------validation for password--------------*/
    check("password")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Enter Password")
      .bail()
      .isLength({ min: 4 })
      .withMessage("Password must 4 characters"),
  
    /*------------validation for Confirm password--------------*/
    // check("confirm_password").custom(async (value, { req }) => {
    //   if (value != req.body.password) {
    //     throw new Error("Password and Confirm password must be same");
    //   }
    // }),
  ];