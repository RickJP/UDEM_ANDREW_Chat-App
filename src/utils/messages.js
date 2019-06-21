const generateMsg = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocMsg = (username, url) => {
  return {
    username,
    url: `https://google.com/maps?q=${url}`,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMsg,
  generateLocMsg
}