const jwt = require('jsonwebtoken')
const {ADMIN, MANAGER} = require('../../utils/consts')
const keys = require('../config/keys');

const get_role = req => {
  const auth = req.headers.authorization
  if (!auth) {
    return null
  }
  const data=auth.split(' ')[1]
  const decoded = jwt.decode(data);
  console.log(`Decode token:${JSON.stringify(decoded)}`)
  return decoded.role
}

const is_b2b_admin = req => {
  return ADMIN == get_role(req)
}

const is_b2b_manager = req => {
  return MANAGER == get_role(req)
}

const is_mode_company = req => {
  return is_b2b_admin(req) || is_b2b_manager(req)
}

//Create JWT cookie with user credentials
const sendCookie = (user, role, res) => {
  const payload = {
    id: user.id,
    name: user.name,
    firstname: user.firstname,
    is_admin: user.is_admin,
    is_alfred: user.is_alfred,
    is_alfred_pro: user.shop && user.shop.length==1 && !user.shop[0].is_particular,
    role: role,
  }; // Create JWT payload

  jwt.sign(payload, keys.JWT.secretOrKey, (err, token) => {
    res.cookie('token', 'Bearer ' + token, {
      httpOnly: false,
      secure: true,
      sameSite: true,
    })
      .status('201')
      .json()
  });
};

module.exports = {get_role, is_b2b_admin, is_b2b_manager, is_mode_company, sendCookie}
