import { CDN_BASE_URL } from '@config/index'

const sidsWithFemaleGif = [14720, 6080, 13568, 8544, 12800, 12768, 8224, 13376, 10624, 10336, 13280, 8192, 14496, 7424, 8608, 14592, 13408, 18944, 14208, 14240, 14176, 6496, 6624, 1344, 10112, 6848, 14368, 14400, 7328, 18976, 12832, 12864, 5312, 5280, 8704, 14624, 12928, 12960, 4128, 15136, 9856, 9824, 4928, 11200, 6336, 10304, 8768, 7168, 13344, 800, 808, 7072, 5952, 21376, 6240, 640, 608, 11808, 3584, 14848, 10080, 13024, 15328, 6784, 3936, 8800, 12896, 6880, 14688, 12736, 12704, 12672, 6656, 5920, 10144, 14880, 8160, 14528, 16672, 6944, 14752, 6464, 6208, 5696, 1312];
const sidsWithFemaleMini = [18944, 18976, 21376, 16672];


class ImageHandler {
  baseUrl: string = CDN_BASE_URL
  getImage(sid: number, shiny: boolean | undefined, g: "M" | "F" | "N" | undefined, back: boolean | undefined) {
    let image = sid.toString()
    if (back) {
      image = image + '-b'
    }
    let gender = g
    if (gender === undefined) {
      gender = "M"
    }
    if (gender === "F" && sidsWithFemaleGif.includes(sid)) {
      image = image + '-f'
    }
    if (shiny) {
      image = image + '-s'
    }
    return `${this.baseUrl}/models/${image}.gif`
  }
  getMini(sid: number, gender?: string) {
    let image = sid.toString()
    if (sid > 15776 && sid <= 15793) {
      image = '15776' // Special Arceus Case
    }
    if (sid > 20768 && sid <= 20772) {
      image = '20768' // Special Genesect Case
    }
    if (gender === "F" && sidsWithFemaleMini.includes(sid)) {
      image = image + '-f'
    }
    return `${this.baseUrl}/mini/${image}.png`
  }
  getProfile(id: number) {
    return `${this.baseUrl}/profiles/${id}.png`
  }
  getQuestionmark() {
    return this.getMini(6459, "");
  }
}

export default ImageHandler
