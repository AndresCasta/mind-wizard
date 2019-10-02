# @author: Romualdo Villalobos
import os
import re

gameName = "BirdExpressions"
targetSdkVersion = "0.7.0.1"
targetComponentVersion = "0.7.0"

configFileUrl = "config.js"
packageFileUrl = "package.json"
gameFileUrl = "PixiArenas/" + gameName + "/" + gameName + ".js"
gameJsonFileUrl = "PixiArenas/" + gameName + "/" + gameName + ".json"
gameThemeFileUrl = "PixiArenas" + gameName + "/" + gameName + "Theme.js"

# Config file related
#region

# process config file
def processConfigFile ():
    tmpFileUrl = ".tmp." + configFileUrl
    fileWrite = open(tmpFileUrl, "w+")
    fileRead = open(configFileUrl, "r")
    fileLines = fileRead.readlines()
    for line in fileLines:
        fileWrite.write(processConfigLine(line))
    
    fileRead.close()
    fileWrite.close()

    rewriteFilesContent(tmpFileUrl, configFileUrl)

    description = "- Updated to sdk@" + targetSdkVersion + " and components@" + targetComponentVersion + " at config.js file"
    print(description)

def processConfigLine (rawLine):
    outLine = rawLine

    # current line defines sdk version?
    sdkRegex = r"mind-sdk@(\d\.?)+"
    sdkPrefix = "mind-sdk@" + targetSdkVersion
    isSdkLine = re.search(sdkRegex, rawLine)

    # current line defines component version?
    componentRegex = r"mind-game-components@(\d\.?)+"
    componentPrefix = "mind-game-components@" + targetComponentVersion
    isComponentLine = re.search(componentRegex, rawLine)

    if isSdkLine:
        outLine = re.sub(sdkRegex, sdkPrefix, outLine)
    elif isComponentLine:
        outLine = re.sub(componentRegex, componentPrefix, outLine)

    return outLine
#endregion

# Package file related
#region

# process package file
def processPackageFile ():
    tmpFileUrl = ".tmp." + packageFileUrl
    fileWrite = open(tmpFileUrl, "w+")
    fileRead = open(packageFileUrl, "r")

    fileLines = fileRead.readlines()
    for line in fileLines:
        fileWrite.write(processPackageLine(line))

    fileRead.close()
    fileWrite.close()

    rewriteFilesContent(tmpFileUrl, packageFileUrl)

    description = "- Updated to sdk@" + targetSdkVersion + " and components@" + targetComponentVersion + " at package.json file"
    print(description)

def processPackageLine (rawLine):
    outLine = rawLine

    # current line defines sdk version?
    sdkRegex = r"\"mind-sdk\"\s*:\s*\"(\d\.?)+\""
    newSdk = "\"mind-sdk\": \"" + targetSdkVersion + "\""
    isSdkLine = re.search(sdkRegex, rawLine)

    # current line defines component version?
    componentRegex = r"\"mind-game-components\"\s*:\s*\"(\d\.?)+\""
    newComponent = "\"mind-game-components\": \"" + targetComponentVersion +"\""
    isComponentLine = re.search(componentRegex, rawLine)

    optionsRegex = r"\"testHarnessOptions\"\s*:\s*{"
    newOptions = "\"testHarnessOptions\": {\n\t\t\t\"themeVersion\": 2,"
    isOptionLine = re.search(optionsRegex, rawLine)

    themeVersionRegex = r"themeVersion"
    isThemeVersion = re.search(themeVersionRegex, rawLine)

    if isSdkLine:
        outLine = re.sub(sdkRegex, newSdk, outLine)
    elif isComponentLine:
        outLine = re.sub(componentRegex, newComponent, outLine)
    elif isOptionLine:
        outLine = re.sub(optionsRegex, newOptions, rawLine)
    elif isThemeVersion:
        outLine = "" # if theme version was already added, then ignore this line since it will be added at testHarnessOptions line

    return outLine
#endregion

