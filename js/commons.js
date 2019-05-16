export const b64EncodeUnicode = (str) => {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

export const b64DecodeUnicode = (str) => {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

export const encodeText = (text, prefix = 't') => {
    return b64EncodeUnicode(`${prefix}${text}`)
}

export const encodeImageAndText = (text, imageUrl) => {
    const obj = {
        't': text,
        'i': imageUrl
    }
    return b64EncodeUnicode('i' + JSON.stringify(obj))
}

export const decodeState = (code) => {
    const decoded = b64DecodeUnicode(code)
    const state = {}
    if (decoded[0] == 't') {
        state.text = decoded.substring(1)
    } else if (decoded[0] == 'i') {
        const obj = JSON.parse(decoded.substring(1))
        state.text = obj.t
        state.imageUrl = obj.i
    } else if (decoded[0] == 'm') {
        state.markdown = decoded.substring(1)
    }
    return state
}

export const getMessageElement = (state) => {
    const textElement = $('<pre/>').addClass('message').text(state.text)
    if (state.markdown !== undefined) {
        const converter = new showdown.Converter()
        return converter.makeHtml(state.markdown)
    } else if (state.imageUrl !== undefined) {
        const div = $('<div/>').addClass('center')
        const img = $('<img/>').addClass('image').attr('src', state.imageUrl)
        div.append(img)
        div.append(textElement)
        return div                
    } else {
        return textElement
    }
}