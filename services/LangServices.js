exports.detecLang = (input) => {
    const boo = /[\u0E00-\u0E7F]/.test(input)
    if (boo) {
        return 'th'
    } if (!boo) {
        return 'en'
    }
}