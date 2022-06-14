//I18n configurations
const i18n = require('i18n')
const path = require('path')

i18n.configure({

    locales: ['de', 'en', 'fr'],
    directory: path.join(__dirname, '../locales'),
    header: 'accept-language',
    register: global
})

module.exports = i18n;