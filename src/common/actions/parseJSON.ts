const parseJSON = async (response: Response) => {
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

export default parseJSON