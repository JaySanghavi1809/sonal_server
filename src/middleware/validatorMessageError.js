const { isCelebrateError } = require('celebrate');

const HandleErrorMessage = async (err, req, res, next) => {

    try {
        console.log(err)
        if (isCelebrateError(err)) {
            let errorFieldBody;
            if (err.details.get('body')) {
                errorFieldBody = err.details.get('body');
            } else if (err.details.get('query')) {
                errorFieldBody = err.details.get('query');
            } else if (err.details.get('headers')) {
                errorFieldBody = err.details.get('headers');
            }
            return res.status(400).send({ status: false, message: errorFieldBody.details[0].message });
        }
    } catch (e) {
        console.log("e", e)
        return res.status(400).send({ status: false, message: e.message })
    }
}

module.exports = { HandleErrorMessage }





