const { readFileSync, writeFileSync } = require("fs")

// Below we create an empty entry for solidarity so it doens't complain about
// any way that the folks in Expo set up stuff
const data = readFileSync("./.solidarity")
const jsonData = JSON.parse(data)
jsonData.requirements = {}
const blankSolidarityRules = JSON.stringify(jsonData, null, 2)
writeFileSync("./.solidarity", blankSolidarityRules, "utf8")
