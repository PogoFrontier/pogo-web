export default function getUserToken(): string {
  const asJSON = localStorage.getItem('userToken')
  const userObj = JSON.parse(asJSON ? asJSON : '{"token": ""}')
  return userObj.token
}
