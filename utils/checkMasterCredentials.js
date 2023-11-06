const checkMasterCredentials = ({ username, password }) =>
  username === process.env.MASTER_USERNAME &&
  password === process.env.MASTER_PASSWORD

export default checkMasterCredentials
