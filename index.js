'use strict';
//const ncp = require('ncp').ncp;
const fs = require('fs-extra');

const del = require('del');
const path = require('path');
const clc = require('cli-color');

// remove first character if it's the asp.net path tilde
function cleanPublicPath(publicPath) {
    if (publicPath.startsWith("~")) {
        return publicPath.substring(1);
    }
    return publicPath;
}

function WebPackDeployAfterBuild(options) {
    var defaultOptions = {
        clearDestDir: false,
    };

    this.options = Object.assign(defaultOptions, options);
}

WebPackDeployAfterBuild.prototype.apply = function(compiler) {
    const options = this.options;

    compiler.plugin("done", (stats) => {
        console.log(Object.keys(stats.compilation.assets));
        console.log("\nExecuting Deploy on done...");

        for (var i = 0, len = options.to.length; i < len; i++) {

            var to = options.to[i];
            if (options.suffixPublicPath)
                to = path.join(options.to[i], cleanPublicPath(compiler.options.output.publicPath));

            
            if (options.clearDestDir) {
                del.sync([`${options.to[i]}/*`], { force: true });
            }

            fs.copy(options.from, to, { overwrite :true})
                .then(() => console.log(`Finished deploying to: ${clc.cyan(to)}`))
                .catch(err => console.error(err));
        }

    });
};

module.exports = WebPackDeployAfterBuild;
