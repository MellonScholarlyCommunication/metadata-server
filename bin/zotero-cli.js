#!/usr/bin/env node

const { program } = require('commander')
const { zoteroLookup } = require('../lib/zotero');
require('dotenv').config();

const ZOTERO_SERVICE = process.env.ZOTERO_SERVICE ?? 'http://127.0.0.1:1969';
const ZOTERO_FORMAT = process.env.ZOTERO_FORMAT ?? 'csljson';
const ZOTERO_CONTENT_TYPE = process.env.ZOTERO_CONTENT_TYPE ?? 'applicaiton/json';
const ZOTERO_FALLBACK = process.env.ZOTERO_FALLBACK ? (/true/).test(process.env.ZOTERO_FALLBACK) : false;

program
  .name('zotero-cli')
  .description('CLI to Memento')
  .option('--service <service>','Zotero Service',ZOTERO_SERVICE)
  .option('--format <format>','Zotero Format',ZOTERO_FORMAT)
  .option('--type <content_type>','Content Type',ZOTERO_CONTENT_TYPE)
  .option('-f,--fallback','Memento Fallback',ZOTERO_FALLBACK)
  .option('-tmb,--timemapBase <base>','Memento Base')
  .argument('<url>', 'url to fetch')
  .action( async (url, options) => {
    try {
        const response = await zoteroLookup(url, options);
        console.log(JSON.stringify(response,null,2));
    }
    catch (e) {
        console.error(`error: ${e.message}`);
    }
  });

program.parse();