var fs = require('fs');

if (process.argv.length < 4)
{
    console.error("Missing arguments.");
    console.log("Usage:");
    console.log("    node CompileSass.js srcFilename compilerFilename");
    process.exit();
}

var srcFilename = process.argv[2];
var dstFilename = process.argv[3];

var sass = require('npm-sass')(srcFilename, function(err, result){
    if (err){
        console.error(err);
        console.error("SCSS file compile failed");
        process.exit(-1);
    } else {
        fs.writeFileSync(dstFilename, result.css);
    }
});
