function mapLanguage(lang : string) : string {
    const languages : {[x : string]:any} = {
        "English" : "en",
        "Dutch" : "nl",
        "German" : "de",
        "French" : "fr"
    }
    return languages[lang] ?? "en"
}

export default mapLanguage