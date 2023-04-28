//This script is equals to: "rm -R dist && mkdir dist && cp -R public/* dist/"

const fs = require('fs')
const path = require('path')
const directoryTarget = 'dist'
const directorySource = 'public'

function removeDirectory(target){
    if (fs.existsSync(target)){
        fs.rm(target, {recursive: true})
    }
}

function copyFileSync(source, target){
    let targetFile = target
    if (fs.existsSync(target)){
        if (fs.lstatSync(target).isDirectory()){
            targetFile = path.join(target, path.basename(source))
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source))
}

function createDirectoryIfNotExists(directory){
    if(!fs.existsSync(directory))
        fs.mkdirSync(directory)
}

function copyFolderRecursiveSync(source, target){
    createDirectoryIfNotExists(target)

    if(fs.lstatSync(source).isDirectory()){
        const files = fs.readdirSync(source)
        files.forEach(function(file) {
            const curSource = path.join(source, file)
            if (fs.lstatSync(curSource).isDirectory()){
                const curTarget = path.join(target, file)
                copyFolderRecursiveSync(curSource, curTarget)
            }
            else{
                copyFileSync(curSource, target)
            }
        })
    }
}


removeDirectory(directoryTarget)
copyFolderRecursiveSync(directorySource, directoryTarget)