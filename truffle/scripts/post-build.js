var fs = require('fs');
var path = require('path');
var dir = path.dirname('build/contracts/Migrations.json');
const listIncludes=["Proy"];
function isIncludes(str){
    for(var i=0;i<listIncludes.length;i++){
        if(str.includes(listIncludes[i])){
        return true;
        }
    }
    return false;
}
var files = fs.readdirSync(dir).filter(isIncludes ); 
for (const iterator of files) {
    const secondDir = path.resolve("../app/src/assets/scripts/");
    const file=fs.readFileSync(path.join(dir, iterator), 'utf8');
    console.log(`${secondDir}\\${iterator.split(".")?.[0]}.js`);
    fs.writeFileSync(`${secondDir}\\${iterator.split(".")?.[0]}.js` ,`var ${iterator.split(".")?.[0]}=${file}`,{flag:'w+'});
}
