const { Error } = require('joi');

const HandleErrorMessage = async (err, req, res, next) => {

    try {
        if (Error(err)) {
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
        return res.status(400).send({ status: false, message: e.message })
    }
}

module.exports = { HandleErrorMessage }