# Process game json file:
#region
def processGameJsonFile ():
    tmpFileUrl = ".tmp." + gameName + ".json"
    fileWrite = open(tmpFileUrl, "w+")
    fileRead = open(gameJsonFileUrl, "r")
    fileLines = fileRead.readlines()
    for line in fileLines:
        fileWrite.write(processGameJsonLine(line))

    fileRead.close()
    fileWrite.close()

    rewriteFilesContent(tmpFileUrl, gameJsonFileUrl)

    description = "- Updated to sdk@" + targetSdkVersion + " at " + gameName + ".json file"
    print(description)

def processGameJsonLine (rawLine):
    outLine = rawLine

    sdkBundleRegex = r"\"sdkBundleFile\"\s*:\s*\".*\""
    isSdkBundleFileLine = re.search(sdkBundleRegex, rawLine)
    newSdkBundle = "\"sdkBundleFile\": \"/pilot/sdk/mind-sdk-" + targetSdkVersion + ".js\",\n"
    newSdkBundle += "\t\"themeVersion\": 2.0"


    # current line defines sdk version?
    sdkRegex = r"\"mind-sdk\"\s*:\s*\".*\""
    newSdk = "\"mind-sdk\": \"mind:mind-sdk@" + targetSdkVersion + "\""
    isSdkLine = re.search(sdkRegex, rawLine)

    themeVersionRegex = r"themeVersion"
    isThemeVersion = re.search(themeVersionRegex, rawLine)

    if isSdkBundleFileLine:
        outLine = re.sub(sdkBundleRegex, newSdkBundle, outLine)
    elif isSdkLine:
        outLine = re.sub(sdkRegex, newSdk, outLine)
    elif isThemeVersion:
        outLine = "" # if theme version was already added, then ignore this line since it will be added at testHarnessOptions line

    return outLine
#endregion

# Game file related
#region
def processGameFile ():
    tmpFileUrl = ".tmp." + gameName + ".js"
    fileWrite = open(tmpFileUrl, "w+")
    fileRead = open(gameFileUrl, "r")

    fileLines = fileRead.readlines()
    alreadyProcessed = False

    # check that this file has not been already processed
    for line in fileLines:
        alreadyProcessed = re.search(r"getDefaultComponentThemeData", line)
        # do nothing else this file it seems to be already processed...
        if (alreadyProcessed):
            fileWrite.close()
            fileRead.close()
            os.remove(tmpFileUrl)
            description = "- File " + gameName + ".js has implemented getDefaultComponentThemeData method (it seems to be already updated) so this file won't be modified"
            print(description)
            return

    print("- Removing mind-component styles from " + gameName + ".js file")
    for line in fileLines:
        fileWrite.write(processGameLine(line))

    fileRead.close()
    fileWrite.close()

    rewriteFilesContent(tmpFileUrl, gameFileUrl)

def processGameLine (rawLine):
    outLine = rawLine

    if (isImportLine(rawLine) and isStyleLine(rawLine) and isFromMindComponents(rawLine)):
        outLine = processStyleImport(rawLine)
    elif (isGameThemeImport(rawLine)):
        newGameThemeImport = "import { gameStyles, componentStyles, localeOverrides } from \'./" + gameName + "Theme\';"
        outLine = "// " + rawLine + newGameThemeImport + " // added automatically \n"
    elif (isInsideThemeMethod(rawLine)):
        if (isThemeMethodStart(rawLine)):
            newThemeMethods = "\tstatic getDefaultThemeData () { return [ gameStyles ]; }\n\n"
            newThemeMethods += "\tstatic getDefaultComponentThemeData () { return [ componentStyles ]; }\n\n"

            outLine = newThemeMethods + "//\t(Removed automatigically) \n//" + rawLine
        else:
            outLine = "// " + rawLine

    return outLine

