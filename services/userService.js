const {v4: uuidv4} = require("uuid");
const UsersModel = require("../models/user");
const { Op } = require("sequelize");
const { sendActivationMail } = require("./mailService");
const { generateTokens, saveToken, removeToken, validateRefreshToken, findToken } = require("./tokenService");
const AdminAPIError = require("../exeptions/admin/api-error");


async function registration(email, password, name, deviceFingerprint) {
    const candidate = await UsersModel.findOne({
        where: {
            [Op.and] : [
                {email: email},
                {password: {
                    [Op.not]: null
                }}
            ]
            
        }
    });

    if(candidate){
        throw  AdminAPIError.BadRequest(`Користувач з такою email адресою ${email} уже існує`);
    }

    const hashedPassword = await bcrypt.hash(password, 5);
    const activationLink = uuidv4();
    const user = await UsersModel.create({
        name,
        password: hashedPassword, 
        email,
        activationLink
    });
    await sendActivationMail(email, `${process.env.API_URL}/api/admin/auth/activate/${activationLink}`);
    const userData = {id: user?.id, name: user?.name, email: user?.email, isActivated: user?.isActivated, role: user?.role}
    const tokens = generateTokens(userData);
    await saveToken(userData?.id, tokens?.refreshToken, deviceFingerprint);

    return {
        ...tokens,
        user: userData
    }
}

async function activation(activationLink){
    const user = await UsersModel.findOne({
        activationLink   
    });

    if(!user) {
        throw AdminAPIError.BadRequest("Некоректне посилання активації");
    }

    user.isActivated = true;
    await user.save();
}

async function login(email, password, deviceFingerprint){
    const candidate = await UsersModel.findOne({
        where: {
            [Op.and] : [
                {email: email},
                {password: {
                    [Op.not]: null
                }}
            ]
            
        }
    });

    if(!candidate){
        throw  AdminAPIError.BadRequest(`Користувача з такою email адресою ${email} не існує`);
    }

    const isPasswordEquals = await bcrypt.compare(password, candidate?.password);

    if(!isPasswordEquals) {
        throw  AdminAPIError.BadRequest(`Невірний пароль`);
    }

    const userData = {id: candidate?.id, name: candidate?.name, email: candidate?.email, isActivated: candidate?.isActivated, role: candidate?.role};
    const tokens = generateTokens(userData);

    await saveToken(userData?.id, tokens?.refreshToken, deviceFingerprint);

    return {
        ...tokens,
        user: userData
    }
}

async function logout(refreshToken){
    const token = await removeToken(refreshToken);
    return token;
}

async function refresh(refreshToken, deviceFingerprint){
    if(!refreshToken) {
        throw AdminAPIError.UnauthorizedError();
    }
    const userData = validateRefreshToken(refreshToken);
    const tokenFromDb = await findToken(refreshToken);

    if(!userData || !tokenFromDb) {
        throw AdminAPIError.UnauthorizedError();
    }

    const user = await UsersModel.findById(userData?.id);
    const userDataObj = {id: user?.id, name: user?.name, email: user?.email, isActivated: user?.isActivated, role: user?.role};
    const tokens = generateTokens(userDataObj);

    await saveToken(userDataObj?.id, tokens?.refreshToken, deviceFingerprint);

    return {
        ...tokens,
        user: userData
    }
}  

module.exports = {
    registration,
    activation,
    login,
    logout,
    refresh
}