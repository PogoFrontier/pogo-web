import * as langs from './ExportTranslations'

type LangObject = { [k: string]: object }
const importedLanguages = { ...langs } as LangObject

const languages = Object.keys(langs)

function getStrings(locale: string): any {
  return importedLanguages[locale]
}

export { languages, getStrings }
