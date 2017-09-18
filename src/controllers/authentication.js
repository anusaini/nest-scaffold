const {User} = require('models/')
const jwt = require('jsonwebtoken')
const config = require('configs/local')
const constants = require('constants/local')

const jwtSignUser = user => {
  return jwt.sign(user, config.auth.jwtSecret, {
    expiresIn: constants.ONE_WEEK
  })
}

const register = async (req, res) => {
  try {
    const user = await User.create(req.body)
    const userJson = user.toJSON()
    const data = {
      message: `User created with ${user.email}.`,
      user: userJson,
      token: jwtSignUser(userJson)
    }
    res.send(data)
  } catch (err) {
    const message = `User with this email already exists.`
    res.status(400).send({
      message
    })
    console.error(`authenticationController.register: ${message}`)
  }
}

const login = async (req, res) => {
  try {
    const {email, password} = req.body
    const user = await User.findOne({
      where: {
        email: email
      }
    })
    const error403 = () => {
      res.status(403).send({
        error: `${user.email} is not logged in. Try again!`
      })
    }
    if (user) {
      const isPasswordValid = await user.comparePassword(password)
      if (isPasswordValid) {
        const userJson = user.toJSON()
        const data = {
          message: `${user.email} is logged in.`,
          user: userJson,
          token: jwtSignUser(userJson)
        }
        res.send(data)
      } else {
        error403()
      }
    } else {
      error403()
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({
      error: `An error as occurred. Try again!`
    })
  }
}

module.exports = {
  register,
  login
}
