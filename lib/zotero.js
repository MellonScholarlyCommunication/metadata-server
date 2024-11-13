const logger = require('ldn-inbox-server').getLogger();
const { memento } = require('memento-cli');
const { backOff_fetch } = require('ldn-inbox-server');

async function zoteroLookup(url,options) {
    return new Promise( async (resolve,reject) => {
        try {
            if (! options.service) {
                throw new Error('No zotero_service environment defined');
            }

            const data = await zotoreSingleWithFallback(url,options);

            if (! data) {
                return reject(new Error('EMPTY - no data returned'));
            }

            if (! options.format || options.format == 'zotero') {
                return resolve(data);
            }

            const result = await zoteroFormat(data,options);
           
            resolve(result);
        }
        catch (e) {
            logger.error(`zotero lookup failed`);
            logger.debug(e);
            return reject(new Error(`EFAIL - zotero connection failed`));
        }
    });
}

async function zotoreSingleWithFallback(url,options) {
    return new Promise( async (resolve,reject) => {
        try {
            const result = await zoteroSingle(url,options);
            resolve(result);
        }
        catch (e) {
            if (!options.fallback) {
                return reject(e);
            }

            logger.info(`failed ${url} .. searching for a memento`);
            const lm = await latestMemento(url,options);
        
            if (!lm) {
                logger.error(`no memento found for ${url}`);
                reject(e);
            }
            else {
                logger.info(`memento ${url} => ${lm.memento}`);
            }

            const result = await zoteroSingle(lm.memento,options);
           
            if (result) {
                result[0]['url'] = url;
                result[0]['memento'] = lm.memento;
                resolve(result);
            }
            else {
                resolve(null);
            }
        }
    });
}

async function latestMemento(url,options) {
    const result = await memento(url,{
        base: options.timemapBase
    });

    if (result) {
        return result.at(-1);
    }
    else {
        return null;
    }
}

async function zoteroSingle(url,options) {
    return new Promise( async (resolve,reject) => {
        logger.info(`posting ${url} to ${options.service}/web`);

        const response = await backOff_fetch(`${options.service}/web?single=1`, { 
            method: 'POST' ,
            body: url,
            headers: {
                "Content-Type" : "text/plain"
            }
        });

        if (response.ok) {
            resolve(await response.json());
        }
        else {
            logger.error(`Zotero returned ${response.status} - ${response.statusText}`);
            const error = await response.text();
            return reject(new Error(`ELOOKUP - ${error}`));
        }
    });
}

async function zoteroFormat(data, options) {
    return new Promise( async (resolve,reject) => {
        logger.info(`posting zotero response to ${options.service}/export?format=${options.format}`);
        logger.debug(data);

        const response = await backOff_fetch(`${options.service}/export?format=${options.format}`, { 
            method: 'POST' ,
            body: JSON.stringify(data) , 
            headers: {
                "Content-Type" : options.type
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (data[0]['memento']) {
                result[0]['memento'] = data[0]['memento'];
            }
            return resolve(result);
        }
        else {
            logger.error(`zotero returned ${response.status} - ${response.statusText}`);
            const error = await response.text();
            return reject(new Error(`EFORMAT - ${error}`));
        }
    });
}

module.exports = { zoteroLookup };