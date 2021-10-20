const jwt = require('jsonwebtoken')
const JWT_KEY = process.env.PASSWD
const JWT_MASTERKEY = process.env.KEY
const isUser = (req, res, next) => {
  console.log('cookie name : ' + req.headers.cookie.split(';')[0].split('=')[0])
  console.log('cookie value: ' + req.headers.cookie.split(';')[0].split('=')[1])

  const token = req.headers.cookie.split(';')[0].split('=')[1]

  if (!token) return res.status(400).send('access denied')

  try {
    const verifiedUser = jwt.verify(token, JWT_KEY)
    req.user = verifiedUser
    next()
  } catch (err) {
    res.status(400).send('invalid token')
  }
}

const isAdmin = (req, res, next) => {
  console.log('cookie name : ' + req.headers.cookie.split(';')[0].split('=')[0])
  console.log('cookie value: ' + req.headers.cookie.split(';')[0].split('=')[1])

  const token = req.headers.cookie.split(';')[0].split('=')[1]
  if (!token) return res.status(400).send('access denied')

  try {
    const verifiedAdmin = jwt.verify(token, JWT_MASTERKEY)
    req.admin = verifiedAdmin
    console.log('adminJWT verified and proceeds to API operation')
    next()
  } catch (err) {
    res.status(400).send('invalid token')
  }
}

module.exports = { isUser, isAdmin }
