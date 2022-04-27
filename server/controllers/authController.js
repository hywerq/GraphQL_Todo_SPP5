const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {secret} = require('../config');

const generateAccessToken = (id, roles) => {
    const payload = { id, roles };
    return jwt.sign(payload, secret, {expiresIn: '1h'});
}

class authController {
    async registration(username, password) {
        try {
            const person = await User.findOne({username});
            if(person) {
                return JSON.stringify({message: `${username} already exists`, type: 'error'});
            }

            const hashPassword = bcrypt.hashSync(password, 6);
            const userRole = await Role.findOne({value: "USER"});
            const user = new User({username, password: hashPassword, roles: [userRole.value]});

            await user.save();
            return JSON.stringify({message: 'Successfully registered'});
        }
        catch (e) {
            console.log(e);
            return JSON.stringify({message: 'Registration error', type: 'error'});
        }
    }

    async login(username, password) {
        try {
            const user = await User.findOne({username});
            if(!user) {
                return JSON.stringify({message: `Couldn't find user ${username}`, type: 'error'});
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if(!validPassword) {
                return JSON.stringify({message: 'Wrong password', type: 'error'});
            }

            const token = generateAccessToken(user._id, user.roles);

            return JSON.stringify({message: `Welcome, ${username}!`, response: 'login', token: token});
        }
        catch (e) {
            console.log(e);
            return JSON.stringify({message: 'Login error', type: 'error'});
        }
    }

    async getCookie(token) {
        try {
            if(token) {
                return JSON.stringify({response: 'token', value: token });
            }

            return JSON.stringify({response: 'token', value: null });
        }
        catch (e) {
            console.log(e);
            return JSON.stringify({message: `Couldn't get cookie`, type: 'error'});
        }
    }

    async removeCookie() {
        return JSON.stringify({response: 'token', value: null });
    }
}

module.exports = new authController;