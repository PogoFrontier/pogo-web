import { CDN_BASE_URL } from '@config/index'

class ImageHandler {
  baseUrl: string = CDN_BASE_URL
  getImage(sid: number, shiny: boolean | undefined, back: boolean | undefined) {
    let image = sid.toString()
    if (back) {
      image = image + '-b'
    }
    if (shiny) {
      image = image + '-s'
    }
    return `${this.baseUrl}/models/${image}.gif`
  }
  getMini(sid: number) {
    let image = sid.toString()
    if (sid > 15776 && sid <= 15793) {
      image = '15776' // Special Arceus Case
    }
    if (sid > 20768 && sid <= 20772) {
      image = '20768' // Special Genesect Case
    }
    return `${this.baseUrl}/mini/${image}.png`
  }
  getProfile(id: number) {
    return `${this.baseUrl}/profiles/${id}.png`
  }
}

export default ImageHandler