def processStyleImport (rawLine):
    importedSymbols = re.search(r"{.*}", rawLine).group() # returns the part of the string where there was a match
    print(" - - Commenting style: " + importedSymbols)
    lineCharacters = re.search(r"[_a-zA-Z$].*", rawLine).group() # line without new-line character

    if (isComma(importedSymbols)):
        symbolName = extractFromMultipleImportedSymbols(importedSymbols)
        if (symbolName):
            return rawLine.replace(lineCharacters, re.sub(r",.*as\s*" + symbolName, "", lineCharacters) + " // commented ( styles as " + symbolName + ")")
        else:
            return rawLine

    else:
        symbolName = extractImportedSymbol(importedSymbols)
        return "// " + rawLine.replace(lineCharacters, lineCharacters + " // removed (" + symbolName + ")")

# this functions extracts name of imported symbol if the symbol references a typical MIND style object
# expects a string with format: { styles as defaultCardStyle }
def extractImportedSymbol(lineStr):
    if (isAsKeyword(lineStr)):
        symbolsStr = re.sub(r"[{}\s]", "", lineStr)
        vSymbols = re.split("as", symbolsStr)
        return vSymbols[1]
    return lineStr


# this functions extracts name of imported symbol if the symbol references a typical MIND style object
# expects a string with format: import { Jiji, styles as jijiStyles }
def extractFromMultipleImportedSymbols (lineStr):
    vCommaSeparated = re.split(",", re.sub(r"[{}]", "", lineStr))
    for symbolsStr in vCommaSeparated:
        if (isStyleLine(symbolsStr) and isAsKeyword(symbolsStr)):
            return re.sub(r"\s", "", re.split(r"\s+as\s+", symbolsStr)[1])
    return None

prevWasInside = False
isInside = False
leftCurlyBraceCount = 0
def isInsideThemeMethod (lineStr):
    global leftCurlyBraceCount
    global isInside
    global prevWasInside
    if (isThemeMethodStart(lineStr)):
        leftCurlyBraceCount = 1
        isInside = True
        return isInside
    elif (leftCurlyBraceCount > 0):
        prevWasInside = leftCurlyBraceCount > 0
        leftCurlyBraceCount += getLeftCurlyBraceCount(lineStr)
        leftCurlyBraceCount -= getRightCurlyBraceCount(lineStr)
        isInside = leftCurlyBraceCount > 0
        return (leftCurlyBraceCount > 0) or prevWasInside

def getLeftCurlyBraceCount (lineStr):
    regex = r"\{"
    return len(re.findall(regex, lineStr))

def getRightCurlyBraceCount (lineStr):
    regex = r"\}"
    return len(re.findall(regex, lineStr))

def isThemeMethodStart (lineStr):
    regex = r"static\s+getDefaultThemeData\s+\(\)\s+\{?"
    return re.search(regex, lineStr)

def isGameThemeImport (lineStr):
    regex = r"" + gameName + "Theme"
    return re.search(regex, lineStr)

def isImportLine (lineStr):
	regex = r"^\s*import"
	return re.search(regex, lineStr)

def isStyleLine (lineStr):
	regex = r"styles"
	return re.search(regex, lineStr)

def isFromMindComponents (lineStr):
	regex = r"mind-game-components\/"
	return re.search(regex, lineStr)

def isComma (lineStr):
	regex = r","
	return re.search(regex, lineStr)

def isAsKeyword (lineStr):
    regex = r"\s+as\s+"
    return re.search(regex, lineStr)


#endregion

# Utils
#region
def rewriteFilesContent (fromFileUrl, toFileUrl, deleteFrom = True):
    readFile = open(fromFileUrl, "r")
    writeFile = open(toFileUrl, "w")

    writeFile.write(readFile.read())

    writeFile.close()
    readFile.close()

    if deleteFrom:
        os.remove(fromFileUrl)
#endregion

def main():
    print("\n======== Migrating to Theme Engine 2.0 ========\n")
    processConfigFile()
    processPackageFile()
    processGameJsonFile()
    processGameFile()
    print("\nWARNING: Please note that " + gameName + "Theme.js file won't be modified by this script, please check references and continue the migration manually")

if __name__ == "__main__":
    main()