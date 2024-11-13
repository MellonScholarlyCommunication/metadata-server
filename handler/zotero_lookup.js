const logger = require('ldn-inbox-server').getLogger();
const { zoteroLookup } = require('../lib/zotero');
const fsPath = require('path');
const fs = require('fs');
const md5 = require('md5');

/**
 * Handler to lookup an artifact url against Zotero and store the
 * result as a service result file 
 */
async function handle({path,options,config,notification}) {
    logger.info(`parsing notification ${path}`);

    try {
        const artifact_id = notification['object']['id'];

        const reference = await zoteroLookup(artifact_id, {
            service: process.env.ZOTERO_SERVICE,
            format: process.env.ZOTERO_FORMAT,
            type: process.env.ZOTERO_CONTENT_TYPE,
            fallback: process.env.ZOTERO_FALLBACK === 'true' ? true : false 
        });

        if (! reference) {
            logger.error(`failed to find metadata for ${artifact_id}`);
            return { path, options, success: true };
        }

        const date = getDate();

        const filePath = fsPath.resolve(options['public'],'result',date,`${md5(artifact_id)}.json`);

        ensureDirectoryExistence(filePath);

        fs.writeFileSync(filePath,JSON.stringify(reference,null,2));

        const zotero_content_type = process.env.ZOTERO_CONTENT_TYPE || 'application/json';

        fs.writeFileSync(`${filePath}.meta`, JSON.stringify({
            'Content-Type': zotero_content_type
        },null,2), { });

        logger.info(`generated ${filePath}`);

        options['service_result'] = `${options['base']}/result/${date}/${md5(artifact_id)}.json`;
        
        logger.info(`service result: ${options['service_result']}`);

        return { path, options, success: true };
    }
    catch(e) {
        logger.error(`failed to process ${path}`);
        logger.error(e);
        options['service_error'] = e.message;
        // Return a true in order to send the correct error message
        return { path, options, success: true };
    }
}

function ensureDirectoryExistence(filePath) {
    var dirname = fsPath.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function getDate() {
    const dateObj = new Date();
    const year  = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const day   = dateObj.getUTCDate();

    const pMonth        = month.toString().padStart(2,"0");
    const pDay          = day.toString().padStart(2,"0");
    const newPaddedDate = `${year}/${pMonth}/${pDay}`;

    return newPaddedDate;
}

module.exports = { handle };