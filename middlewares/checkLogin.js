const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 응답 객체
class ApiResponse {
    constructor(code, message = '', data = {}) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}

// Express에서 사용하는 미들웨어 함수
module.exports = async (req, res, next) => {
    console.log('****** 체크 로그인 미들웨어 시작 ******');
    try {
        const Authorization = req.header('Authorization');
        // console.log('아곤 받은 토큰 = ', Authorization);
        // 토큰이 있는지 확인
        if (!Authorization) {
            // console.log('토큰 없음 --------------');
            res.locals.user = [];
        } else {
            // console.log('토큰 있음 ------------------?');

            const [authType, authToken] = Authorization.split(' ');
            // console.log('authType = ', authType);
            // console.log('authToken = ', authToken);
            // console.log('토큰 형식 ---------------');

            // authType === Bearer인지 확인
            if (authType !== 'Bearer' || !authToken) {
                // console.log('토큰 Bearer 타입 아님');
                res.locals.user = [];
            } else {
                const { userId } = jwt.verify(
                    authToken,
                    process.env.JWT_SECRET
                );
                // console.log('middleware 디코드한 유저정보 = ', userId);
                const user = await User.findOne({ where: { userId } });
                // console.log('유저정보담아서보냄');

                res.locals.user = user;
            }
            console.log('****** 체크 로그인 미들웨어 확인 완료 *******');
        }
        next();
    } catch (error) {
        const response = new ApiResponse(403, '로그인이 필요한 서비스입니다.');
        return res.status(403).json(response);
    }
};
